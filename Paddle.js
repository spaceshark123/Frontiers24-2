class Paddle {
    offset = -1;
    predY = -1;
    pointList = [];
    //sim variance is the variance of the simulated ball velocity vector, allowing control of bot accuracy
    simVariance = 0;
    simLookahead = 500;
    constructor(x, y, l, w, side, c) {
        this.x = x;
        this.y = y;
        this.l = l;
        this.w = w;
        this.side = side;
        this.c = c;
        this.vy = 0;
    }

    draw(ctx) {
        ctx.fillStyle = this.c;
        ctx.strokeStyle = "black";
        //set solid line
        ctx.setLineDash([]);
        ctx.lineWidth = 2;

        ctx.fillRect(this.x, this.y, this.w, this.l);
        ctx.strokeRect(this.x, this.y, this.w, this.l);
    }

    move(isCPU, ball, ctx) {
        if (isCPU) {
            // ball.y <- where the ball is
            // this.y <- where the paddle is
            // this.l <- how long the paddle is

            if (this.offset === -1) {
                this.offset = Math.floor(Math.random() * 45);
            }
            if ((ball.vx < 0 && this.side === SIDE.RIGHT) || (ball.vx > 0 && this.side === SIDE.LEFT)) {
                //moving away
                //reset the offset to new random
                this.offset = Math.min(Math.max(paddleVelocity, Math.floor(Math.random() * 45)), this.l / 2);
            }
            //simulate trajectory
            let angle = this.offset * this.simVariance - this.simVariance / 2;
            let simVx = Math.cos(angle) * ball.vx - Math.sin(angle) * ball.vy;
            let simVy = Math.sin(angle) * ball.vx + Math.cos(angle) * ball.vy;
            let ballSim = new Ball(ball.x, ball.y, simVx, simVy, ball.r, ball.c);
            //simulate the ball movement
            this.pointList = [];
            let i = 0;
            if (this.side === SIDE.RIGHT) {
                while (ballSim.x < this.x - ball.r && i < this.simLookahead) {
                    ballSim.move();
                    ballSim.bounce(ctx, walls);
                    this.pointList.push({ x: ballSim.x, y: ballSim.y });
                    i++;
                }
            } else {
                while (ballSim.x > this.x + this.w + ball.r && i < this.simLookahead) {
                    ballSim.move();
                    ballSim.bounce(ctx, walls);
                    this.pointList.push({ x: ballSim.x, y: ballSim.y });
                    i++;
                }
            }
            this.predY = ballSim.y;
            
            //move to the ballSim.y (add a deadzone to prevent jittering)
            if (this.predY > this.y + this.l / 2) {
                this.vy = paddleVelocity;
            }
            else if (this.predY < this.y + this.l / 2) {
                this.vy = -paddleVelocity;
            }
            if (Math.abs(this.predY - this.y - this.l / 2) < this.offset) {
                this.vy = 0;
            }
            // don't set this.y! (cheating)
            //this.vy = paddleVelocity; // <-- change this
        }
        this.y += this.vy;
        if(this.y < 0) {
            this.y = 0;
        }
        if(this.y + this.l > boardHeight) {
            this.y = boardHeight - this.l;
        }
    }
}
