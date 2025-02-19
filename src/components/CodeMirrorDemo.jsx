import React, { Component } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { evalCode } from "./tool";
import { andromedaInit } from '@uiw/codemirror-theme-andromeda';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { Treebeard } from "react-treebeard";
import { invoke } from "@tauri-apps/api/core";

const convertToFileTree = (item) => {
    const newItem = {
        name: item.name,
    };

    if (item.is_directory && item.children.length > 0) {
        // 如果是目录且有子元素，递归转换子元素
        newItem.children = item.children.map(convertToFileTree);
    }

    return newItem;
};

export default class CodeMirrorDemo extends Component {
    state = {
        code: "",
        codeComponent: null,
        isRunClicked: false, // 新增标志位，用于判断是否点击了运行按钮
        cursor: null,
        fileTree: null
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
                const result = await invoke("list_files_and_directories", { dirPath: "D:\\毕设\\AI-code-compiler\\AI-code-compiler" });
                let convertedChildren;
                // 检查 result 是否有 children 属性，如果有则转换其中的子项
                if (result && result.children) {
                    convertedChildren = result.children.map(convertToFileTree);
                } else {
                    convertedChildren = [];
                }

                // 构建根节点对象
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
        const { code } = this.state;
        // 点击运行按钮时，设置 isRunClicked 为 true
        this.setState({
            codeComponent: evalCode(code),
            isRunClicked: true
        });
    };

    onToggle = (node, toggled) => {
        const { cursor, data } = this.state;
        if (cursor) {
            this.setState(() => ({ cursor, active: false }));
        }
        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }
        this.setState(() => ({ cursor: node, data: Object.assign({}, data) }));
    };


    render() {
        const { code, codeComponent, isRunClicked, fileTree } = this.state;
        return (
            <div style={{ display: "flex", height: "100vh", margin: 0, padding: 0, boxSizing: "border-box" }}>
                {/* 左侧文件管理模块区域 */}
                <div style={{ width: "20%", height: "100%", background: "#f0f0f0", padding: 10, boxSizing: "border-box" }}>
                    {/* 使用 React-Treebeard 渲染文件树 */}
                    {fileTree && <Treebeard data={fileTree} onToggle={this.onToggle} />}
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
                            matchBrackets: true,
                            tabSize: 2,
                        }}
                        onChange={(value) => {
                            this.setState({ code: value });
                        }}
                        style={{ flex: 1, boxSizing: "border-box" }}
                        maxHeight='60vh'
                        height="60vh"
                    />
                    {/* 运行结果展示区域 */}
                    <div style={{ flex: 1, height: "35vh", maxHeight: '35vh', background: "#fff", boxSizing: "border-box", overflow: "auto" }}>
                        {/* 仅在点击运行按钮后渲染 codeComponent 结果 */}
                        {isRunClicked && codeComponent && typeof codeComponent === 'function' && (
                            React.createElement(codeComponent)
                        )}
                    </div>
                </div>
            </div>
        );
    }
}