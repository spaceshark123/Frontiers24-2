class Ball {
    constructor(x, y, vx, vy, r, c){
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.r = r;
        this.c = c;
    }

    draw(ctx) {
        ctx.fillStyle = this.c;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;
    }

    /**
     * Causes the ball to bounce off of objects on the screen
     * @param {*} things a collection of bounceable things 
     * @returns the side that scored a point, or SIDE.NONE
     */
    bounce(ctx, things) {
        this.bounceWalls();
        for (let i = 0; i < things.length; i++) {
            this.bounceOffLineSegment(things[i].x1, things[i].y1, things[i].x2, things[i].y2);
        }
        let side;
        side = this.bounceLeftPaddle(paddleL);
        if (side != SIDE.NONE) return side;
        side = this.bounceRightPaddle(paddleR);
        if (side != SIDE.NONE) return side;
        //bounce off test line
        return SIDE.NONE;
    }

    playSound() {
        // let audio = document.getElementById("bounce");
        // audio.play();
    }

    bounceWalls() {
        if (this.y - this.r < 0) {
            this.vy = Math.abs(this.vy);
            //this.vy += Math.random() * 0.05 - 0.025;
            this.playSound();
        }
        if (this.y + this.r > boardHeight) {
            this.vy = -Math.abs(this.vy);
            //this.vy += Math.random() * 0.05 - 0.025;
            this.playSound();
        }
        if(this.x - this.r < 0) {
            this.vx = Math.abs(this.vx);
            //this.vy += Math.random() * 0.05 - 0.025;
            this.playSound();
        }
        if(this.x + this.r > boardWidth) {
            this.vx = -1 * Math.abs(this.vx);
            //this.vy += Math.random() * 0.05 - 0.025;
            this.playSound();
        }
        return SIDE.NONE;
    }

    bounceLeftPaddle(paddle) {
        // Previous position of the ball
        let prevX = this.x - this.vx;
        let prevY = this.y - this.vy;
    
        if (this.x - this.r > paddle.x + paddle.w) return SIDE.NONE;
        // Check if the ball's path intersects with the paddle
        let intersectionPoint = this.intersect(prevX, prevY, this.x, this.y, paddle.x + paddle.w + this.r, paddle.y - 5, paddle.x + paddle.w + this.r, paddle.y + paddle.l + 5);
        if (intersectionPoint && this.vx < 0) {
            //go to the intersection point
            this.x = intersectionPoint.x;
            this.y = intersectionPoint.y;
            //bounce
            this.vx = paddleForce * Math.abs(this.vx);
            let paddlePos = (this.y - paddle.y - paddle.l/2) / paddle.l * 2; // between -1.0 and 1.0
            this.vy = this.vy + paddlePos * paddleSpin + paddle.vy * 0.5;
            //this.vy += Math.random() * 0.05 - 0.025;
            this.playSound();
        }
        if (this.x < paddle.x) return SIDE.RIGHT; // Someone got a point...
        return SIDE.NONE;
    }

    bounceRightPaddle(paddle) {
        // Previous position of the ball
        let prevX = this.x - this.vx;
        let prevY = this.y - this.vy;
    
        if (this.x + this.r < paddle.x) return SIDE.NONE;
        // Check if the ball's path intersects with the paddle
        let intersectionPoint = this.intersect(prevX, prevY, this.x, this.y, paddle.x - this.r, paddle.y - 5, paddle.x - this.r, paddle.y + paddle.l + 5);
        if (intersectionPoint && this.vx > 0) {
            //go to the intersection point
            this.x = intersectionPoint.x;
            this.y = intersectionPoint.y;
            //bounce
            this.vx = -paddleForce * Math.abs(this.vx);
            let paddlePos = (this.y - paddle.y - paddle.l/2) / paddle.l * 2; // between -1.0 and 1.0
            this.vy = this.vy + paddlePos * paddleSpin + paddle.vy * 0.5;
            //this.vy += Math.random() * 0.05 - 0.025;
            this.playSound();
        }
        if (this.x > paddle.x + paddle.w) return SIDE.LEFT; // Someone got a point...
        return SIDE.NONE;
    }

    // line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
    intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

    // Check if none of the lines are of length 0
      if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
          return false
      }
  
      let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  
    // Lines are parallel
      if (denominator === 0) {
          return false
      }
  
      let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
      let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  
    // is the intersection along the segments
      if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
          return false
      }
  
    // Return a object with the x and y coordinates of the intersection
      let x = x1 + ua * (x2 - x1)
      let y = y1 + ua * (y2 - y1)
  
      return {x, y}
    }
    
    bounceOffLineSegment(x1, y1, x2, y2) {
        //check if length is 0
        if (x1 === x2 && y1 === y2) {
            return;
        }

        // Previous position of the ball
        let prevX = this.x - this.vx;
        let prevY = this.y - this.vy;
    
        // Move the line segment towards the ball by the radius
        let dy = y2 - y1;
        let dx = x2 - x1;
        let normal = { x: -dy, y: dx };
        let length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
        normal.x /= length;
        normal.y /= length;

        //normalize the velocity vector
        let vLength = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        let vxNorm = this.vx / vLength;
        let vyNorm = this.vy / vLength;

        //flip the normal to point towards the ball
        let dot = vxNorm * normal.x + vyNorm * normal.y;
        if (dot > 0) {
            normal.x *= -1;
            normal.y *= -1;
        }
    
        // New line segment positions
        let adjustedX1 = x1 + normal.x * (this.r+2);
        let adjustedY1 = y1 + normal.y *(this.r+2);
        let adjustedX2 = x2 + normal.x * (this.r+2);
        let adjustedY2 = y2 + normal.y * (this.r + 2);
    
        // // Check if the ball's path intersects with the adjusted line segment
        let intersectionPoint = this.intersect(prevX, prevY, this.x, this.y, adjustedX1, adjustedY1, adjustedX2, adjustedY2);
        // let intersectionPoint = { x: boardWidth / 2 + 50, y: this.y };
        // //if balls path intersects with line segment and ball is moving towards the line segment
        if (intersectionPoint) {
            // Move the ball to the intersection point
            this.x = intersectionPoint.x;
            this.y = intersectionPoint.y;
    
            let vxNew = this.vx - 2 * (this.vx * normal.x + this.vy * normal.y) * normal.x;
            let vyNew = this.vy - 2 * (this.vx * normal.x + this.vy * normal.y) * normal.y;

            this.vx = vxNew;
            this.vy = vyNew;
        }
    }
}