const gameboard = document.getElementById("gameboard");
const cpucheck1 = document.getElementById("cpucheck1");
const cpucheck2 = document.getElementById("cpucheck2");
const ctx = gameboard.getContext("2d");
const STATE = { STARTUP: 0, PLAYING: 1, GAMEOVER: 2 };
const SIDE = { NONE: 0, LEFT: 1, RIGHT: 2 };

let boardWidth = 500;
let boardHeight = 500;
let paddleWidth = 25;
let paddleLength = 100;
let ballRadius = 12.5;
let paddleVelocity = 7;
let paddleSpin = 1.5; // >= 0.0
let paddleForce = 1.1; // >= 1.0

let ball = null;
let paddleL;
let paddleR;
let scoreL = 0;
let scoreR = 0;
let state = STATE.STARTUP;
let frameID;
let enableTrajectory = true;

let botVariance = [0.01, 0.01, 0.01, 0.005, 0];
let botLookahead = [0, 25, 50, 200, 500];

let walls = [];

//set gameboard width and height to be 16:9 and fit the screen
function resizeGameboard() {
    let min = Math.min(window.innerWidth * 0.65, window.innerHeight * 0.65);
    boardWidth = min * 16 / 9;
    boardHeight = min;
    gameboard.width = boardWidth;
    gameboard.height = boardHeight;
}
resizeGameboard();

function resetGame() {
    state = STATE.STARTUP;
    paused = false;
    cancelAnimationFrame(frameID);
    scoreL = 0;
    scoreR = 0;
    //if paddleR exists, reset it
    if (paddleR) {
        paddleR.predY = -1;
        paddleR.offset = -1;
    }
    nextTick();
}

let paused = false;
function pause() {
    cancelAnimationFrame(frameID);
    paused = true;
}

function unpause() {
    paused = false;
    nextTick();
}

function nextTick() {
    switch (state){
        case STATE.STARTUP:
            state = startup();
            break;
        case STATE.PLAYING:
            state = playing();
            break;
        case STATE.GAMEOVER:
            state = gameover();
            break;
        default:
            state = STATE.STARTUP;
            break;
    }
    if(!paused)
        frameID = requestAnimationFrame(nextTick);
}

resetGame();

