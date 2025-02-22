require('dotenv').config();
const express = require('express');
const axios = require('axios'); // 需要安装 axios

const app = express();
app.use(express.json());
app.use(express.static('public'));

// 配置 API
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const API_KEY = process.env.SILICONFLOW_API_KEY;
const MODEL_NAME = 'Qwen/Qwen2.5-7B-Instruct';

// 处理AI回应
app.post('/api/message', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await axios.post(API_URL, {
            model: MODEL_NAME,
            messages: [{
                role: "system",
                content: `你是一个聪明的石头剪刀布玩家。当对手告诉你他要出什么时，你需要给出一个有趣的回应：

1. 回应风格：
   - 可以是狡黠的："哦～是吗？让我好好想想～😏"
   - 可以是怀疑的："嗯...你说的是真的吗？🤔"
   - 可以是自信的："哼哼，我已经看穿你的计谋了～😎"
   - 可以是调皮的："好啊好啊，我知道该怎么做了～🎭"

2. 要求：
   - 回应要简短（不超过15字）
   - 带有表情符号
   - 要有语气词
   - 每次回应要有变化，不要重复
   - 不要透露你的想法`
            }, {
                role: "user",
                content: `我告诉你："${message}"`
            }],
            temperature: 0.9,  // 增加随机性
            max_tokens: 50,
            top_p: 0.95,
            frequency_penalty: 0.8,  // 增加变化性
            presence_penalty: 0.8,
            response_format: { type: "text" }
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        let aiResponse = response.data.choices[0].message.content.trim();
        
        // 如果回应太长或没有表情符号，使用备用回应
        if (aiResponse.length > 30 || !aiResponse.match(/[\u{1F300}-\u{1F9FF}]/u)) {
            const backupResponses = [
                "11哦～是吗？让我好好想想～😏",
                "22嗯...你说的是真的吗？🤔",
                "33哼哼，我已经看穿你的计谋了～😎",
                "44好啊好啊，我知道该怎么做了～🎭",
                "55有意思，让我猜猜你的想法～😼"
            ];
            aiResponse = backupResponses[Math.floor(Math.random() * backupResponses.length)];
        }

        res.json({ response: aiResponse });
    } catch (error) {
        console.error('消息处理出错:', error);
        res.json({ 
            response: "哦～让我想想该怎么应对～🤔" 
        });
    }
});

// 处理AI选择
app.post('/api/choice', async (req, res) => {
    try {
        const { hint } = req.body;
        const response = await axios.post(API_URL, {
            model: MODEL_NAME,
            messages: [{
                role: "system",
                content: `你是一个超级聪明的石头剪刀布玩家。分析对手的提示，考虑多层心理博弈：

1. 基础诈骗层：
   - 对手说要出A，可能是想诱导你出克制A的B，实际出C来克制你的B
   - 例如：说出布，想让你出剪刀，实际出石头

2. 反诈骗层：
   - 你可能识破基础诈骗，选择出A来克制对手的C
   - 但对手可能预料到你会这样想，所以真的出A

3. 反反诈骗层：
   - 对手可能预判你会识破诈骗，所以故意说实话
   - 或者预判你会以为他在说实话，实际在诈骗

4. 策略建议：
   - 分析对手的语气和措辞
   - 考虑对手是否在过度暗示
   - 随机加入一些不可预测性
   - 不要陷入过度思考的误区

5. 你只能回复：石头、剪刀、布 中的一个，但要基于深层分析来选择`
            }, {
                role: "user",
                content: `对手告诉我："${hint}"。请分析后选择出招。记住要考虑多层心理博弈。`
            }],
            temperature: 0.3, // 增加一些随机性
            max_tokens: 10,
            response_format: { type: "text" }
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        let aiChoice = response.data.choices[0].message.content.trim();
        
        // 确保返回值是有效的选择
        if (!['石头', '剪刀', '布'].includes(aiChoice)) {
            // 如果AI没有给出有效选择，随机选择
            const choices = ['石头', '剪刀', '布'];
            aiChoice = choices[Math.floor(Math.random() * choices.length)];
        }

        res.json({ choice: aiChoice });
    } catch (error) {
        console.error('选择处理出错:', error);
        // 出错时随机选择
        const fallbackChoices = ['石头', '剪刀', '布'];
        res.json({ 
            choice: fallbackChoices[Math.floor(Math.random() * fallbackChoices.length)]
        });
    }
});

// 处理狡辩
app.post('/api/argue', async (req, res) => {
    try {
        const { argument } = req.body;
        console.log('收到狡辩请求:', argument);

        // 配置通用的请求头
        const headers = {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        };

        // 第一次请求获取AI的分析
        const firstResponse = await axios.post(API_URL, {
            model: MODEL_NAME,
            messages: [{
                role: "system",
                content: `你是个毒舌又傲娇的玩家。你必须用以下格式回复：

格式示例：
用户："我明明出的是剪刀！"
回复：[哼～想骗我？你的演技还得再练练吧～🤡]

用户："我真的出的是布！"
回复：[好啦好啦，这次算你说得对啦～😤]

规则：
1. 必须用[]包裹回复内容
2. 必须带语气词和表情
3. 不超过20字
4. 不要有任何解释或其他内容
5. 只输出一行回复`
            }, {
                role: "user",
                content: `对手说："${argument}"`
            }],
            temperature: 0.7,
            max_tokens: 150,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: false,
            response_format: { type: "text" }
        }, { headers, timeout: 15000 });

        let firstAiResponse = firstResponse.data.choices[0].message.content.trim();
        console.log('AI第一次回应:', firstAiResponse);

        // 如果第一次回应已经符合格式要求，直接使用
        const firstMatch = firstAiResponse.match(/\[(.*?)]/);
        if (firstMatch && firstMatch[1]) {
            const cleanResponse = firstMatch[1].trim();
            console.log('使用第一次回应:', cleanResponse);
            return res.json({ response: cleanResponse });
        }

        // 如果第一次回应不符合格式，进行第二次请求
        const secondResponse = await axios.post(API_URL, {
            model: MODEL_NAME,
            messages: [{
                role: "system",
                content: "你是个毒舌又傲娇的玩家。请用中括号[]包裹你的回应。回应要带语气词和表情，不超过20字。"
            }, {
                role: "user",
                content: `请根据这段话生成一个回应："${firstAiResponse}"`
            }],
            temperature: 0.7,
            max_tokens: 50,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: false,
            response_format: { type: "text" }
        }, { headers, timeout: 15000 });

        let finalResponse = secondResponse.data.choices[0].message.content.trim();
        console.log('AI第二次回应:', finalResponse);

        // 提取中括号内的内容
        const match = finalResponse.match(/\[(.*?)]/);
        if (match && match[1]) {
            const cleanResponse = match[1].trim();
            console.log('提取的最终回应:', cleanResponse);
            res.json({ response: cleanResponse });
        } else {
            // 如果两次处理都失败，生成一个带有表情的回应
            const response = firstAiResponse.split('。')[0] + '～😤';
            console.log('生成的最终回应:', response);
            res.json({ response });
        }
    } catch (error) {
        console.error('狡辩处理出错:', error);
        res.json({
            response: "哼！这局先放过你，下次可没这么好说话～😤"
        });
    }
});

// 端口配置
const PORT = process.env.PORT || 3001; // 改为3001或其他可用端口

// 添加端口检查和错误处理
const server = app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`端口 ${PORT} 已被占用，尝试使用其他端口...`);
        // 尝试使用下一个端口
        server.listen(PORT + 1);
    } else {
        console.error('服务器启动错误:', err);
    }
}); 