let alarms = [];
let alarmSound = new Audio();
let isAlarmPlaying = false;
let defaultAlarmURL = 'sounds/alarm.mp3';

// 添加时间选择器相关变量和函数
let currentHour = 0;
let currentMinute = 0;

// 初始化时间选择器
function initTimePicker() {
    const hoursWheel = document.getElementById('hours-wheel');
    const minutesWheel = document.getElementById('minutes-wheel');
    
    // 生成小时选项
    for (let i = 0; i < 24; i++) {
        const div = document.createElement('div');
        div.textContent = i.toString().padStart(2, '0');
        hoursWheel.appendChild(div);
    }
    
    // 生成分钟选项
    for (let i = 0; i < 60; i++) {
        const div = document.createElement('div');
        div.textContent = i.toString().padStart(2, '0');
        minutesWheel.appendChild(div);
    }
    
    // 添加触摸事件处理
    let startY = 0;
    let currentWheelType = '';
    
    function handleTouchStart(e) {
        startY = e.touches[0].clientY;
        currentWheelType = e.currentTarget.parentElement.parentElement.classList.contains('hours') ? 'hours' : 'minutes';
        e.preventDefault(); // 阻止默认行为
    }
    
    function handleTouchMove(e) {
        const deltaY = e.touches[0].clientY - startY;
        if (Math.abs(deltaY) > 10) { // 最小滑动距离
            const direction = deltaY > 0 ? -1 : 1;
            scrollTime(currentWheelType, direction);
            startY = e.touches[0].clientY;
        }
        e.preventDefault(); // 阻止默认行为
    }
    
    // 为两个轮子添加触摸事件
    [hoursWheel, minutesWheel].forEach(wheel => {
        wheel.addEventListener('touchstart', handleTouchStart, { passive: false });
        wheel.addEventListener('touchmove', handleTouchMove, { passive: false });
    });
    
    updateTimePickerPosition();
}

// 更新时间轮的位置
function updateTimePickerPosition() {
    const hoursWheel = document.getElementById('hours-wheel');
    const minutesWheel = document.getElementById('minutes-wheel');
    
    hoursWheel.style.transform = `translateY(${-currentHour * 40}px)`;
    minutesWheel.style.transform = `translateY(${-currentMinute * 40}px)`;
}

// 滚动时间
function scrollTime(type, direction) {
    if (type === 'hours') {
        currentHour = (currentHour + direction + 24) % 24;
    } else {
        currentMinute = (currentMinute + direction + 60) % 60;
    }
    updateTimePickerPosition();
}

// 获取当前选择的时间
function getSelectedTime() {
    return `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
}

// 页面加载时就设置默认音乐
window.onload = function() {
    alarmSound.src = defaultAlarmURL;
    alarmSound.load();
    
    // 设置随机背景
    setRandomBackground();
    initTimePicker();
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
    const alarmTime = getSelectedTime();
    const verificationText = document.getElementById('verification-text').value;
    
    if (!verificationText) {
        alert('请设置验证文本！');
        return;
    }
    
    // 检查是否已存在相同时间的闹钟
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
    // 只清空验证文本输入框
    document.getElementById('verification-text').value = '';
}

// 更新闹钟列表
function updateAlarmList() {
    const alarmsList = document.getElementById('alarms');
    const alarmListContainer = document.getElementById('alarm-list');
    
    // 清空现有列表
    alarmsList.innerHTML = '';
    
    // 根据是否有闹钟来显示或隐藏列表
    if (alarms.length > 0) {
        alarmListContainer.classList.add('show');
        
        // 添加闹钟项，并设置延迟动画
        alarms.forEach((alarm, index) => {
            const li = document.createElement('li');
            li.style.animationDelay = `${index * 0.1}s`; // 每个项目依次延迟出现
            li.innerHTML = `
                <div class="alarm-info">
                    <span>时间：${alarm.time}</span>
                    <span>验证文本：${alarm.verificationText}</span>
                </div>
                <button onclick="deleteAlarm(${index})">删除</button>
            `;
            alarmsList.appendChild(li);
        });
    } else {
        alarmListContainer.classList.remove('show');
    }
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
        // 显示模态框
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
    const bgContainer = document.querySelector('.background-container');
    
    // 直接设置背景图片
    bgContainer.style.backgroundImage = `url('${randomBg}')`;
}

// 添加窗口大小改变时的处理
window.addEventListener('resize', setRandomBackground); 