# AI石头剪刀布游戏

这是一个使用 DeepSeek AI 作为对手的智能石头剪刀布游戏。游戏特点：
1. 玩家可以在出招前告诉AI自己要出什么（可以是真话也可以是假话）
2. AI会通过大语言模型分析玩家的话，做出智能判断
3. 游戏结果出来后，玩家可以尝试狡辩，AI会考虑是否接受

## 技术栈
- 前端：HTML/CSS/JavaScript
- 后端：Node.js + Express
- AI：DeepSeek-R1-Distill-Llama-8B (通过硅基流动API)

## 项目结构
project/
├── public/              # 静态文件目录
│   ├── index.html      # 游戏主页面
│   ├── styles.css      # 样式文件
│   └── script.js       # 前端逻辑
├── server.js           # 后端服务器
├── .env               # 环境变量配置
├── .gitignore         # Git忽略配置
└── package.json       # 项目配置文件

## 安装和运行

1. 安装依赖
```bash
npm init -y
npm install express axios dotenv
```

2. 配置环境变量
   - 创建 `.env` 文件
   - 添加 API Key:
   ```
   SILICONFLOW_API_KEY=你的API密钥
   ```

3. 启动服务器
```bash
node server.js
```

4. 访问游戏
   - 打开浏览器访问 http://localhost:3000

## 游戏玩法
1. 在输入框中告诉AI你要出什么（可选）
2. 点击石头、剪刀、布按钮之一进行选择
3. 查看结果
4. 如果对结果不满意，可以在下方输入框进行狡辩
5. AI会考虑你的狡辩是否合理，并给出回应

## 开发说明
- 前端通过 fetch API 与后端通信
- 后端使用 Express 处理 API 请求
- 使用 DeepSeek-R1-Distill-Llama-8B 模型进行自然语言处理
- 所有AI相关的处理都在后端完成，保护API密钥
- 使用硅基流动提供的 API 服务

## 技术特点
- 使用 8B 参数量的 DeepSeek 模型，提供流畅的对话体验
- 支持中文输入和响应
- 完整的错误处理和后备方案
- 友好的用户界面和交互设计

## 注意事项
- 请确保 `.env` 文件已添加到 .gitignore
- 硅基流动 API 可能有使用限制和费用，请查看官方说明
- 本项目仅供学习和娱乐使用

## 后续优化方向
1. 添加游戏历史记录
2. 实现计分系统
3. 优化AI的决策逻辑
4. 添加更多的游戏动画效果
5. 支持多语言
6. 添加更多的游戏模式 