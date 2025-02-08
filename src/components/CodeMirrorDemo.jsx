import React, { Component } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { evalCode } from "./tool";
import { andromedaInit } from '@uiw/codemirror-theme-andromeda';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html'


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
            <div
                style={{
                    display: "flex",
                    height: "100%",
                    maxHeight: "80vh",
                    position: "relative"
                }}
            >
                <button
                    onClick={this.evalCode}
                    style={{ position: "absolute", right: 10, top: 0, zIndex: 999 }}
                >
                    运行
                </button>
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
                />
                <div style={{ width: "50%", background: "#fff" }}>
                    {/* 仅在点击运行按钮后渲染 FileTest 组件和 codeComponent 结果 */}
                    {isRunClicked && (
                        <>
                            {codeComponent ? React.createElement(codeComponent) : null}
                        </>
                    )}
                </div>
            </div>
        );
    }
}