function startup() {
    let velx = Math.random() > 0.5 ? 5 : -5;
    let vely = Math.random() * 5 - 2.5;

    ball = new Ball(boardWidth / 2, boardHeight / 2, velx, vely, ballRadius, "#F4A950");
    paddleL = new Paddle(0 + paddleWidth / 2, boardHeight / 2 - paddleLength / 2, paddleLength, paddleWidth, SIDE.LEFT, "#F4A950");
    paddleR = new Paddle(boardWidth - paddleWidth * 1.5, boardHeight / 2 - paddleLength / 2, paddleLength, paddleWidth, SIDE.RIGHT, "#F4A950");
    paddleR.predY = -1;
    paddleR.offset = -1;
    updateDifficulty();
    updateSpeed();
    toggleTrajectory();
    return STATE.PLAYING;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function playing() {
    //get input from keys
    if (keys.KeyW || keys.KeyS) {
        paddleL.vy += keys.KeyW ? -paddleVelocity : paddleVelocity;
    } else {
        paddleL.vy = 0;
    }
    paddleL.vy = clamp(paddleL.vy, -paddleVelocity, paddleVelocity);
    if (keys.ArrowUp || keys.ArrowDown) {
        paddleR.vy += keys.ArrowUp ? -paddleVelocity : paddleVelocity;
    } else {
        paddleR.vy = 0;
    }
    paddleR.vy = clamp(paddleR.vy, -paddleVelocity, paddleVelocity);

    paddleL.move(cpucheck1.checked, ball, ctx);
    paddleR.move(cpucheck2.checked, ball, ctx);

    updateMouseColl();

    ball.move();
    let sideScore = ball.bounce(ctx, walls);
    if (sideScore !== SIDE.NONE) { 
        if(sideScore === SIDE.LEFT){
            scoreL++;
        }
        if(sideScore === SIDE.RIGHT){
            scoreR++;
        }
        let velx = Math.random() > 0.5 ? 5 : -5;
        let vely = Math.random() * 5 - 2.5;
        ball = new Ball(boardWidth / 2, boardHeight / 2, velx, vely, ballRadius, "#F4A950");
        paddleR.predY = -1;
        paddleR.offset = -1;
    }
    draw();
    if(scoreL === 7 || scoreR === 7){
        return STATE.GAMEOVER;
    }
    return STATE.PLAYING;
}

function gameover(){
    ctx.font = "100px courier";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", boardWidth / 2, boardHeight / 2 + 25);
    ctx.strokeStyle = "#F4A950";
    ctx.lineWidth = 5;
    ctx.stroke();
    console.log("game over");
    return STATE.GAMEOVER;
}

function updateDifficulty() {
    console.log("update difficulty");
    let slider = document.getElementById("difficulty");
    let index = parseInt(slider.value - 1);
    paddleR.simVariance = botVariance[index];
    paddleR.simLookahead = botLookahead[index];
    paddleL.simVariance = botVariance[index];
    paddleL.simLookahead = botLookahead[index];
}

function updateSpeed() {
    console.log("update speed");
    let slider = document.getElementById("speed");
    paddleVelocity = parseInt(slider.value);
}

function toggleTrajectory() {
    let trajectory = document.getElementById("trajectorycheck");
    enableTrajectory = trajectory.checked;
}

function clearBoard(){
    ctx.fillStyle = "#161B21";
    ctx.fillRect(0, 0, boardWidth, boardHeight);
}

function draw() {
    //rgb
    clearBoard();
    //draw vertical line down middle dashed
    ctx.strokeStyle = "#F4A950";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(boardWidth/2, 0);
    ctx.lineTo(boardWidth/2, boardHeight);
    ctx.stroke();
    
    //use paddleR pointlist to draw trajectory
    if (paddleR.predY !== -1 && enableTrajectory) {
        for(let i = 1; i < paddleR.pointList.length; i++){
            //draw line from previous point to current point
            ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
            ctx.setLineDash([]);
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.moveTo(paddleR.pointList[i - 1].x, paddleR.pointList[i - 1].y);
            ctx.lineTo(paddleR.pointList[i].x, paddleR.pointList[i].y);
            ctx.stroke();
        }
    }
    //use paddleL pointlist to draw trajectory
    if (paddleL.predY !== -1 && enableTrajectory) {
        for(let i = 1; i < paddleL.pointList.length; i++){
            //draw line from previous point to current point
            ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
            ctx.setLineDash([]);
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.moveTo(paddleL.pointList[i - 1].x, paddleL.pointList[i - 1].y);
            ctx.lineTo(paddleL.pointList[i].x, paddleL.pointList[i].y);
            ctx.stroke();
        }
    }
    ball.draw(ctx);
    paddleL.draw(ctx);
    paddleR.draw(ctx);

    drawScore();
}

function worldToCanvas(x, y) {
    // const transform = ctx.getTransform();
    // const invertedScaleX = 1 / transform.a;
    // const invertedScaleY = 1 / transform.d;
    // const transformedX = invertedScaleX * x - invertedScaleX * transform.e;
    // const transformedY = invertedScaleY * y - invertedScaleY * transform.f;
    // return { x: transformedX, y: transformedY };

    // const transform = ctx.getTransform();
    // const transformedX = x - transform.e;
    // const transformedY = y - transform.f;
    // return { x: transformedX, y: transformedY };
    
    return { x: x - gameboard.getBoundingClientRect().left, y: y - gameboard.getBoundingClientRect().top - window.scrollY};
}

function drawScore() {
    ctx.font = "100px courier";
    ctx.fillStyle = "#F4A950";
    ctx.textAlign = "center";
    ctx.fillText(`${scoreL}  ${scoreR}`, boardWidth / 2, 100);
}

function updateMouseColl() {
    //draw lines between each of the dots in the trail, converting their world coordinates to canvas coordinates
    
    //convert all dots to canvas coordinates
    let canvasDots = [];
    for (let i = 0; i < dots.length; i++) {
        canvasDots.push(worldToCanvas(dots[i].x, dots[i].y));
    }
    //draw lines between each dot
    ctx.strokeStyle = "#F4A950";
    ctx.lineWidth = 5;
    ctx.beginPath();
    walls = [];
    for (let i = 1; i < canvasDots.length; i++) {
        ctx.moveTo(canvasDots[i - 1].x, canvasDots[i - 1].y);
        ctx.lineTo(canvasDots[i].x, canvasDots[i].y);
        walls.push({ x1: canvasDots[i - 1].x, y1: canvasDots[i - 1].y, x2: canvasDots[i].x, y2: canvasDots[i].y });
    }
    ctx.stroke();
}