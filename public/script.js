// 存储玩家的预告信息
let playerHint = '';
let gameFinished = false;

// 游戏状态管理
let gameState = {
    playerChoice: null,
    aiChoice: null,
    isProcessing: false
};

// 选择图标映射
const choiceIcons = {
    '石头': '<svg class="choice-svg rock" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#808080"/><path d="M30,40 Q50,20 70,40" fill="none" stroke="#666" stroke-width="3"/></svg>',
    '剪刀': '<svg class="choice-svg scissors" viewBox="0 0 100 100"><path d="M30,30 L70,70 M70,30 L30,70" stroke="#666" stroke-width="8" stroke-linecap="round"/><circle cx="35" cy="35" r="10" fill="#666"/><circle cx="65" cy="65" r="10" fill="#666"/></svg>',
    '布': '<svg class="choice-svg paper" viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" fill="#fff" stroke="#666" stroke-width="3"/><line x1="30" y1="40" x2="70" y2="40" stroke="#666" stroke-width="2"/><line x1="30" y1="50" x2="70" y2="50" stroke="#666" stroke-width="2"/><line x1="30" y1="60" x2="70" y2="60" stroke="#666" stroke-width="2"/></svg>'
};

// 更新显示的选择
function updateChoiceDisplay(choice, isPlayer) {
    const display = isPlayer ? document.querySelector('.player-choice') : document.querySelector('.ai-choice');
    display.innerHTML = choice ? choiceIcons[choice] : '<div class="choice-icon">❓</div>';
}

// 添加动画效果
function addAnimation(element, animationClass) {
    element.classList.add(animationClass);
    element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
    }, { once: true });
}

// 判断胜负
function determineWinner(playerChoice, aiChoice) {
    if (playerChoice === aiChoice) return 'draw';
    const winConditions = {
        '石头': '剪刀',
        '剪刀': '布',
        '布': '石头'
    };
    return winConditions[playerChoice] === aiChoice ? 'player' : 'ai';
}

// 存储游戏时刻
let gameMoments = [];

// 分享游戏时刻
async function shareGameMoment() {
    try {
        // 获取游戏区域的截图
        const gameArea = document.querySelector('.game-container');
        const canvas = await html2canvas(gameArea, {
            backgroundColor: null,
            scale: 2, // 提高图片质量
            logging: false,
            // 只截取主要游戏区域
            height: document.querySelector('.choices').offsetTop + 
                    document.querySelector('.choices').offsetHeight
        });

        // 将canvas转换为图片URL
        const imageUrl = canvas.toDataURL('image/png');

        // 创建新的时刻卡片
        const moment = {
            id: Date.now(),
            image: imageUrl,
            likes: 0,
            timestamp: new Date().toLocaleString()
        };

        // 添加到时刻列表
        gameMoments.unshift(moment);
        
        // 更新显示
        updateMomentsDisplay();

        // 隐藏分享按钮
        document.querySelector('.share-box').style.display = 'none';
    } catch (error) {
        console.error('分享失败:', error);
        alert('分享失败，请稍后重试');
    }
}

