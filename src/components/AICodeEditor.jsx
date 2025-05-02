import React, { Component } from "react";
import { Tabs, TabPane, Button, Modal, TextArea, Select, Spin } from '@douyinfe/semi-ui';
import CodeMirror from "@uiw/react-codemirror";
import { evalCode } from "./tool";
import { andromedaInit } from '@uiw/codemirror-theme-andromeda';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { Treebeard } from "react-treebeard";
import { invoke } from "@tauri-apps/api/core";
import { ErrorBoundary } from "react-error-boundary";
const convertToFileTree = (item) => {
    const newItem = {
        name: item.name,
    };

    if (item.is_directory && item.children.length > 0) {
        newItem.children = item.children.map(convertToFileTree);
    }

    return newItem;
};

export default class AICodeEditor extends Component {
    constructor(props) {
        super(props);
        this.messagesEndRef = React.createRef();
    }
    state = {
        code: "",
        isRunClicked: false,
        cursor: null,
        fileTree: null,
        tabList: [],
        activeTabKey: null,
        terminalInfo: "",
        response: "",
        visible: false,
        inputContent: "",
        modelName: "DeepSeek-R1",
        messages: [],
        isLoading: false,
        isCommentLoading: false
    };

    componentDidMount() {
        const fetchFile = async () => {
            try {
                const response = await fetch("./File.jsx");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const code = await response.text();
                this.setState({ code });
            } catch (error) {
                console.error("Error fetching the file:", error);
            }
        };

        fetchFile();

        const fetchFileTree = async () => {
            try {
                // 调用 Rust 端的 list_files_and_directories 函数
                const result = await invoke("list_files_and_directories", { dirPath: "/Users/kkiritoliu/Desktop/项目/AI-code-compiler/public" });
                let convertedChildren;
                if (result && result.children) {
                    convertedChildren = result.children.map(convertToFileTree);
                } else {
                    convertedChildren = [];
                }

                const convertedTree = {
                    name: 'AI-code-compiler',
                    toggled: true,
                    children: convertedChildren
                };
                this.setState({ fileTree: convertedTree });
            } catch (error) {
                console.error("Error fetching file tree:", error);
            }
        };

        fetchFileTree();
    }

    evalCode = () => {
        this.setState({
            isRunClicked: true,
            terminalInfo: ""
        });
    };

    onToggle = async (node, toggled) => {
        const { cursor, data, fileTree } = this.state;
        if (cursor) {
            this.setState(() => ({ cursor: { ...cursor, active: false } }));
        }
        const deactivateAllNodes = (tree) => {
            if (tree.children) {
                tree.children.forEach(child => {
                    child.active = false;
                    deactivateAllNodes(child);
                });
            }
        };
        deactivateAllNodes(fileTree);

        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }
        this.setState(() => ({ cursor: node, data: { ...data }, fileTree: { ...fileTree } }));

