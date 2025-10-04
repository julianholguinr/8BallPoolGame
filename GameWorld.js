const DELTA = 1/100;
const CUSHION_E = 0.92; // rail bounciness (0.85–0.95)

function GameWorld(options) {
    options = options || {};

    // Player display names provided by Auth flow
    this.playerNames = options.playerNames ? {
        PLAYER: options.playerNames.PLAYER || 'Player 1',
        GUEST: options.playerNames.GUEST || 'Player 2'
    } : { PLAYER: 'Player 1', GUEST: 'Player 2' };

    this.whiteBall = new Ball(new Vector2(350, 520), COLOR.WHITE);

    // Scores: Red vs Yellow
    this.score = {
        playerRed: 0,     // red balls potted (associated with PLAYER)
        guestYellow: 0,   // yellow balls potted (associated with GUEST)
        blackPotted: false
    };

    // Turn state
    this.currentTurn = 'PLAYER'; // 'PLAYER' (Red) or 'GUEST' (Yellow)
    this.shotActive = false;
    this.pottedThisTurn = false;
    this.wrongPottedThisTurn = false; // if true, force turn switch at end of shot
    this.pottedCorrectThisTurn = false; // track if a correct-colored ball was potted this shot

    // Game over state
    this.gameOver = false;
    this.winner = null; // 'PLAYER' or 'GUEST'

    // Pause state
    this.paused = false;

    // Shot clock
    this.shotClockDuration = 15; // seconds
    this.shotClock = this.shotClockDuration;
    this.shotClockActive = false;

    // Revert to original placement (no extra spacing/shift)
    const xShift = 300;
    const yShift = 150;
    const spacing = 1.0;
    const spacingX = 1.25;
    const spacingY = 1.25;

    this.balls = [
        new Ball(new Vector2((1019 - 1019) * spacingX + 1019 + xShift, (395 - 395) * spacingY + 395 + yShift), COLOR.YELLOW),
        new Ball(new Vector2((1053 - 1019) * spacingX + 1019 + xShift, (375 - 395) * spacingY + 395 + yShift), COLOR.YELLOW),
        new Ball(new Vector2((1053 - 1019) * spacingX + 1019 + xShift, (415 - 395) * spacingY + 395 + yShift), COLOR.RED),
        new Ball(new Vector2((1087 - 1019) * spacingX + 1019 + xShift, (356 - 395) * spacingY + 395 + yShift), COLOR.RED),
        new Ball(new Vector2((1087 - 1019) * spacingX + 1019 + xShift, (395 - 395) * spacingY + 395 + yShift), COLOR.BLACK),
        new Ball(new Vector2((1087 - 1019) * spacingX + 1019 + xShift, (434 - 395) * spacingY + 395 + yShift), COLOR.YELLOW),
        new Ball(new Vector2((1123 - 1019) * spacingX + 1019 + xShift, (336 - 395) * spacingY + 395 + yShift), COLOR.YELLOW),
        new Ball(new Vector2((1123 - 1019) * spacingX + 1019 + xShift, (375 - 395) * spacingY + 395 + yShift), COLOR.RED),
        new Ball(new Vector2((1123 - 1019) * spacingX + 1019 + xShift, (415 - 395) * spacingY + 395 + yShift), COLOR.YELLOW),
        new Ball(new Vector2((1123 - 1019) * spacingX + 1019 + xShift, (454 - 395) * spacingY + 395 + yShift), COLOR.RED),
        new Ball(new Vector2((1159 - 1019) * spacingX + 1019 + xShift, (317 - 395) * spacingY + 395 + yShift), COLOR.RED),
        new Ball(new Vector2((1159 - 1019) * spacingX + 1019 + xShift, (356 - 395) * spacingY + 395 + yShift), COLOR.RED),
        new Ball(new Vector2((1159 - 1019) * spacingX + 1019 + xShift, (395 - 395) * spacingY + 395 + yShift), COLOR.YELLOW),
        new Ball(new Vector2((1159 - 1019) * spacingX + 1019 + xShift, (434 - 395) * spacingY + 395 + yShift), COLOR.RED),
        new Ball(new Vector2((1159 - 1019) * spacingX + 1019 + xShift, (473 - 395) * spacingY + 395 + yShift), COLOR.YELLOW)
    ];

    this.stick = new Stick(
        this.whiteBall.position.copy(),
        (power, angle) => {
            // mark shot start
            this.shotActive = true;
            this.pottedThisTurn = false;
            this.wrongPottedThisTurn = false;
            this.whiteBall.shoot(power, angle);
        }
    );

    // Helper to get target color for current turn
    this.getTargetColor = () => (this.currentTurn === 'PLAYER' ? COLOR.RED : COLOR.YELLOW);

    // Inner playfield bounds (tweak to fit your background image)
    this.bounds = {
        left: 75,
        right: Canvas.canvas.width - 75,
        top: 75,
        bottom: Canvas.canvas.height - 75
    };

    // Pocket positions (6) and radius
    this.pocketRadius = 49; // enlarged slightly for easier poyyyyytfddotting (ball radius is ~30)
    const b = this.bounds;
    this.pockets = [
        new Vector2(b.left + 10, b.top + 10),
        new Vector2((b.left + b.right) / 2, b.top + 8),
        new Vector2(b.right - 10, b.top + 10),
        new Vector2(b.left + 10, b.bottom - 10),
        new Vector2((b.left + b.right) / 2, b.bottom - 8),
        new Vector2(b.right - 10, b.bottom - 10),
    ];
}

