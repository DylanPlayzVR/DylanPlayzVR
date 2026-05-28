// Global states for Drill Logic
let currentDepth = 1000;
let currentMilestone = 1000; 
let systemState = 'idle'; // Options: 'idle', 'drilling', 'boss'
let bossType = 'MONKEYE';

const statusText = document.getElementById('drill-status');
const depthText = document.getElementById('drill-depth');
const resetBtn = document.getElementById('reset-drill-btn');

// --- AUTOMATED DRILL LOOP SIMULATOR ---
function runDrillSystem() {
    // Randomize what state happens next
    const roll = Math.random();

    if (roll < 0.5) {
        // 50% chance to switch to Drilling
        systemState = 'drilling';
        statusText.innerText = "ACTIVELY DIGGING...";
        statusText.className = "status-drilling";
        
        // Count up to the next 1000m milestone smoothly
        currentMilestone += 1000;
        let drillInterval = setInterval(() => {
            if (currentDepth < currentMilestone && systemState === 'drilling') {
                currentDepth += Math.floor(Math.random() * 80) + 20; // Increment depth
                if (currentDepth > currentMilestone) currentDepth = currentMilestone;
                depthText.innerText = currentDepth + "m";
            } else {
                clearInterval(drillInterval);
                if (systemState === 'drilling') triggerIdleState();
            }
        }, 150);

    } else if (roll < 0.8) {
        // 30% chance to stay Idle
        triggerIdleState();
    } else {
        // 20% chance to trigger a Critical Boss Threat alert
        systemState = 'boss';
        bossType = bossType === 'MONKEYE' ? 'METEOR MONSTER' : 'MONKEYE';
        statusText.innerText = `[CRITICAL: ${bossType} DETECTED]`;
        statusText.className = "status-boss";
    }
}

function triggerIdleState() {
    systemState = 'idle';
    statusText.innerText = "SYSTEM IDLE";
    statusText.className = "status-idle";
    // Ensure depth stops right on the clean thousand milestone marker
    depthText.innerText = currentMilestone + "m";
}

// System cycles statuses every 8 seconds
const systemLoop = setInterval(runDrillSystem, 8000);

// --- MANUAL DRILL OVERRIDE (RESTART AT 1000M) ---
resetBtn.addEventListener('click', () => {
    systemState = 'idle';
    currentDepth = 1000;
    currentMilestone = 1000;
    statusText.innerText = "SYSTEM IDLE";
    statusText.className = "status-idle";
    depthText.innerText = "1000m";
    console.log("Gorilla Corp systems hard reset to factory default specs.");
});


// --- SIMPLIFIED AUDIO CONTROLS & VISUALIZER HINT ---
const playBtn = document.getElementById('play-audio-btn');
const audioFile = document.getElementById('terminal-audio');
const canvas = document.getElementById('visualizer');

if(playBtn && audioFile) {
    playBtn.addEventListener('click', () => {
        if (audioFile.paused) {
            audioFile.play();
            playBtn.innerText = "Mute Transmission";
            simulateVisualizer();
        } else {
            audioFile.pause();
            playBtn.innerText = "Play Message from Dylan";
        }
    });
}

// Procedural visualizer generator bar simulation
function simulateVisualizer() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function draw() {
        if (audioFile.paused) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        requestAnimationFrame(draw);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#33cc33';
        
        // Renders random terminal bar soundwaves matching voice cadence
        for (let i = 0; i < canvas.width; i += 8) {
            const h = Math.random() * canvas.height;
            ctx.fillRect(i, canvas.height - h, 5, h);
        }
    }
    draw();
}