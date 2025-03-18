import React, { Component } from "react";
import { Tabs, TabPane, Button } from '@douyinfe/semi-ui';
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
    state = {
        code: "",
        isRunClicked: false,
        cursor: null,
        fileTree: null,
        tabList: [],
        activeTabKey: null,
        terminalInfo: ""
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
                const result = await invoke("list_files_and_directories", { dirPath: "D:\\毕设\\AI-code-compiler\\AI-code-compiler\\public" });
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

    render() {
        const { code, isRunClicked, fileTree, tabList, activeTabKey, terminalInfo } = this.state;
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
                            <Button onClick={this.evalCode} style={{ color: "white" }} disabled={isButtonDisabled}>运行</Button>
                        }
                    >
                        {tabList.map(t => (
                            <TabPane closable={t.closable} tab={t.tab} itemKey={t.itemKey} key={t.itemKey}>
                                <div>
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
            </div>
        );
    }
}    