GameWorld.prototype.reset = function() {
    // Reset scores
    this.score.playerRed = 0;
    this.score.guestYellow = 0;
    this.score.blackPotted = false;

    // Reset turn state
    this.currentTurn = 'PLAYER';
    this.shotActive = false;
    this.pottedThisTurn = false;
    this.wrongPottedThisTurn = false;
    this.pottedCorrectThisTurn = false;

    // Reset game over
    this.gameOver = false;
    this.winner = null;

    // Reset shot clock
    this.shotClock = this.shotClockDuration;
    this.shotClockActive = false;

    // Reset pause
    this.paused = false;

    // Reset white ball position
    this.whiteBall.position = new Vector2(350, 520);
    this.whiteBall.velocity = new Vector2(0, 0);

    // Reset colored balls to initial positions
    this.balls = [
        new Ball(new Vector2((1019 - 1019) * 1.25 + 1019 + 300, (395 - 395) * 1.25 + 395 + 150), COLOR.YELLOW),
        new Ball(new Vector2((1053 - 1019) * 1.25 + 1019 + 300, (375 - 395) * 1.25 + 395 + 150), COLOR.YELLOW),
        new Ball(new Vector2((1053 - 1019) * 1.25 + 1019 + 300, (415 - 395) * 1.25 + 395 + 150), COLOR.RED),
        new Ball(new Vector2((1087 - 1019) * 1.25 + 1019 + 300, (356 - 395) * 1.25 + 395 + 150), COLOR.RED),
        new Ball(new Vector2((1087 - 1019) * 1.25 + 1019 + 300, (395 - 395) * 1.25 + 395 + 150), COLOR.BLACK),
        new Ball(new Vector2((1087 - 1019) * 1.25 + 1019 + 300, (434 - 395) * 1.25 + 395 + 150), COLOR.YELLOW),
        new Ball(new Vector2((1123 - 1019) * 1.25 + 1019 + 300, (336 - 395) * 1.25 + 395 + 150), COLOR.YELLOW),
        new Ball(new Vector2((1123 - 1019) * 1.25 + 1019 + 300, (375 - 395) * 1.25 + 395 + 150), COLOR.RED),
        new Ball(new Vector2((1123 - 1019) * 1.25 + 1019 + 300, (415 - 395) * 1.25 + 395 + 150), COLOR.YELLOW),
        new Ball(new Vector2((1123 - 1019) * 1.25 + 1019 + 300, (454 - 395) * 1.25 + 395 + 150), COLOR.RED),
        new Ball(new Vector2((1159 - 1019) * 1.25 + 1019 + 300, (317 - 395) * 1.25 + 395 + 150), COLOR.RED),
        new Ball(new Vector2((1159 - 1019) * 1.25 + 1019 + 300, (356 - 395) * 1.25 + 395 + 150), COLOR.RED),
        new Ball(new Vector2((1159 - 1019) * 1.25 + 1019 + 300, (395 - 395) * 1.25 + 395 + 150), COLOR.YELLOW),
        new Ball(new Vector2((1159 - 1019) * 1.25 + 1019 + 300, (434 - 395) * 1.25 + 395 + 150), COLOR.RED),
        new Ball(new Vector2((1159 - 1019) * 1.25 + 1019 + 300, (473 - 395) * 1.25 + 395 + 150), COLOR.YELLOW)
    ];

    // Reset stick
    this.stick = new Stick(
        this.whiteBall.position.copy(),
        (power, angle) => {
            this.shotActive = true;
            this.pottedThisTurn = false;
            this.wrongPottedThisTurn = false;
            this.whiteBall.shoot(power, angle);
        }
    );
};

