# AI Code Compiler

基于Tauri的AI代码编辑器，集成AI辅助功能，支持代码编辑运行、预览、AI辅助能力。

## 功能特性

- 📝 代码编辑
  - 支持多文件编辑
  - 语法高亮
  - 代码自动补全
  - 实时错误提示

- 🤖 AI 辅助
  - 智能代码注释生成
  - AI 对话助手
  - 支持多种 AI 模型（DeepSeek-R1、GPT-3.5、GPT-4）

- 🚀 代码运行
  - 实时预览
  - 终端输出
  - 错误提示

- 📂 文件管理
  - 文件树浏览
  - 多标签页支持
  - 文件快速切换

## 技术栈

- 前端
  - React
  - Semi UI
  - React Error Boundary

- 后端
  - Tauri
  - Rust
  - Tokio
  - Reqwest

## 安装说明

1. 确保你的系统已安装以下依赖：
   - Node.js (v16 或更高版本)
   - Rust 
   - Tauri CLI
请参考Tauri2文档： https://v2.tauri.app/start/create-project/

2. 克隆项目：
   ```bash
   git clone [项目地址]
   cd ai-code-compiler
   ```

3. 安装依赖：
   ```bash
   npm install
   ```
   
4. 修改API_URL和API_KEY
   config.rs文件中进行修改
   
5. 启动开发服务器：
   ```bash
   npm run tauri dev
   ```

## 使用方法

1. 文件操作
   - 在左侧文件树中浏览和选择文件
   - 双击文件在编辑器中打开
   - 支持多标签页编辑

2. AI 辅助功能
   - 点击"代码注释"按钮为当前代码生成注释
   - 点击"AI辅助"按钮打开 AI 对话窗口
   - 在 AI 对话窗口中选择不同的模型进行对话

3. 代码运行
   - 点击"运行"按钮执行当前代码
   - 在预览窗口查看运行结果
   - 在终端窗口查看输出和错误信息

## 项目结构

```
ai-code-compiler/
├── src/                    # 前端源代码
│   ├── components/        # React 组件
│   │   ├── AICodeEditor # 主编辑器组件
│   │   ├── AIChat       # AI 对话组件
│   │   ├── CodeEditor   # 代码编辑器组件
│   │   ├── FileTree     # 文件树组件
│   │   └── Preview      # 预览组件
│   └── styles/           # 全局样式
├── src-tauri/            # Tauri 后端代码
│   ├── src/             # Rust 源代码
│   │   ├── services/    # 服务模块
│   │   └── config/      # 配置模块
│   └── Cargo.toml       # Rust 依赖配置
└── package.json         # 项目配置
```

## 开发说明

1. 前端开发
   - 组件采用函数式组件和 Hooks
   - 使用 CSS 模块化管理样式
   - 遵循 React 最佳实践

2. 后端开发
   - 使用 Rust 异步编程
   - 模块化设计
   - 错误处理机制

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。

