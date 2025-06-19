const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 12, paddleHeight = 90, paddleMargin = 15;
const ballRadius = 12;
const aiSpeed = 5;
const canvasWidth = canvas.width, canvasHeight = canvas.height;

// Game state
let leftPaddleY = (canvasHeight - paddleHeight) / 2;
let rightPaddleY = (canvasHeight - paddleHeight) / 2;
let ballX = canvasWidth / 2, ballY = canvasHeight / 2;
let ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);

// Mouse control for left paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    leftPaddleY = mouseY - paddleHeight / 2;
    // Clamp the paddle inside the canvas
    if (leftPaddleY < 0) leftPaddleY = 0;
    if (leftPaddleY > canvasHeight - paddleHeight) leftPaddleY = canvasHeight - paddleHeight;
});

function drawRect(x, y, w, h, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color = '#fff') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    for (let i = 10; i < canvasHeight; i += 30) {
        drawRect(canvasWidth / 2 - 2, i, 4, 16, '#888');
    }
}

function resetBall() {
    ballX = canvasWidth / 2;
    ballY = canvasHeight / 2;
    ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

function aiMove() {
    // AI tries to center paddle on ball, but limited by aiSpeed
    const target = ballY - paddleHeight / 2;
    if (rightPaddleY < target) {
        rightPaddleY += aiSpeed;
        if (rightPaddleY > target) rightPaddleY = target;
    } else if (rightPaddleY > target) {
        rightPaddleY -= aiSpeed;
        if (rightPaddleY < target) rightPaddleY = target;
    }
    // Clamp
    if (rightPaddleY < 0) rightPaddleY = 0;
    if (rightPaddleY > canvasHeight - paddleHeight) rightPaddleY = canvasHeight - paddleHeight;
}

function update() {
    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top & bottom collision
    if (ballY - ballRadius < 0) {
        ballY = ballRadius;
        ballSpeedY *= -1;
    }
    if (ballY + ballRadius > canvasHeight) {
        ballY = canvasHeight - ballRadius;
        ballSpeedY *= -1;
    }

    // Left paddle collision
    if (
        ballX - ballRadius < paddleMargin + paddleWidth &&
        ballY > leftPaddleY &&
        ballY < leftPaddleY + paddleHeight
    ) {
        ballX = paddleMargin + paddleWidth + ballRadius;
        ballSpeedX *= -1;
        // Add some "spin"
        let hitPoint = (ballY - (leftPaddleY + paddleHeight / 2)) / (paddleHeight / 2);
        ballSpeedY = hitPoint * 6;
    }

    // Right paddle collision (AI)
    if (
        ballX + ballRadius > canvasWidth - paddleMargin - paddleWidth &&
        ballY > rightPaddleY &&
        ballY < rightPaddleY + paddleHeight
    ) {
        ballX = canvasWidth - paddleMargin - paddleWidth - ballRadius;
        ballSpeedX *= -1;
        // Add some "spin"
        let hitPoint = (ballY - (rightPaddleY + paddleHeight / 2)) / (paddleHeight / 2);
        ballSpeedY = hitPoint * 6;
    }

    // Ball out of left or right bounds: reset
    if (ballX < 0 || ballX > canvasWidth) {
        resetBall();
    }

    aiMove();
}

function draw() {
    // Clear
    drawRect(0, 0, canvasWidth, canvasHeight, '#111');
    drawNet();

    // Draw paddles
    drawRect(paddleMargin, leftPaddleY, paddleWidth, paddleHeight);
    drawRect(canvasWidth - paddleMargin - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);

    // Draw ball
    drawCircle(ballX, ballY, ballRadius);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();