function isBallStopped(ball) {
    return Math.abs(ball.velocity.x) < 0.1 && Math.abs(ball.velocity.y) < 0.1;
}

GameWorld.prototype.handleCollisions = function() {
    // Collisions between colored balls
    for (let i = 0; i < this.balls.length; i++) {
        for (let j = i + 1; j < this.balls.length; j++) {
            const ballA = this.balls[i];
            const ballB = this.balls[j];
            ballA.collideWith(ballB);
        }
    }
    // Collisions between white ball and colored balls
    for (let i = 0; i < this.balls.length; i++) {
        this.whiteBall.collideWith(this.balls[i]);
    }
};

GameWorld.prototype.handleCushionCollision = function(ball) {
    const r = ball.size.width / 2;
    let hit = false;

    if (ball.position.x - r < this.bounds.left) {
        ball.position.x = this.bounds.left + r;
        if (ball.velocity.x < 0) ball.velocity.x = -ball.velocity.x * CUSHION_E;
        hit = true;
    }
    if (ball.position.x + r > this.bounds.right) {
        ball.position.x = this.bounds.right - r;
        if (ball.velocity.x > 0) ball.velocity.x = -ball.velocity.x * CUSHION_E;
        hit = true;
    }
    if (ball.position.y - r < this.bounds.top) {
        ball.position.y = this.bounds.top + r;
        if (ball.velocity.y < 0) ball.velocity.y = -ball.velocity.y * CUSHION_E;
        hit = true;
    }
    if (ball.position.y + r > this.bounds.bottom) {
        ball.position.y = this.bounds.bottom - r;
        if (ball.velocity.y > 0) ball.velocity.y = -ball.velocity.y * CUSHION_E;
        hit = true;
    }

    // kill tiny jitter after glancing bounces
    if (hit) {
        const EPS = 3;
        if (Math.abs(ball.velocity.x) < EPS) ball.velocity.x = 0;
        if (Math.abs(ball.velocity.y) < EPS) ball.velocity.y = 0;
    }
};

