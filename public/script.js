// 存储玩家的预告信息
let playerHint = '';
let gameFinished = false;

// 发送预告信息给AI
async function sendMessage() {
    const input = document.getElementById('playerInput');
    playerHint = input.value;
    input.value = '';
    
    try {
        const response = await fetch('/api/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: playerHint }),
        });
        const data = await response.json();
        
        // 显示AI的回应
        const resultArea = document.querySelector('.result-area');
        resultArea.innerHTML = `<p>AI: ${data.response}</p>`;
    } catch (error) {
        console.error('Error:', error);
        alert('与AI通信时出错，请稍后再试');
    }
}

// AI根据玩家提示做出选择
async function getAIChoice(playerHint) {
    try {
        const response = await fetch('/api/choice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ hint: playerHint }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('AI返回的选择:', data); // 添加日志
        
        if (!data.choice || !['石头', '剪刀', '布'].includes(data.choice)) {
            console.error('AI返回了无效的选择:', data);
            return '石头'; // 默认选择
        }
        
        return data.choice;
    } catch (error) {
        console.error('获取AI选择时出错:', error);
        return '石头'; // 出错时的默认选择
    }
}

// 判断胜负
function judgeResult(playerChoice, aiChoice) {
    if (playerChoice === aiChoice) return '平局';
    if (
        (playerChoice === '石头' && aiChoice === '剪刀') ||
        (playerChoice === '剪刀' && aiChoice === '布') ||
        (playerChoice === '布' && aiChoice === '石头')
    ) {
        return '玩家胜';
    }
    return 'AI胜';
}

// 玩家做出选择
async function makeChoice(choice) {
    try {
        if (gameFinished) {
            document.querySelector('.argue-area').style.display = 'none';
            gameFinished = false;
        }
        
        // 显示加载状态
        const resultArea = document.querySelector('.result-area');
        resultArea.innerHTML = '<p>AI正在思考...</p>';
        
        const aiChoice = await getAIChoice(playerHint);
        const result = judgeResult(choice, aiChoice);
        
        // 显示结果
        resultArea.innerHTML = `
            <p>玩家出了：${choice}</p>
            <p>AI出了：${aiChoice}</p>
            <p>结果：${result}</p>
        `;
        
        // 显示狡辩区域
        document.querySelector('.argue-area').style.display = 'flex';
        gameFinished = true;
        playerHint = ''; // 清空提示
    } catch (error) {
        console.error('游戏过程出错:', error);
        const resultArea = document.querySelector('.result-area');
        resultArea.innerHTML = '<p>游戏出错，请刷新页面重试</p>';
    }
}

// 处理狡辩
async function argue() {
    const argueInput = document.getElementById('argueInput');
    const argument = argueInput.value;
    argueInput.value = '';
    
    if (!argument.trim()) {
        alert('请输入狡辩内容');
        return;
    }
    
    try {
        const resultArea = document.querySelector('.result-area');
        resultArea.innerHTML += '<p>你说：' + argument + '</p>';
        resultArea.innerHTML += '<p>AI正在思考...</p>';
        
        const response = await fetch('/api/argue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ argument }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 移除加载提示并显示AI的回应
        resultArea.innerHTML = resultArea.innerHTML.replace('<p>AI正在思考...</p>', '');
        resultArea.innerHTML += `<p>${data.response}</p>`;
    } catch (error) {
        console.error('狡辩处理出错:', error);
        const resultArea = document.querySelector('.result-area');
        resultArea.innerHTML += '<p>处理狡辩时出错，请稍后再试</p>';
    }
} 