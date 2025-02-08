import React, { Component } from "react";

export default class FileTest extends Component {
    render() {
        return (
            <div>
                {/* 导航栏 */}
                <nav style={{ background: "blue", color: "#fff", padding: "10px" }}>
                    <ul style={{ listStyleType: "none", margin: 0, padding: 0, display: "flex" }}>
                        <li style={{ marginRight: "20px" }}>
                            <a href="#" style={{ color: "#fff", textDecoration: "none" }}>
                                首页
                            </a>
                        </li>
                        <li style={{ marginRight: "20px" }}>
                            <a href="#" style={{ color: "#fff", textDecoration: "none" }}>
                                关于我们
                            </a>
                        </li>
                        <li>
                            <a href="#" style={{ color: "#fff", textDecoration: "none" }}>
                                联系我们
                            </a>
                        </li>
                    </ul>
                </nav>
                {/* 主要内容区域 */}
                <main style={{ padding: "20px" }}>
                    <h1 style={{ color: "blue" }}>欢迎来到我们的网站</h1>
                    <p>
                        这是一个简单的前端页面示例，展示了如何在 React 组件中渲染不同的元素。
                        你可以根据需要添加更多的内容和样式。
                    </p>
                    <button style={{ background: "blue", color: "#fff", padding: "10px 20px", border: "none" }}>
                        点击我
                    </button>
                </main>
                {/* 页脚 */}
                <footer style={{ background: "blue", color: "#fff", textAlign: "center", padding: "10px" }}>
                    &copy; 2024 版权所有
                </footer>
            </div>
        );
    }
}