// Call cushion collisions each frame (after integration)
GameWorld.prototype.update = function() {
    if (this.paused) return;

    // Integrate first
    this.whiteBall.update(DELTA);
    for (let ball of this.balls) ball.update(DELTA);

    // Rail collisions
    this.handleCushionCollision(this.whiteBall);
    for (let ball of this.balls) this.handleCushionCollision(ball);

    // Ball-ball collisions
    this.handleCollisions();

    // Pocket checks (remove sunk balls)
    const result = this.checkPockets();

    // Track per-shot outcomes
    if (result.pottedAny) this.pottedThisTurn = true;
    if (result.wrongPotted) this.wrongPottedThisTurn = true;
    if (result.pottedCorrect) this.pottedCorrectThisTurn = true;

    // Check black-ball endgame
    if (result.blackPottedOutcome) {
        this.gameOver = true;
        this.winner = result.blackPottedOutcome.winner; // 'PLAYER' or 'GUEST'
    }

    // Shot clock activation: start when it's player's turn and balls are stopped
    if (!this.gameOver && !this.shotActive && this.allBallsStopped()) {
        if (!this.shotClockActive) {
            this.shotClockActive = true;
            this.shotClock = this.shotClockDuration;
        }
    }

    // Shot clock countdown
    if (this.shotClockActive) {
        this.shotClock -= DELTA;
        if (this.shotClock <= 0) {
            // Time out: switch turn
            this.currentTurn = this.currentTurn === 'PLAYER' ? 'GUEST' : 'PLAYER';
            this.shotClock = this.shotClockDuration;
            this.shotClockActive = false;
        }
    }

    // If a shot was taken and all balls stopped, resolve turn (only if not game over)
    if (!this.gameOver && this.shotActive && this.allBallsStopped()) {
        // Rule: shoot again only if you potted at least one correct-colored ball
        const shootAgain = this.pottedCorrectThisTurn;
        if (!shootAgain) {
            this.currentTurn = this.currentTurn === 'PLAYER' ? 'GUEST' : 'PLAYER';
        }
        // reset shot state
        this.shotActive = false;
        this.pottedThisTurn = false;
        this.wrongPottedThisTurn = false;
        this.pottedCorrectThisTurn = false;
        // reset shot clock for next turn
        this.shotClock = this.shotClockDuration;
        this.shotClockActive = false;
    }
};

GameWorld.prototype.allBallsStopped = function() {
    if (this.whiteBall.moving) return false;
    for (let ball of this.balls) {
        if (ball.moving) return false;
    }
    return true;
};

