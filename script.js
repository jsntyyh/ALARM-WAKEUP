let alarms = [];
let alarmSound = new Audio();
let isAlarmPlaying = false;
let defaultAlarmURL = 'sounds/alarm.mp3';

// 页面加载时就设置默认音乐
window.onload = function() {
    alarmSound.src = defaultAlarmURL;
    alarmSound.load();
    
    // 设置随机背景
    setRandomBackground();
}

// 添加音频文件处理函数
function handleAudioUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const audioURL = URL.createObjectURL(file);
        alarmSound.src = audioURL;
    }
}

// 更新当前时间
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN');
    document.getElementById('current-time').textContent = timeString;
    
    // 检查闹钟
    checkAlarms(now);
}

// 设置闹钟
function setAlarm() {
    const alarmTime = document.getElementById('alarm-time').value;
    const verificationText = document.getElementById('verification-text').value;
    
    if (!alarmTime) {
        alert('请设置闹钟时间！');
        return;
    }
    if (!verificationText) {
        alert('请设置验证文本���');
        return;
    }

    // 检查是否已存在同时间的闹钟
    const isDuplicate = alarms.some(alarm => alarm.time === alarmTime);
    if (isDuplicate) {
        alert('该时间已经设置过闹钟了！');
        return;
    }

    // 创建闹钟对象
    alarms.push({
        time: alarmTime,
        verificationText: verificationText,
        triggeredThisMinute: false
    });
    
    updateAlarmList();
    // 清空输入框
    document.getElementById('alarm-time').value = '';
    document.getElementById('verification-text').value = '';
}

// 更新闹钟列表
function updateAlarmList() {
    const alarmsList = document.getElementById('alarms');
    alarmsList.innerHTML = '';
    
    alarms.forEach((alarm, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="alarm-info">
                <span>时间：${alarm.time}</span>
                <span>验证文本：${alarm.verificationText}</span>
            </div>
            <button onclick="deleteAlarm(${index})">删除</button>
        `;
        alarmsList.appendChild(li);
    });
}

// 删除闹钟
function deleteAlarm(index) {
    alarms.splice(index, 1);
    updateAlarmList();
    if (isAlarmPlaying) {
        stopAlarm();
    }
}

// 修改检查闹钟函数
function checkAlarms(now) {
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentSeconds = now.getSeconds();
    
    // 在每分钟开始时重置所有闹钟的触发状态
    if (currentSeconds === 0) {
        alarms.forEach(alarm => {
            alarm.triggeredThisMinute = false;
        });
    }

    // 只在闹钟没有响的时候检查
    if (!isAlarmPlaying) {
        alarms.forEach(alarm => {
            if (alarm.time === currentTime && !alarm.triggeredThisMinute) {
                alarm.triggeredThisMinute = true;
                playAlarm();
            }
        });
    }
}

// 修改播放闹钟函数
function playAlarm() {
    if (!isAlarmPlaying) {
        isAlarmPlaying = true;
        alarmSound.loop = true;
        alarmSound.play();
        
        // 获取当前响铃的闹钟验证文本
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const currentAlarm = alarms.find(alarm => alarm.time === currentTime);
        
        // 更新模态框中的验证文本提示
        document.getElementById('required-text').textContent = `"${currentAlarm.verificationText}"`;
        // 显示��态框
        document.getElementById('stopAlarmModal').style.display = 'block';
    }
}

// 添加验证和停止闹钟函数
function verifyAndStopAlarm() {
    const input = document.getElementById('verificationInput').value;
    // 找到当前正在响的闹钟
    const currentAlarm = alarms.find(alarm => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return alarm.time === currentTime;
    });

    if (currentAlarm && input === currentAlarm.verificationText) {
        // 验证成功
        stopAlarm();
        document.getElementById('verificationInput').value = '';
        document.getElementById('stopAlarmModal').style.display = 'none';
    } else {
        alert('验证文本错误，请重试！');
    }
}

// 修改停止闹钟函数
function stopAlarm() {
    if (isAlarmPlaying) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        isAlarmPlaying = false;
    }
}

// 每秒更新一次时间
setInterval(updateCurrentTime, 1000);
updateCurrentTime();

// 添加背景图片处理函数
function setRandomBackground() {
    const backgrounds = [
        'background/bg1.jpg',
        'background/bg2.jpg',
        // 可以根据实际图片数量添加更多
    ];
    
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    
    // 创建一个图片对象来获取图片尺寸
    const img = new Image();
    img.onload = function() {
        const bgContainer = document.querySelector('.background-container');
        // 设置容器高度为图片实际高度
        bgContainer.style.height = (window.innerWidth * (this.height / this.width)) + 'px';
        bgContainer.style.backgroundImage = `url('${randomBg}')`;
        bgContainer.style.backgroundSize = '100% auto';
    }
    img.src = randomBg;
}

// 添加窗口大小改变时的处理
window.addEventListener('resize', setRandomBackground); 