// Global states for Drill Logic
let currentDepth = 1000;
let currentMilestone = 1000; 
let systemState = 'idle'; // Options: 'idle', 'drilling', 'boss'
let bossType = 'MONKEYE';

// Interval/Timeout trackers to prevent overlapping loops
let digIntervalHandle = null;
let stateTimeoutHandle = null;

const statusText = document.getElementById('drill-status');
const depthText = document.getElementById('drill-depth');
const resetBtn = document.getElementById('reset-drill-btn');
const consoleFeed = document.getElementById('console-feed');

// Audio Variables (Declared cleanly exactly once)
const playBtn = document.getElementById('play-audio-btn');
const audioFile = document.getElementById('terminal-audio');
const canvas = document.getElementById('visualizer');

let audioContext;
let analyser;
let source;
let dataArray;
let bufferLength;

// Helper function to print messages to the terminal console
function logToConsole(message) {
    if (consoleFeed) {
        const timestamp = new Date().toLocaleTimeString();
        consoleFeed.innerHTML += `<br>[${timestamp}] ${message}`;
        consoleFeed.scrollTop = consoleFeed.scrollHeight;
    }
}

// --- MAIN SYSTEM CONTROLLER ---
function processNextSystemState() {
    clearTimeout(stateTimeoutHandle);
    const roll = Math.random();

    if (roll < 0.5) {
        startDrillingSequence();
    } else if (roll < 0.8) {
        systemState = 'idle';
        statusText.innerText = "SYSTEM IDLE";
        statusText.className = "status-idle";
        depthText.innerText = currentMilestone + "m";
        logToConsole(`STATUS: Operational systems stable. Standing by at ${currentMilestone}m.`);
        stateTimeoutHandle = setTimeout(processNextSystemState, 6000);
    } else {
        systemState = 'boss';
        bossType = bossType === 'MONKEYE' ? 'METEOR MONSTER' : 'MONKEYE';
        statusText.innerText = `[CRITICAL: ${bossType} DETECTED]`;
        statusText.className = "status-boss";
        logToConsole(`WARNING: Severe seismic activity. Entity [${bossType}] detected nearby. Operations halted.`);
        stateTimeoutHandle = setTimeout(processNextSystemState, 10000);
    }
}

// --- DRILLING SEQUENCE ---
// --- DRILLING SEQUENCE (EXACTLY 50 SECONDS PER 1000M) ---
function startDrillingSequence() {
    systemState = 'drilling';
    statusText.innerText = "ACTIVELY DIGGING...";
    statusText.className = "status-drilling";
    
    currentMilestone += 1000;
    logToConsole(`CAUTION: Drill engaged. Target depth set to ${currentMilestone}m.`);

    // Clear any dangling interval before creating a new one
    clearInterval(digIntervalHandle);

    // 100ms per tick means 10 ticks per second. 
    // Over 50 seconds, that's exactly 500 ticks. 1000m / 500 ticks = exactly 2m per tick.
    const metersPerTick = 2; 

    digIntervalHandle = setInterval(() => {
        if (systemState === 'drilling' && currentDepth < currentMilestone) {
            currentDepth += metersPerTick; 
            
            // Safety cap to ensure it lands perfectly on the milestone number
            if (currentDepth >= currentMilestone) {
                currentDepth = currentMilestone;
                clearInterval(digIntervalHandle);
                triggerIdleState();
            }
            depthText.innerText = currentDepth + "m";
        } else {
            clearInterval(digIntervalHandle);
        }
    }, 100); // Ticks every 100 milliseconds
}

function triggerIdleState() {
    systemState = 'idle';
    statusText.innerText = "SYSTEM IDLE";
    statusText.className = "status-idle";
    depthText.innerText = currentMilestone + "m";
    logToConsole(`STATUS: Target depth reached. Drill idling at ${currentMilestone}m.`);
    stateTimeoutHandle = setTimeout(processNextSystemState, 7000);
}

// Kick off drill loop
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