GameWorld.prototype.draw = function() {
    Canvas.canvasContext.drawImage(Sprites.background, 0, 0, Canvas.canvas.width, Canvas.canvas.height);

    // Optional: visualize pockets (remove if undesired)
    const ctx = Canvas.canvasContext;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    for (const p of this.pockets) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.pocketRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Scoreboard UI
    ctx.font = '20px Arial';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(20, 20, 420, 110);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${this.playerNames.PLAYER} (Red): ${this.score.playerRed}`, 30, 30);
    ctx.fillText(`${this.playerNames.GUEST} (Yellow): ${this.score.guestYellow}`, 30, 54);
    ctx.fillText(`Turn: ${this.currentTurn === 'PLAYER' ? this.playerNames.PLAYER : this.playerNames.GUEST}`, 30, 78);
    const clockText = this.shotClockActive ? `Shot Clock: ${Math.ceil(this.shotClock)}s` : 'Shot Clock: --';
    ctx.fillText(clockText, 30, 102);

    // Menu button
    const menuBtnW = 100, menuBtnH = 40;
    const menuBtnX = Canvas.canvas.width - menuBtnW - 20;
    const menuBtnY = 20;
    this.menuButtonBounds = { x: menuBtnX, y: menuBtnY, w: menuBtnW, h: menuBtnH };
    ctx.fillStyle = '#666';
    ctx.fillRect(menuBtnX, menuBtnY, menuBtnW, menuBtnH);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    const menuLabel = 'Menu';
    const menuTextW = ctx.measureText(menuLabel).width;
    ctx.fillText(menuLabel, menuBtnX + (menuBtnW - menuTextW)/2, menuBtnY + 12);

    // Winner overlay
    if (this.gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        const title = this.winner === 'PLAYER' ? `${this.playerNames.PLAYER} Wins!` : `${this.playerNames.GUEST} Wins!`;
        const textWidth = ctx.measureText(title).width;
        ctx.fillText(title, (Canvas.canvas.width - textWidth) / 2, Canvas.canvas.height / 2 - 80);

        // Replay button
        const btnW = 260, btnH = 60;
        const btnX = (Canvas.canvas.width - btnW) / 2;
        const btnY = Canvas.canvas.height / 2;
        this.replayButtonBounds = { x: btnX, y: btnY, w: btnW, h: btnH };
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.fillStyle = '#fff';
        ctx.font = '28px Arial';
        const btnLabel = 'Play Again';
        const btnTextW = ctx.measureText(btnLabel).width;
        ctx.fillText(btnLabel, btnX + (btnW - btnTextW) / 2, btnY + 16);

        // Return to Menu button
        const btn2W = 260, btn2H = 60;
        const btn2X = (Canvas.canvas.width - btn2W) / 2;
        const btn2Y = Canvas.canvas.height / 2 + 80;
        this.returnButtonBounds = { x: btn2X, y: btn2Y, w: btn2W, h: btn2H };
        ctx.fillStyle = '#1976d2';
        ctx.fillRect(btn2X, btn2Y, btn2W, btn2H);
        ctx.fillStyle = '#fff';
        const btn2Label = 'Return to Menu';
        const btn2TextW = ctx.measureText(btn2Label).width;
        ctx.fillText(btn2Label, btn2X + (btn2W - btn2TextW) / 2, btn2Y + 16);
        ctx.restore();
        ctx.restore();
    } else if (this.paused) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        const pausedTitle = 'Paused';
        const pausedTextWidth = ctx.measureText(pausedTitle).width;
        ctx.fillText(pausedTitle, (Canvas.canvas.width - pausedTextWidth) / 2, Canvas.canvas.height / 2 - 80);

        // Resume button
        const resumeBtnW = 200, resumeBtnH = 60;
        const resumeBtnX = (Canvas.canvas.width - resumeBtnW) / 2;
        const resumeBtnY = Canvas.canvas.height / 2;
        this.resumeButtonBounds = { x: resumeBtnX, y: resumeBtnY, w: resumeBtnW, h: resumeBtnH };
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(resumeBtnX, resumeBtnY, resumeBtnW, resumeBtnH);
        ctx.fillStyle = '#fff';
        ctx.font = '28px Arial';
        const resumeLabel = 'Resume';
        const resumeTextW = ctx.measureText(resumeLabel).width;
        ctx.fillText(resumeLabel, resumeBtnX + (resumeBtnW - resumeTextW) / 2, resumeBtnY + 16);

        // Reset button
        const resetBtnW = 200, resetBtnH = 60;
        const resetBtnX = (Canvas.canvas.width - resetBtnW) / 2;
        const resetBtnY = Canvas.canvas.height / 2 + 80;
        this.resetButtonBounds = { x: resetBtnX, y: resetBtnY, w: resetBtnW, h: resetBtnH };
        ctx.fillStyle = '#f44336';
        ctx.fillRect(resetBtnX, resetBtnY, resetBtnW, resetBtnH);
        ctx.fillStyle = '#fff';
        const resetLabel = 'Reset Game';
        const resetTextW = ctx.measureText(resetLabel).width;
        ctx.fillText(resetLabel, resetBtnX + (resetBtnW - resetTextW) / 2, resetBtnY + 16);

        ctx.restore();
    } else {
        ctx.restore();

        if (this.allBallsStopped()) {
            this.stick.draw(this.whiteBall.position);
        }
        this.whiteBall.draw();
        for (let ball of this.balls) {
            ball.draw();
        }
    }
};

GameWorld.prototype.handleClick = function(x, y) {
    if (this.gameOver) {
        if (x >= this.replayButtonBounds.x && x <= this.replayButtonBounds.x + this.replayButtonBounds.w &&
            y >= this.replayButtonBounds.y && y <= this.replayButtonBounds.y + this.replayButtonBounds.h) {
            this.reset();
        } else if (x >= this.returnButtonBounds.x && x <= this.returnButtonBounds.x + this.returnButtonBounds.w &&
                   y >= this.returnButtonBounds.y && y <= this.returnButtonBounds.y + this.returnButtonBounds.h) {
            // For simplicity, treat as reset; in a real app, this might navigate to menu
            this.reset();
        }
    } else if (this.paused) {
        if (x >= this.resumeButtonBounds.x && x <= this.resumeButtonBounds.x + this.resumeButtonBounds.w &&
            y >= this.resumeButtonBounds.y && y <= this.resumeButtonBounds.y + this.resumeButtonBounds.h) {
            this.paused = false;
        } else if (x >= this.resetButtonBounds.x && x <= this.resetButtonBounds.x + this.resetButtonBounds.w &&
                   y >= this.resetButtonBounds.y && y <= this.resetButtonBounds.y + this.resetButtonBounds.h) {
            this.reset();
        }
    } else {
        if (x >= this.menuButtonBounds.x && x <= this.menuButtonBounds.x + this.menuButtonBounds.w &&
            y >= this.menuButtonBounds.y && y <= this.menuButtonBounds.y + this.menuButtonBounds.h) {
            this.paused = true;
        }
    }
};

GameWorld.prototype.movingBalls = function() {

    let movingBalls = false;

    for( let i = 0; i < this.balls.length; i++ ) {
        if(this.balls[i].moving) {
            movingBalls = true;
            break;
        }
    }

    return movingBalls;
};

// Check if a ball is within any pocket radius and handle potting
GameWorld.prototype.checkPockets = function() {
    const rBall = 30; // ball radius (size.width/2)
    const pocketR2 = (this.pocketRadius - 2) * (this.pocketRadius - 2);
    let pottedAny = false;
    let wrongPotted = false;
    const targetColor = this.getTargetColor();

    // Check colored balls and tally scores
    const remained = [];
    let pottedCorrect = false;
    for (const ball of this.balls) {
        let potted = false;
        for (const p of this.pockets) {
            const dx = ball.position.x - p.x;
            const dy = ball.position.y - p.y;
            const dist2 = dx*dx + dy*dy;
            if (dist2 <= pocketR2) {
                // Score update based on ball color
                if (ball.color === COLOR.RED) this.score.playerRed++;
                else if (ball.color === COLOR.YELLOW) this.score.guestYellow++;
                else if (ball.color === COLOR.BLACK) this.score.blackPotted = true;

                // Evaluate correctness (ignore black)
                if (ball.color === COLOR.RED || ball.color === COLOR.YELLOW) {
                    if (ball.color === targetColor) pottedCorrect = true;
                    else wrongPotted = true;
                }

                potted = true;
                pottedAny = true;
                break;
            }
        }
        if (!potted) remained.push(ball);
    }
    this.balls = remained;

    // Check cue ball
    for (const p of this.pockets) {
        const dx = this.whiteBall.position.x - p.x;
        const dy = this.whiteBall.position.y - p.y;
        const dist2 = dx*dx + dy*dy;
        if (dist2 <= pocketR2) {
            // Respawn cue ball at a safe spot
            this.whiteBall.position = new Vector2(350, 520);
            this.whiteBall.velocity = new Vector2(0, 0);
            this.whiteBall.moving = false;
            // Do NOT count cue ball as a "potted" for extra turn
            break;
        }
    }

    // Determine black-ball outcome if black was potted
    let blackPottedOutcome = null;
    if (this.score.blackPotted) {
        // Count remaining reds/yellows
        let redsLeft = 0, yellowsLeft = 0;
        for (const b of this.balls) {
            if (b.color === COLOR.RED) redsLeft++;
            else if (b.color === COLOR.YELLOW) yellowsLeft++;
        }
        // Who potted the black? It's the shooter of this turn
        const shooter = this.currentTurn; // 'PLAYER' or 'GUEST'
        const shooterCleared = shooter === 'PLAYER' ? (redsLeft === 0) : (yellowsLeft === 0);
        if (shooterCleared) {
            blackPottedOutcome = { winner: shooter };
        } else {
            blackPottedOutcome = { winner: shooter === 'PLAYER' ? 'GUEST' : 'PLAYER' };
        }
        // Prevent double-processing in future frames
        this.score.blackPotted = false;
    }

    return { pottedAny, wrongPotted, pottedCorrect, blackPottedOutcome };
};
