const STICK_ORIGIN = new Vector2(850, 87.5);
const STICK_SHOT_ORIGIN = new Vector2(850, 87.5);

// Charging and visuals
const MAX_POWER = 7000;
const CHARGE_RATE = 100;      // keep your current charge rate
const PULLBACK_MAX = 300;     // max visual pullback (px)
const PULLBACK_EASE = 0.8;    // >1 = slower visual growth at start
const SHOT_CURVE = 1.3;       // >1 = less power at small holds, same max at full hold

function Stick(position , onShoot) {
    this.position = position; // Initialize the stick's position
    this.rotation = 0; // Initialize the stick's rotation
    this.size = { width: 800, height: 1000 }; // Set dimensions for the stick
    this.origin = STICK_ORIGIN; // Directly assign STICK_ORIGIN
    this.power = 0;
    this.onShoot = onShoot; // Callback function when the stick is shot
    this.shot = false; // Track if the stick has been shot
}

Stick.prototype.update = function(ballPosition) { // Update the stick
    // Always follow the cue ball
    this.position = ballPosition.copy();

    // Update angle based on mouse position
    const mouse = Mouse.position;
    this.angle = Math.atan2(mouse.y - this.position.y, mouse.x - this.position.x);

    if (Mouse.left.down) {
        this.increasePower();
    } else if (this.power > 0) {
        this.shoot();
    }
};

Stick.prototype.draw = function(ballPosition) {
    this.update(ballPosition);
    const ctx = Canvas.canvasContext;
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    // Visual pullback eased (slower-looking without changing real charge rate)
    const t = Math.min(this.power / MAX_POWER, 1);
    const pullback = PULLBACK_MAX * Math.pow(t, PULLBACK_EASE);

    if (Sprites.stick && Sprites.stick.complete) {
        const stickWidth = Sprites.stick.width * 0.6;
        const stickHeight = Sprites.stick.height * 0.8;

        ctx.drawImage(
            Sprites.stick,
            -stickWidth - 30 - pullback,
            -stickHeight / 2,
            stickWidth,
            stickHeight
        );
    } else {
        ctx.fillStyle = "#deb887";
        ctx.fillRect(-75 - pullback, -20, 150, 40);
    }

    ctx.restore();
};

Stick.prototype.updateRotation = function(ballPosition) { // Update the rotation of the stick
    if (!ballPosition) {
        console.error("ballPosition is undefined");
        return;
    }

    let opposite = Mouse.position.y - ballPosition.y; // Calculate the opposite side
    let adjacent = Mouse.position.x - ballPosition.x; // Calculate the adjacent side
    this.rotation = Math.atan2(opposite, adjacent); // Calculate the angle in radians
};

Stick.prototype.increasePower = function() {
    // Same charge rate; slower “feel” comes from the easing above
    this.power = Math.min(this.power + CHARGE_RATE, MAX_POWER);
}

Stick.prototype.shoot = function() {
    // Curve the actual shot power: small holds => weaker, full hold => same max
    const t = Math.min(this.power / MAX_POWER, 1);
    const curvedPower = MAX_POWER * Math.pow(t, SHOT_CURVE);
    this.onShoot(curvedPower, this.angle);
    this.power = 0;
    this.shot = true;
}