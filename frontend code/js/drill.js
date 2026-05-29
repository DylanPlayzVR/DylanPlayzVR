// Global states for Drill Logic
let currentDepth = 1000;
let currentMilestone = 1000; 
let systemState = 'idle'; // Options: 'idle', 'drilling', 'boss'
let bossType = '';

// Interval/Timeout trackers to prevent overlapping loops
let digIntervalHandle = null;
let stateTimeoutHandle = null;

const statusText = document.getElementById('drill-status');
const depthText = document.getElementById('drill-depth');
const resetBtn = document.getElementById('reset-drill-btn');
const consoleFeed = document.getElementById('console-feed');

// Audio Variables (Cleanly mapped and assigned)
const playBtn = document.getElementById('play-audio-btn');
const audioFile = document.getElementById('terminal-audio');
const canvas = document.getElementById('visualizer');

// Volume Slider Control Elements
const volumeSlider = document.getElementById('volume-slider');
const volumePercent = document.getElementById('volume-percent');

let audioContext;
let analyser;
let source;
let dataArray;
let bufferLength;

// Set initial audio volume based on default slider value
if (audioFile && volumeSlider) {
    audioFile.volume = volumeSlider.value;
}

// Helper function to print messages to the terminal console
function logToConsole(message) {
    if (consoleFeed) {
        const timestamp = new Date().toLocaleTimeString();
        consoleFeed.innerHTML += `<br>[${timestamp}] ${message}`;
        consoleFeed.scrollTop = consoleFeed.scrollHeight;
    }
}

// --- MAIN SYSTEM CONTROLLER (RUNS EXACTLY EVERY 1 MINUTE) ---
function processNextSystemState() {
    clearTimeout(stateTimeoutHandle);
    clearInterval(digIntervalHandle);

    // Look AHEAD to see what the next depth block would be
    let nextTarget = currentMilestone + 1000;

    if ([4000, 9000, 14000, 19000, 24000, 29000].includes(nextTarget)) {
        systemState = 'boss';
        bossType = 'Monkeye';
        statusText.innerText = `[CRITICAL: ${bossType.toUpperCase()} DETECTED]`;
        statusText.className = "status-boss";
        
        // Lock progression numbers completely right on the milestone target
        currentMilestone = nextTarget;
        currentDepth = currentMilestone;
        depthText.innerText = currentDepth + "m";
        
        logToConsole(`WARNING: Severe seismic activity. Entity [${bossType}] detected lurking near ${currentMilestone}m. Operations halted.`);

        // Hold systems frozen in position for a 1-minute window
        stateTimeoutHandle = setTimeout(processNextSystemState, 60000);
        
    } else if ([5000, 11000, 30000, 31000].includes(nextTarget)) {
        systemState = 'boss';
        bossType = 'Meteor Monster';
        statusText.innerText = `[CRITICAL: ${bossType.toUpperCase()} DETECTED]`;
        statusText.className = "status-boss";
        
        // Lock progression numbers completely right on the milestone target
        currentMilestone = nextTarget;
        currentDepth = currentMilestone;
        depthText.innerText = currentDepth + "m";
        
        logToConsole(`ALERT: High-thermal radioactive mass signature. [${bossType}] blocking sector ${currentMilestone}m. Operations halted.`);

        // Hold systems frozen in position for a 1-minute window
        stateTimeoutHandle = setTimeout(processNextSystemState, 60000);
        
    } else {
        // Safe zone: Progress milestone target and start the mechanical movement loops
        currentMilestone = nextTarget;
        startDrillingSequence();
    }
}

// --- DRILLING SEQUENCE (EXACTLY 50 SECONDS PER 1000M) ---
function startDrillingSequence() {
    systemState = 'drilling';
    statusText.innerText = "ACTIVELY DIGGING...";
    statusText.className = "status-drilling";
    logToConsole(`CAUTION: Drill engaged. Deep-rock structural penetration set to target depth: ${currentMilestone}m.`);

    // Math balanced for 50 seconds trip: 100ms interval = 10 ticks per sec = 500 total ticks.
    // 1000m / 500 ticks = exactly 20 meters added per interval tick loop.
    const metersPerTick = 20;

    digIntervalHandle = setInterval(() => {
        if (systemState === 'drilling' && currentDepth < currentMilestone) {
            currentDepth += metersPerTick;

            if (currentDepth >= currentMilestone) {
                currentDepth = currentMilestone;
                clearInterval(digIntervalHandle);
                triggerIdleState();
            }
            depthText.innerText = currentDepth + "m";
        } else {
            clearInterval(digIntervalHandle);
        }
    }, 100);
}

function triggerIdleState() {
    systemState = 'idle';
    statusText.innerText = "SYSTEM IDLE";
    statusText.className = "status-idle";
    depthText.innerText = currentMilestone + "m";
    logToConsole(`STATUS: Baseline target reached successfully. Drill idling at ${currentMilestone}m.`);
    
    // Wait out the remaining 10 seconds of the structural minute cycle
    stateTimeoutHandle = setTimeout(processNextSystemState, 10000);
}

// Kick off drill loop initialization delay
stateTimeoutHandle = setTimeout(processNextSystemState, 2000);

// --- MANUAL DRILL OVERRIDE ---
resetBtn.addEventListener('click', () => {
    clearInterval(digIntervalHandle);
    clearTimeout(stateTimeoutHandle);

    systemState = 'idle';
    currentDepth = 1000;
    currentMilestone = 1000;
    
    statusText.innerText = "SYSTEM IDLE";
    statusText.className = "status-idle";
    depthText.innerText = "1000m";
    logToConsole("EMERGENCY OVERRIDE: Systems forced back to baseline 1000m depth.");
    stateTimeoutHandle = setTimeout(processNextSystemState, 4000);
});

// --- HIGH-QUALITY AUDIO CONTROLS & VISUALIZER ---
if (playBtn && audioFile) {
    playBtn.addEventListener('click', () => {
        if (!audioContext) {
            setupAudioAnalyzer();
        }

        if (audioFile.paused) {
            audioFile.play();
            playBtn.innerText = "Mute Transmission";
            logToConsole("PLAYING: Decoding incoming audio message from Dylan...");
            renderHighQualityVisualizer();
        } else {
            audioFile.pause();
            playBtn.innerText = "Play Message from Dylan";
            logToConsole("AUDIO: Transmission paused by user.");
        }
    });
}

// Dynamic Slider Input Event Hook
if (volumeSlider && audioFile) {
    volumeSlider.addEventListener('input', (e) => {
        const currentVol = e.target.value;
        audioFile.volume = currentVol;
        if (volumePercent) {
            volumePercent.textContent = `${Math.round(currentVol * 100)}%`;
        }
    });
}

function setupAudioAnalyzer() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    
    source = audioContext.createMediaElementSource(audioFile);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256; 
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

function renderHighQualityVisualizer() {
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;

    function draw() {
        if (audioFile.paused) {
            ctx.clearRect(0, 0, width, height);
            return;
        }
        
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, width, height);
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#33cc33';
        ctx.fillStyle = '#33cc33'; 

        const barWidth = width / bufferLength;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            const calculatedHeight = (barHeight / 255) * height * 0.85;
            ctx.fillRect(x, height - calculatedHeight, barWidth - 1, calculatedHeight);
            x += barWidth;
        }
    }
    draw();
}