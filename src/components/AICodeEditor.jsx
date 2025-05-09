import React from "react";
import { Tabs, TabPane, Button, Modal } from '@douyinfe/semi-ui';
import { invoke } from "@tauri-apps/api/core";
import FileTree from './FileTree';
import CodeEditor from './CodeEditor';
import Preview from './Preview';
import AIChat from './AIChat';

export default function AICodeEditor() {
    const [code, setCode] = React.useState("");
    const [isRunClicked, setIsRunClicked] = React.useState(false);
    const [tabList, setTabList] = React.useState([]);
    const [activeTabKey, setActiveTabKey] = React.useState(null);
    const [terminalInfo, setTerminalInfo] = React.useState("");
    const [visible, setVisible] = React.useState(false);
    const [modelName, setModelName] = React.useState("DeepSeek-R1");
    const [messages, setMessages] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCommentLoading, setIsCommentLoading] = React.useState(false);

    const handleFileSelect = (fileName, fileContent) => {
        const existingTabIndex = tabList.findIndex(t => t.itemKey === fileName);
        if (existingTabIndex === -1) {
            const newTabList = [...tabList, {
                tab: fileName,
                itemKey: fileName,
                text: fileContent,
                closable: true
            }];
            setTabList(newTabList);
            setActiveTabKey(fileName);
            setCode(fileContent);
        } else {
            setActiveTabKey(fileName);
            setCode(fileContent);
        }
    };

    const closeTab = (key) => {
        const newTabList = [...tabList];
        const closeIndex = newTabList.findIndex(t => t.itemKey === key);
        newTabList.splice(closeIndex, 1);

        let newActiveTabKey = activeTabKey;
        if (key === newActiveTabKey) {
            if (newTabList.length > 0) {
                newActiveTabKey = newTabList[0].itemKey;
            } else {
                newActiveTabKey = null;
            }
        }

        setTabList(newTabList);
        setActiveTabKey(newActiveTabKey);
        setCode(newTabList.find(t => t.itemKey === newActiveTabKey)?.text || "");
    };

    const handleTabChange = (key) => {
        const selectedTab = tabList.find(t => t.itemKey === key);
        if (selectedTab) {
            setActiveTabKey(key);
            setCode(selectedTab.text);
        }
    };

    const handleCodeChange = (value) => {
        const newTabList = [...tabList];
        const currentTabIndex = newTabList.findIndex(t => t.itemKey === activeTabKey);
        if (currentTabIndex !== -1) {
            newTabList[currentTabIndex].text = value;
        }
        setCode(value);
        setTabList(newTabList);
    };

    const handleRun = () => {
        setIsRunClicked(true);
        setTerminalInfo("正在运行...");
    };

    const handlePreviewError = (errorMessage) => {
        setTerminalInfo(`错误: ${errorMessage}`);
    };

    const handlePreviewSuccess = () => {
        setTerminalInfo("运行成功！");
    };

    const handleComment = async () => {
        if (!activeTabKey) return;

        try {
            setIsCommentLoading(true);

            const result = await invoke('call_llm_command', {
                prompt: `请为以下代码添加详细注释，要求：
                1. 保持原有代码结构不变
                2. 仅返回注释后的代码
                3. 不要包含任何Markdown格式标记
                4. 使用中文注释
                代码内容：\n${code}`,
                modelName: 'gpt-3.5-turbo'
            });

            if (!result || !result.choices || !result.choices[0] || !result.choices[0].message) {
                throw new Error('Invalid API response format');
            }

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

            setCode(cleanCode);
            setTabList(newTabList);
        } catch (error) {
            console.error('生成注释失败:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: `生成注释失败: ${error.message || '未知错误'}`,
                time: new Date().toLocaleTimeString()
            }]);
        } finally {
            setIsCommentLoading(false);
        }
    };

    const handleSendMessage = async (content) => {
        try {
            setMessages(prev => [...prev, {
                role: 'user',
                content,
                time: new Date().toLocaleTimeString()
            }]);
            setIsLoading(true);

            const result = await invoke('call_llm_command', {
                prompt: content,
                modelName: modelName
            });

            if (!result || !result.choices || !result.choices[0] || !result.choices[0].message) {
                throw new Error('Invalid API response format');
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: result.choices[0].message.content,
                time: new Date().toLocaleTimeString()
            }]);
        } catch (err) {
            console.error('AI request failed:', err);
            setMessages(prev => [...prev, {
                role: 'system',
                content: `请求失败: ${err.message || '未知错误'}`,
                time: new Date().toLocaleTimeString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = tabList.length === 0;

    return (
        <div style={{ display: "flex", height: "100vh", margin: 0, padding: 0, boxSizing: "border-box" }}>
            <div style={{ width: "20%", height: "100%" }}>
                <FileTree onFileSelect={handleFileSelect} />
            </div>
            <div style={{ width: "80%", display: "flex", flexDirection: "column", border: "3px solid #393c43" }}>
                <Tabs
                    type="card"
                    activeKey={activeTabKey}
                    onTabClose={closeTab}
                    onChange={handleTabChange}
                    style={{ background: "#23262e" }}
                    contentStyle={{ height: "60vh" }}
                    tabBarExtraContent={
                        <>
                            <Button
                                onClick={handleComment}
                                disabled={isButtonDisabled}
                                loading={isCommentLoading}
                                style={{ color: "white", marginRight: "10px" }}
                            >
                                代码注释
                            </Button>
                            <Button
                                onClick={() => setVisible(true)}
                                style={{ color: "white", marginRight: "10px" }}
                            >
                                AI辅助
                            </Button>
                            <Button
                                onClick={handleRun}
                                style={{ color: "white" }}
                                disabled={isButtonDisabled}
                            >
                                运行
                            </Button>
                        </>
                    }
                >
                    {tabList.map(t => (
                        <TabPane closable={t.closable} tab={t.tab} itemKey={t.itemKey} key={t.itemKey}>
                            <CodeEditor
                                code={code}
                                onChange={handleCodeChange}
                                isLoading={isCommentLoading}
                            />
                        </TabPane>
                    ))}
                </Tabs>
                <div style={{
                    height: "35vh",
                    maxHeight: '35vh',
                    background: "#23262e",
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
                            <div style={{
                                background: "#23262e",
                                height: "100%",
                                overflow: "auto"
                            }}>
                                <pre style={{
                                    whiteSpace: 'pre-wrap',
                                    padding: 10,
                                    color: '#fff',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    margin: 0
                                }}>
                                    {terminalInfo || '等待运行...'}
                                </pre>
                            </div>
                        </TabPane>
                        <TabPane tab="预览" itemKey="2">
                            {isRunClicked && <Preview
                                code={code}
                                onError={handlePreviewError}
                                onSuccess={handlePreviewSuccess}
                            />}
                        </TabPane>
                    </Tabs>
                </div>
            </div>
            <Modal
                title="AI辅助"
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
                closeOnEsc={true}
                footer={null}
                style={{
                    width: "80vw",
                    height: "70vh",
                    maxWidth: 1200,
                    maxHeight: 800
                }}
                headerStyle={{
                    borderBottom: 'none'
                }}
                bodyStyle={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(70vh - 65px)',
                    overflow: 'hidden',
                    borderBottom: 'none'
                }}
            >
                <AIChat
                    messages={messages}
                    isLoading={isLoading}
                    modelName={modelName}
                    onModelChange={setModelName}
                    onSendMessage={handleSendMessage}
                />
            </Modal>
        </div>
    );
}    