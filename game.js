// --- Audio System (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const sounds = {
    eat: () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    },
    die: () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    },
    move: () => {
        // Very subtle click
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    }
};

// --- Game Logic ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const overlay = document.getElementById('overlay');
const startMsg = document.getElementById('start-msg');
const gameOverMsg = document.getElementById('game-over-msg');
const pauseMsg = document.getElementById('pause-msg');
const restartBtn = document.getElementById('restart-btn');
const gameContainer = document.getElementById('game-container');

// Game Constants
let TILE_COUNT_X = 20;
let TILE_COUNT_Y = 20;
let baseSpeed = 100;

// Game State
let snake = [];
let particles = []; // Array for visual effects
let food = { x: 15, y: 15 };
let velocity = { x: 0, y: 0 };
let nextVelocity = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let isPlaying = false;
let isPaused = false;
let isGameOver = false;
let gameLoopTimeout;

highScoreEl.innerText = highScore;

// Resize handling
function resizeCanvas() {
    const maxWidth = window.innerWidth - 32;
    const maxHeight = window.innerHeight - 120;
    
    const tileSize = Math.floor(Math.min(maxWidth / 20, maxHeight / 20));
    const size = Math.max(tileSize, 15); 

    const cols = Math.floor(maxWidth / size);
    const rows = Math.floor(maxHeight / size);

    TILE_COUNT_X = Math.min(cols, 30);
    TILE_COUNT_Y = Math.min(rows, 30);

    canvas.width = TILE_COUNT_X * size;
    canvas.height = TILE_COUNT_Y * size;
    
    if (!isPlaying) draw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particle System
function createParticles(x, y, color) {
    const tileW = canvas.width / TILE_COUNT_X;
    const tileH = canvas.height / TILE_COUNT_Y;
    const centerX = x * tileW + tileW/2;
    const centerY = y * tileH + tileH/2;

    for(let i=0; i<12; i++) {
        particles.push({
            x: centerX,
            y: centerY,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

function updateParticles() {
    for(let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        p.size *= 0.9; // shrink
        if(p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });
}

// Core Game Functions
function resetGame() {
    const startX = Math.floor(TILE_COUNT_X / 2);
    const startY = Math.floor(TILE_COUNT_Y / 2);
    
    snake = [
        { x: startX, y: startY },
        { x: startX, y: startY + 1 },
        { x: startX, y: startY + 2 }
    ];
    velocity = { x: 0, y: -1 };
    nextVelocity = { x: 0, y: -1 };
    score = 0;
    scoreEl.innerText = score;
    scoreEl.classList.remove('text-yellow-400');
    particles = [];
    isGameOver = false;
    isPaused = false;
    placeFood();
    gameContainer.classList.remove('shake');
}

function placeFood() {
    let valid = false;
    while (!valid) {
        food = {
            x: Math.floor(Math.random() * TILE_COUNT_X),
            y: Math.floor(Math.random() * TILE_COUNT_Y)
        };
        valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

function togglePause() {
    if (!isPlaying || isGameOver) return;
    isPaused = !isPaused;
    
    if (isPaused) {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        startMsg.classList.add('hidden');
        pauseMsg.classList.remove('hidden');
    } else {
        overlay.classList.add('opacity-0', 'pointer-events-none');
        gameLoop(); // Resume loop
    }
}

function update() {
    if (isPaused) return;

    // Check if direction actually changed for move sound
    if (velocity.x !== nextVelocity.x || velocity.y !== nextVelocity.y) {
        sounds.move();
    }
    velocity = { ...nextVelocity };

    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // Collision
    if (head.x < 0 || head.x >= TILE_COUNT_X || head.y < 0 || head.y >= TILE_COUNT_Y || 
        snake.some(s => s.x === head.x && s.y === head.y)) {
        triggerGameOver();
        return;
    }

    snake.unshift(head);

    // Eat Food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.innerText = score;
        
        // Visual pop on score
        scoreEl.style.transform = "scale(1.5)";
        setTimeout(() => scoreEl.style.transform = "scale(1)", 100);

        sounds.eat();
        createParticles(head.x, head.y, '#ef4444'); // Red explosion (Matches food)

        if (score > highScore) {
            highScore = score;
            highScoreEl.innerText = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        placeFood();
    } else {
        snake.pop();
    }

    updateParticles();
}

function draw() {
    const tileW = canvas.width / TILE_COUNT_X;
    const tileH = canvas.height / TILE_COUNT_Y;

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let x = 0; x <= canvas.width; x += tileW) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for(let y = 0; y <= canvas.height; y += tileH) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Particles (Below snake)
    drawParticles();

    // Snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#4ade80'; 
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#4ade80';
        } else {
            ctx.fillStyle = `rgba(74, 222, 128, ${1 - (index / (snake.length + 8))})`; 
            ctx.shadowBlur = 0;
        }

        ctx.fillRect(
            segment.x * tileW + 1, 
            segment.y * tileH + 1, 
            tileW - 2, 
            tileH - 2
        );
        ctx.shadowBlur = 0;
    });

    // Food (Pulse effect)
    const pulse = Math.sin(Date.now() / 200) * 2;
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 15 + pulse;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(
        food.x * tileW + tileW/2,
        food.y * tileH + tileH/2,
        (tileW/2 - 2) + (pulse/4),
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

function gameLoop() {
    if (!isPlaying || isPaused) return;
    
    update();
    draw();
    
    if (!isGameOver) {
        // Dynamic speed: Faster as score increases, capped at 50ms
        const currentSpeed = Math.max(50, baseSpeed - Math.floor(score / 50) * 5);
        gameLoopTimeout = setTimeout(() => requestAnimationFrame(gameLoop), currentSpeed);
    }
}

function startGame() {
    if (isPlaying) return;
    
    // Audio context needs user gesture to start
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    isPlaying = true;
    overlay.classList.add('opacity-0', 'pointer-events-none');
    resetGame();
    gameLoop();
}

function triggerGameOver() {
    sounds.die();
    isPlaying = false;
    isGameOver = true;
    
    // Screen Shake
    gameContainer.classList.add('shake');
    setTimeout(() => gameContainer.classList.remove('shake'), 500);

    overlay.classList.remove('opacity-0', 'pointer-events-none');
    startMsg.classList.add('hidden');
    pauseMsg.classList.add('hidden');
    gameOverMsg.classList.remove('hidden');
}

// Controls
document.addEventListener('keydown', (e) => {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    if (e.code === 'KeyP') {
        togglePause();
        return;
    }

    if (!isPlaying && (e.code === 'Space' || e.code === 'Enter')) {
        startGame();
        return;
    }

    if (isPaused) return;

    switch(e.key) {
        case 'ArrowUp': case 'w': case 'W':
            if (velocity.y === 0) nextVelocity = { x: 0, y: -1 }; break;
        case 'ArrowDown': case 's': case 'S':
            if (velocity.y === 0) nextVelocity = { x: 0, y: 1 }; break;
        case 'ArrowLeft': case 'a': case 'A':
            if (velocity.x === 0) nextVelocity = { x: -1, y: 0 }; break;
        case 'ArrowRight': case 'd': case 'D':
            if (velocity.x === 0) nextVelocity = { x: 1, y: 0 }; break;
    }
});

restartBtn.addEventListener('click', () => {
    startMsg.classList.remove('hidden');
    gameOverMsg.classList.add('hidden');
    startGame();
});

// Touch Handling
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    
    if (!isPlaying && !e.target.closest('button')) {
        startGame();
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

document.addEventListener('touchend', (e) => {
    if (!isPlaying || isPaused) return;

    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) {
            if (dx > 0 && velocity.x === 0) nextVelocity = { x: 1, y: 0 };
            if (dx < 0 && velocity.x === 0) nextVelocity = { x: -1, y: 0 };
        }
    } else {
        if (Math.abs(dy) > 30) {
            if (dy > 0 && velocity.y === 0) nextVelocity = { x: 0, y: 1 };
            if (dy < 0 && velocity.y === 0) nextVelocity = { x: 0, y: -1 };
        }
    }
}, { passive: false });

// Initial Render
resetGame();
draw();