// 更新时刻墙显示
function updateMomentsDisplay() {
    const container = document.querySelector('.moments-container');
    
    // 根据点赞数排序
    const sortedMoments = [...gameMoments].sort((a, b) => b.likes - a.likes);
    
    container.innerHTML = sortedMoments.map((moment, index) => `
        <div class="moment-card" data-id="${moment.id}">
            ${index < 3 ? `<div class="rank-badge rank-${index + 1}">${index + 1}</div>` : ''}
            <img class="moment-image" src="${moment.image}" alt="游戏时刻">
            <div class="moment-footer">
                <div class="moment-info">
                    <span class="timestamp">${moment.timestamp}</span>
                    <span class="likes-count">${moment.likes} 赞</span>
                </div>
                <button class="like-btn" onclick="likeMoment(${moment.id})">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// 修改点赞功能
function likeMoment(id) {
    const moment = gameMoments.find(m => m.id === id);
    if (moment) {
        moment.likes++;
        
        // 添加点赞动画
        const likeBtn = document.querySelector(`[data-id="${id}"] .like-btn`);
        likeBtn.classList.add('like-animation');
        likeBtn.addEventListener('animationend', () => {
            likeBtn.classList.remove('like-animation');
        }, { once: true });
        
        // 更新显示并保存到本地存储
        updateMomentsDisplay();
        saveMomentsToLocalStorage();
    }
}

// 添加本地存储功能
function saveMomentsToLocalStorage() {
    localStorage.setItem('gameMoments', JSON.stringify(gameMoments));
}

function loadMomentsFromLocalStorage() {
    const saved = localStorage.getItem('gameMoments');
    if (saved) {
        gameMoments = JSON.parse(saved);
        updateMomentsDisplay();
    }
}

// 页面加载时读取保存的时刻
document.addEventListener('DOMContentLoaded', loadMomentsFromLocalStorage);

// 处理玩家选择
async function handleChoice(choice) {
    if (gameState.isProcessing) return;
    gameState.isProcessing = true;

    // 更新玩家选择显示
    gameState.playerChoice = choice;
    const playerDisplay = document.querySelector('.player-choice');
    updateChoiceDisplay(choice, true);
    addAnimation(playerDisplay, 'bounce');

    try {
        // AI思考动画
        const aiDisplay = document.querySelector('.ai-choice');
        addAnimation(aiDisplay, 'spin');

        // 延迟后获取AI选择
        setTimeout(async () => {
            const choiceResponse = await fetch('/api/choice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hint: playerHint || `我要出${choice}` })
            });
            const choiceData = await choiceResponse.json();
            
            // 更新AI选择显示
            gameState.aiChoice = choiceData.choice;
            updateChoiceDisplay(choiceData.choice, false);
            addAnimation(aiDisplay, 'bounce');

            // 判断结果并获取AI回应
            const result = determineWinner(choice, choiceData.choice);
            const resultResponse = await fetch('/api/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerChoice: choice,
                    aiChoice: choiceData.choice,
                    result: result === 'player' ? '玩家胜' : 
                           result === 'ai' ? 'AI胜' : '平局'
                })
            });
            const resultData = await resultResponse.json();

            // 只显示AI的回应
            document.querySelector('.message-box').textContent = resultData.response;

            // 添加胜利者动画
            if (result !== 'draw') {
                const winner = result === 'player' ? playerDisplay : aiDisplay;
                winner.classList.add('winner');
                setTimeout(() => winner.classList.remove('winner'), 2000);
            }

            // 显示狡辩区域
            document.querySelector('.argue-box').style.display = 'flex';

            // 显示分享按钮
            document.querySelector('.share-box').style.display = 'block';

            gameState.isProcessing = false;
            playerHint = ''; // 清空提示
        }, 1000);

    } catch (error) {
        console.error('Error:', error);
        gameState.isProcessing = false;
        document.querySelector('.message-box').textContent = '游戏出错，请重试';
    }
}

// 添加按钮事件监听器
document.querySelectorAll('.choice-btn').forEach(button => {
    button.addEventListener('click', () => handleChoice(button.dataset.choice));
});

// 发送预告信息给AI
async function sendMessage() {
    try {
        const input = document.getElementById('playerInput');
        const message = input.value.trim();
        if (!message) {
            alert('请输入提示内容');
            return;
        }

        document.querySelector('.message-box').textContent = 'AI思考中...';
        
        const response = await fetch('/api/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }

        document.querySelector('.message-box').textContent = data.response;
        input.value = '';
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.message-box').textContent = '抱歉，出现了一些问题，请稍后再试';
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
    if (!argument.trim()) {
        alert('请输入狡辩内容');
        return;
    }
    argueInput.value = '';
    
    try {
        document.querySelector('.message-box').textContent = 'AI正在思考...';
        
        const response = await fetch('/api/argue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ argument }),
        });
        
        const data = await response.json();
        document.querySelector('.message-box').textContent = data.response;
    } catch (error) {
        console.error('狡辩处理出错:', error);
        document.querySelector('.message-box').textContent = '处理狡辩时出错，请稍后再试';
    }
} 