        if (!node.children) {
            try {
                const response = await fetch(`./${node.name}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const code = await response.text();
                const existingTabIndex = this.state.tabList.findIndex(t => t.itemKey === node.name);
                if (existingTabIndex === -1) {
                    const newTabList = [...this.state.tabList, { tab: node.name, itemKey: node.name, text: code, closable: true }];
                    this.setState({
                        tabList: newTabList,
                        activeTabKey: node.name,
                        code
                    });
                } else {
                    this.setState({
                        activeTabKey: node.name,
                        code
                    });
                }
            } catch (error) {
                console.error("Error fetching the file:", error);
            }
        }
    };

    close(key) {
        const newTabList = [...this.state.tabList];
        const closeIndex = newTabList.findIndex(t => t.itemKey === key);
        newTabList.splice(closeIndex, 1);

        let newActiveTabKey = this.state.activeTabKey;
        if (key === newActiveTabKey) {
            if (newTabList.length > 0) {
                newActiveTabKey = newTabList[0].itemKey;
            } else {
                newActiveTabKey = null;
            }
        }

        // 递归函数，用于取消对应文件节点的 active 状态
        const deactivateNode = (tree) => {
            if (tree.children) {
                tree.children.forEach(child => {
                    if (child.name === key) {
                        child.active = false;
                    }
                    deactivateNode(child);
                });
            }
        };

        // 递归函数，用于将所有文件节点的 active 状态设置为 false
        const deactivateAllNodes = (tree) => {
            if (tree.children) {
                tree.children.forEach(child => {
                    child.active = false;
                    deactivateAllNodes(child);
                });
            }
        };

        // 递归函数，用于激活对应文件节点的 active 状态
        const activateNode = (tree) => {
            if (tree.children) {
                tree.children.forEach(child => {
                    if (child.name === newActiveTabKey) {
                        child.active = true;
                    }
                    activateNode(child);
                });
            }
        };

        const { fileTree } = this.state;
        deactivateNode(fileTree);
        deactivateAllNodes(fileTree);
        activateNode(fileTree);

        this.setState({
            tabList: newTabList,
            activeTabKey: newActiveTabKey,
            code: newTabList.find(t => t.itemKey === newActiveTabKey)?.text || "",
            fileTree: { ...fileTree }
        });
    }

    onTabChange = (key) => {
        const selectedTab = this.state.tabList.find(t => t.itemKey === key);
        if (selectedTab) {
            const { fileTree } = this.state;
            const findAndUpdateActive = (tree) => {
                if (tree.children) {
                    tree.children.forEach(child => {
                        if (child.name === selectedTab.tab) {
                            child.active = true;
                        } else {
                            child.active = false;
                        }
                        findAndUpdateActive(child);
                    });
                }
            };
            findAndUpdateActive(fileTree);
            this.setState({
                activeTabKey: key,
                code: selectedTab.text,
                fileTree: { ...fileTree }
            });
        }
    };

    errorMessage = "";

    fallbackRender = () => {
        return (
            <div role="alert">
                <p>Something went wrong:</p>
                <pre style={{ color: "red" }}>{this.errorMessage}</pre>
            </div>
        );
    }
    scrollToBottom = () => {
        if (this.messagesEndRef.current) {
            this.messagesEndRef.current.scrollTo({
                top: this.messagesEndRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    handleSubmit = async () => {
        const { inputContent, modelName, messages } = this.state;
        if (!inputContent.trim()) return;

        try {
            this.setState(prev => ({
                messages: [...prev.messages, {
                    role: 'user',
                    content: inputContent,
                    time: new Date().toLocaleTimeString()
                }],
                inputContent: '',
                isLoading: true
            }), () => {
                this.scrollToBottom();
            });

            // 调用 AI 接口
            const result = await invoke('call_llm', {
                prompt: inputContent,
                modelName: modelName
            });

            // 添加 AI 响应
            this.setState(prev => ({
                messages: [...prev.messages, {
                    role: 'assistant',
                    content: result.choices[0].message.content,
                    time: new Date().toLocaleTimeString()
                }],
                isLoading: false
            }), () => {
                this.scrollToBottom();
            });

        } catch (err) {
            this.setState({
                isLoading: false,
                messages: [...messages, {
                    role: 'system',
                    content: `请求失败: ${err.message}`,
                    time: new Date().toLocaleTimeString()
                }],
            }, () => {
                this.scrollToBottom();
            });
        }
    }

    handleComment = async () => {
        const { code, modelName, activeTabKey, tabList } = this.state;
        if (!activeTabKey) return;

        try {
            this.setState({ isCommentLoading: true });

            // 调用 AI 接口生成注释
            const result = await invoke('call_llm', {
                prompt: `请为以下代码添加详细注释，要求：
                1. 保持原有代码结构不变
                2. 仅返回注释后的代码
                3. 不要包含任何Markdown格式标记
                4. 使用中文注释
                代码内容：\n${code}`,
                modelName: 'gpt-3.5-turbo'
            });

            const annotatedCode = result.choices[0].message.content;
            const cleanCode = annotatedCode
                .replace(/```javascript|```jsx?/g, '')
                .replace(/^\s*[\r\n]/gm, '')
                .trim();

            const newTabList = tabList.map(tab => {
                if (tab.itemKey === activeTabKey) {
                    return { ...tab, text: cleanCode };
                }
                return tab;
            });

            this.setState({
                code: annotatedCode,
                tabList: newTabList,
                isCommentLoading: false
            });

        } catch (error) {
            console.error('生成注释失败:', error);
            this.setState({ isCommentLoading: false });
        }
    };

    showDialog = () => {
        this.setState({ visible: true });
    };
    handleOk = () => {
        this.setState({ visible: false });
        console.log('Ok button clicked');
    };
    handleCancel = () => {
        this.setState({ visible: false });
        console.log('Cancel button clicked');
    };
    handleAfterClose = () => {
        console.log('After Close callback executed');
    };

    render() {
        const { code, isRunClicked, fileTree, tabList, activeTabKey, terminalInfo, visible } = this.state;
        const isButtonDisabled = tabList.length === 0;

        const renderCodeComponent = () => {
            if (isRunClicked) {
                const { result, error } = evalCode(code);
                if (error) {
                    this.errorMessage = error.message
                }
                return React.createElement(result);
            }
            return null;
        };

        const footer = (
            <div style={{
                display: 'flex',
                gap: 12,
                padding: '16px 24px',
                borderTop: '1px solid var(--semi-color-border)',
                alignItems: 'center'
            }}>
                <Select
                    defaultValue="DeepSeek-R1"
                    style={{ width: 160 }}
                    disabled={this.state.isLoading}
                    value={this.state.modelName}
                    onChange={value => this.setState({ modelName: value })}
                    position="top"
                >
                    <Select.Option value="DeepSeek-R1">DeepSeek-R1</Select.Option>
                    <Select.Option value="gpt-3.5-turbo">gpt-3.5-turbo</Select.Option>
                    <Select.Option value="gpt-4">gpt-4</Select.Option>
                    <Select.Option value="gpt-4-turbo">gpt-4-turbo</Select.Option>
                    <Select.Option value="hunyuan-t1-latest">hunyuan-t1-latest</Select.Option>
                    <Select.Option value="gemini-1.5-flash-8b">
                        gemini-1.5-flash-8b
                    </Select.Option>
                </Select>

                <div style={{
                    flex: 1,
                    position: 'relative',
                    display: 'flex',
                    gap: 8
                }}>
                    <TextArea
                        value={this.state.inputContent}
                        onChange={value => this.setState({ inputContent: value })}
                        autosize={{ minRows: 1, maxRows: 4 }}
                        placeholder="输入代码问题..."
                        onEnterPress={(e) => {
                            e.preventDefault();
                            this.handleSubmit();
                            this.setState({ inputContent: '' });
                        }}
                        style={{ flex: 1 }}
                    />
                    <Button
                        theme="solid"
                        type="primary"
                        loading={this.state.isLoading}
                        onClick={() => this.handleSubmit()}
                        style={{
                            height: 32,
                            alignSelf: 'center'
                        }}
                    >
                        发送
                    </Button>
                </div>
            </div>
        );

        return (
            <div style={{ display: "flex", height: "100vh", margin: 0, padding: 0, boxSizing: "border-box" }}>
                <div style={{ width: "20%", height: "100%", background: "#23262e", padding: 10, boxSizing: "border-box" }}>
                    {fileTree && <Treebeard data={fileTree} onToggle={this.onToggle} />}
                </div>
                <div style={{ width: "80%", display: "flex", flexDirection: "column", border: "3px solid #393c43" }}>
                    <Tabs
                        type="card"
                        activeKey={activeTabKey}
                        onTabClose={this.close.bind(this)}
                        onChange={this.onTabChange}
                        style={{ background: "#23262e" }}
                        contentStyle={{ height: "60vh" }}
                        tabBarExtraContent={
                            <>
                                <Button
                                    onClick={this.handleComment}
                                    disabled={isButtonDisabled}
                                    loading={this.state.isCommentLoading}
                                    style={{ color: "white", marginRight: "10px" }}
                                >
                                    代码注释
                                </Button>
                                <Button onClick={this.showDialog} style={{ color: "white", marginRight: "10px" }}>AI辅助</Button>
                                <Button onClick={this.evalCode} style={{ color: "white" }} disabled={isButtonDisabled}>运行</Button></>
                        }
                    >
                        {tabList.map(t => (
                            <TabPane closable={t.closable} tab={t.tab} itemKey={t.itemKey} key={t.itemKey}>
                                <Spin
                                    spinning={this.state.isCommentLoading}
                                    tip="AI正在生成注释..."
                                    style={{
                                        height: '100%',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <div style={{ height: '60vh' }}>
                                        <CodeMirror
                                            value={code}
                                            theme={andromedaInit({
                                                settings: {
                                                    caret: '#c6c6c6',
                                                    fontFamily: 'monospace',
                                                    fontSize: '18px',
                                                }
                                            })}
                                            extensions={[javascript({ jsx: true }), html()]}
                                            options={{
                                                mode: "jsx",
                                                matchBrackets: true,
                                                tabSize: 2,
                                            }}
                                            onChange={(value) => {
                                                const newTabList = [...tabList];
                                                const currentTabIndex = newTabList.findIndex(t => t.itemKey === activeTabKey);
                                                if (currentTabIndex !== -1) {
                                                    newTabList[currentTabIndex].text = value;
                                                }
                                                this.setState({
                                                    code: value,
                                                    tabList: newTabList
                                                });
                                            }}
                                            style={{ flex: 1, boxSizing: "border-box" }}
                                            maxHeight='60vh'
                                            height="60vh"
                                        />
                                    </div>
                                </Spin>
                            </TabPane>
                        ))}
                    </Tabs>
                    <div style={{
                        height: "35vh",
                        maxHeight: '35vh',
                        background: "#fff",
                        boxSizing: "border-box",
                        overflow: "auto",
                        border: "3px solid #393c43",
                        display: "flex",
                    }}>
                        <Tabs
                            style={{ background: "#23262e", width: "100%" }}
                            defaultActiveKey="1"
                            tabBarStyle={{ paddingLeft: "10px" }}
                        >
                            <TabPane tab="终端" itemKey="1">
                                <pre style={{ whiteSpace: 'pre-wrap', padding: 10 }}>{this.errorMessage || terminalInfo}</pre>
                            </TabPane>
                            <TabPane tab="预览" itemKey="2">
                                <ErrorBoundary
                                    fallbackRender={this.fallbackRender}
                                    onReset={() => {
                                        this.errorMessage = '';
                                    }}
                                    resetKeys={[code]}
                                >
                                    <div style={{
                                        background: "white",
                                        width: "100%",
                                        height: "29vh",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        overflow: "auto"
                                    }}>
                                        {renderCodeComponent()}
                                    </div>
                                </ErrorBoundary>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                <Modal
                    title="AI辅助"
                    visible={visible}
                    onOk={this.handleOk}
                    afterClose={this.handleAfterClose}
                    onCancel={this.handleCancel}
                    closeOnEsc={true}
                    footer={footer}
                    style={{
                        width: "80vw",
                        height: "70vh",
                        maxWidth: 1200,
                        maxHeight: 800
                    }}
                    bodyStyle={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: 'calc(70vh - 65px)',
                        overflow: 'hidden'
                    }}
                >
                    <div
                        ref={this.messagesEndRef}
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: 20,
                        }}>
                        {this.state.messages.map((msg, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                marginBottom: 16
                            }}>
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '12px 16px',
                                    borderRadius: msg.role === 'user' ?
                                        '12px 12px 0 12px' : '12px 12px 12px 0',
                                    backgroundColor: msg.role === 'user' ?
                                        'var(--semi-color-primary)' : '#fff',
                                    color: msg.role === 'user' ? '#fff' : '#333',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{
                                        fontSize: 12,
                                        color: msg.role === 'user' ? 'rgba(255,255,255,0.8)' : '#666',
                                        marginBottom: 4
                                    }}>
                                        {msg.role === 'user' ? 'You' : 'AI Assistant'}
                                    </div>
                                    <pre style={{
                                        whiteSpace: 'pre-wrap',
                                        margin: 0,
                                    }}>{msg.content}</pre>
                                </div>
                                <span style={{
                                    fontSize: 12,
                                    color: '#999',
                                    marginTop: 4
                                }}>{msg.time}</span>
                            </div>
                        ))}
                        {this.state.isLoading && (
                            <div style={{
                                textAlign: 'center',
                                padding: 16,
                                color: '#666'
                            }}>
                                <Spin /> 思考中...
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        );
    }
}    