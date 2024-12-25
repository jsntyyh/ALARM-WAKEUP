let alarms = [];
let alarmSound = new Audio();
let isAlarmPlaying = false;
let defaultAlarmURL = 'sounds/alarm.mp3';

// 页面加载时就设置默认音乐
window.onload = function() {
    alarmSound.src = defaultAlarmURL;
    alarmSound.load();
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
    if (!alarmTime) return;

    // 检查是否已存在相同时间的闹钟
    const isDuplicate = alarms.some(alarm => alarm.time === alarmTime);
    if (isDuplicate) {
        alert('该时间已经设置过闹钟了！');
        return;
    }

    // 创建闹钟对象，包含时间和触���状态
    alarms.push({
        time: alarmTime,
        triggeredThisMinute: false
    });
    updateAlarmList();
    document.getElementById('alarm-time').value = '';
}

// 更新闹钟列表
function updateAlarmList() {
    const alarmsList = document.getElementById('alarms');
    alarmsList.innerHTML = '';
    
    alarms.forEach((alarm, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${alarm.time}</span>
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
        // 显示模态框而不是停止按钮
        document.getElementById('stopAlarmModal').style.display = 'block';
    }
}

// 添加验证和停止闹钟函数
function verifyAndStopAlarm() {
    const input = document.getElementById('verificationInput').value;
    if (input.toLowerCase() === 'hello world') {
        // 验证成功，停止闹钟
        stopAlarm();
        // 清空输入框并隐藏模态框
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