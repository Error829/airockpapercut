# AI石头剪刀布游戏

这是一个使用 Qwen AI 作为对手的智能石头剪刀布游戏。游戏特点：
1. 玩家可以在出招前告诉AI自己要出什么（可以是真话也可以是假话）
2. AI会通过大语言模型分析玩家的话，做出智能判断
3. 游戏结果出来后，玩家可以尝试狡辩，AI会考虑是否接受

## 技术栈
- 前端：HTML/CSS/JavaScript
- 后端：Node.js + Express
- AI：Qwen2.57B-instruct (通过硅基流动API)

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
   - 打开浏览器访问 http://localhost:3001

## 游戏玩法
1. 在输入框中告诉AI你要出什么（可选）
2. 点击石头、剪刀、布按钮之一进行选择
3. 查看结果
4. 如果对结果不满意，可以在下方输入框进行狡辩
5. AI会考虑你的狡辩是否合理，并给出回应


## 注意事项
- 请确保 `.env` 文件已添加到 .gitignore
- 硅基流动 API 可能有使用限制和费用，请查看官方说明
- 本项目仅供学习和娱乐使用