import React, { Component } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { evalCode } from "./tool";
import { andromedaInit } from '@uiw/codemirror-theme-andromeda';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';

export default class CodeMirrorDemo extends Component {
    state = {
        code: "",
        codeComponent: null,
        isRunClicked: false // 新增标志位，用于判断是否点击了运行按钮
    };

    async componentDidMount() {
        try {
            // 使用 fetch 获取同目录下 File.jsx 文件的内容
            const response = await fetch("./File.jsx");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // 将响应内容转换为文本格式
            const code = await response.text();
            this.setState({ code });
        } catch (error) {
            console.error("Error fetching the file:", error);
        }
    }

    evalCode = () => {
        const { code } = this.state;
        // 点击运行按钮时，设置 isRunClicked 为 true
        this.setState({
            codeComponent: evalCode(code),
            isRunClicked: true
        });
    };

    render() {
        const { code, codeComponent, isRunClicked } = this.state;
        return (
            <div style={{ display: "flex", height: "100vh", margin: 0, padding: 0, boxSizing: "border-box" }}>
                {/* 左侧文件管理模块区域 */}
                <div style={{ width: "20%", height: "100%", background: "#f0f0f0", padding: 10, boxSizing: "border-box" }}>
                    {/* 这里可以添加文件管理模块的具体内容 */}
                    <h3>文件管理</h3>
                </div>
                {/* 右侧区域 */}
                <div style={{ width: "80%" }}>
                    {/* 代码运行按钮 */}
                    <div style={{ height: "5vh", padding: 10, textAlign: "right", boxSizing: "border-box" }}>
                        <button onClick={this.evalCode}>运行</button>
                    </div>
                    {/* 代码编辑区 */}
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
                            // 括号匹配
                            matchBrackets: true,
                            // tab缩进
                            tabSize: 2,
                        }}
                        onChange={(value) => {
                            // 直接使用 value 参数更新 state 中的 code
                            this.setState({ code: value });
                        }}
                        style={{ flex: 1, boxSizing: "border-box" }}
                        maxHeight='60vh'
                        height="60vh"
                    />
                    {/* 运行结果展示区域 */}
                    <div style={{ flex: 1, height: "35vh", maxHeight: '35vh', background: "#fff", boxSizing: "border-box", overflow: "auto" }}>
                        {/* 仅在点击运行按钮后渲染codeComponent 结果 */}
                        {isRunClicked && (
                            <>
                                {codeComponent ? React.createElement(codeComponent) : null}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}