const BALL_ORIGIN = new Vector2(31, 32);
const BALL_DIAMETER = 60;

// Stronger table friction (tune these)
const LINEAR_DAMPING = 3.8;
const STOP_SPEED    = 6;   // was 10: don't snap to rest so early

function Ball(position, color) {
    this.position = position; // Initialize the ball's position
    this.velocity = new Vector2(); // Initialize the ball's velocity
    this.size = { width: 60, height: 60 }; // Set the desired size of the ball
    this.color = color; // store logical color for rules/scoring
    this.sprite = getBallSpriteByColor(color);
    this.moving = false;
}

Ball.prototype.update = function(delta) { 
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;

    // Frame-rate independent damping
    const damp = Math.exp(-LINEAR_DAMPING * delta);
    this.velocity = this.velocity.mult(damp);

    if (this.velocity.length() < STOP_SPEED) {
        this.velocity = new Vector2();
        this.moving = false;
    } else {
        this.moving = true;
    }
};

Ball.prototype.draw = function() { 
    if (this.sprite && this.sprite.complete) { // Ensure the image is loaded and complete
        Canvas.canvasContext.drawImage(
            this.sprite, 
            this.position.x - BALL_ORIGIN.x, // Adjust position to center the ball
            this.position.y - BALL_ORIGIN.y, 
            this.size.width, // Scale width
            this.size.height // Scale height
        );
    } else {
        console.error("Ball sprite is not loaded or complete.");
    }
};

Ball.prototype.shoot = function(power, rotation) {
    const strength = 1.7;
    this.velocity = new Vector2(
        power * Math.cos(rotation) * strength,
        power * Math.sin(rotation) * strength
    );
    this.moving = true;
    if (window.Sound) Sound.play('strike', 0.9);
};

// Simple equal-mass elastic collision with full depenetration
Ball.prototype.collideWith = function(other){
    if (!other || other === this) return;

    const n = this.position.subtract(other.position);
    const dist = n.length();
    const minDist = BALL_DIAMETER;
    if (dist === 0 || dist >= minDist) return;

    const un = n.mult(1 / dist);
    const ut = new Vector2(-un.y, un.x);

    // 1) Full depenetration (split evenly)
    const penetration = minDist - dist;
    const corr = un.mult(penetration / 2);
    this.position = this.position.add(corr);
    other.position = other.position.subtract(corr);

    // 2) Resolve velocities (equal mass)
    const v1 = this.velocity;
    const v2 = other.velocity;

    const v1n = un.dot(v1);
    const v1t = ut.dot(v1);
    const v2n = un.dot(v2);
    const v2t = ut.dot(v2);

    // Ignore tiny/grazing contacts, but NOT when penetration is noticeable
    // Relative normal speed; approaching if negative
    const relN = v1n - v2n;
    const impact = Math.max(0, -relN);
    const vol = Math.max(0, Math.min(1, impact / 450)); // tune 350–500
    if (vol > 0.08 && window.Sound) Sound.play('balls', vol);

    // Restitution (bounce) and small tangential damping
    const e = 0.92;
    const TANGENT_DAMP = 0.06;

    // Equal-mass 1D solution along the normal
    const v1nPrime = (v1n * (1 - e) + v2n * (1 + e)) / 2;
    const v2nPrime = (v2n * (1 - e) + v1n * (1 + e)) / 2;

    // Slightly damp tangential components
    const v1tPrime = v1t * (1 - TANGENT_DAMP);
    const v2tPrime = v2t * (1 - TANGENT_DAMP);

    this.velocity  = ut.mult(v1tPrime).add(un.mult(v1nPrime));
    other.velocity = ut.mult(v2tPrime).add(un.mult(v2nPrime));
};

