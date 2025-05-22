# Obsidian Web Memos

基于 React 的轻量级 Web 笔记应用，支持 Markdown 格式、标签系统和本地文件夹读取。

## 主要功能

- ✏️ 支持 Markdown 语法，包括标题、列表、任务清单、表格、代码块等
- 🏷️ 标签系统支持多级标签（如 `#生活/杂谈`）和标签筛选
- 📁 支持读取本地 Markdown 文件夹
- 🖼️ 支持图片渲染，并自动生成缩略图
- 🎨 美观的 UI 界面，支持编辑和删除操作

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 使用方法

1. 在输入框中输入 Markdown 内容并发送
2. 点击标签可筛选相关笔记
3. 使用"读取本地文件夹"功能导入本地笔记
4. 通过右上角菜单编辑或删除笔记

## 技术栈

- React
- React Markdown
- Tailwind CSS
- date-fns