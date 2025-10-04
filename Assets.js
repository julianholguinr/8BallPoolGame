const Sprites = {}; // Global object to store all sprites

function loadAssets(callback) {
    let assetsLoaded = 0;
    const totalAssets = 6; // stick, background, white, yellow, red, black

    function checkAllLoaded() {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) callback();
    }

    // Load stick image
    Sprites.stick = new Image();
    Sprites.stick.src = "./Assets/Sprites/spr_stick.png"; // Ensure the path is correct
    Sprites.stick.onload = checkAllLoaded;
    Sprites.stick.onerror = () => {
        console.error("Failed to load stick image.");
    };

    // Load background image
    Sprites.background = new Image();
    Sprites.background.src = "./Assets/Sprites/spr_background.png";
    Sprites.background.onload = checkAllLoaded;
    Sprites.background.onerror = () => {
        console.error("Failed to load background image.");
    };

    // Load white ball image
    Sprites.whiteBall = new Image();
    Sprites.whiteBall.src = "./Assets/Sprites/spr_whiteBall.png";
    Sprites.whiteBall.onload = checkAllLoaded;
    Sprites.whiteBall.onerror = () => {
        console.error("Failed to load white ball image.");
    };

    // Load yellow ball image
    Sprites.yellowBall = new Image();
    Sprites.yellowBall.src = "./Assets/Sprites/spr_yellowBall.png";
    Sprites.yellowBall.onload = checkAllLoaded;
    Sprites.yellowBall.onerror = () => {
        console.error("Failed to load yellow ball image.");
    };

    // Load red ball image
    Sprites.redBall = new Image();
    Sprites.redBall.src = "./Assets/Sprites/spr_redBall.png";
    Sprites.redBall.onload = checkAllLoaded;
    Sprites.redBall.onerror = () => {
        console.error("Failed to load red ball image.");
    };

    // Load black ball image
    Sprites.blackBall = new Image();
    Sprites.blackBall.src = "./Assets/Sprites/spr_blackBall.png";
    Sprites.blackBall.onload = checkAllLoaded;
    Sprites.blackBall.onerror = () => {
        console.error("Failed to load black ball image.");
    };
}

function getBallSpriteByColor(color) {
    switch (color) {
        case COLOR.YELLOW: return Sprites.yellowBall;
        case COLOR.RED:    return Sprites.redBall;
        case COLOR.BLACK:  return Sprites.blackBall;
        case COLOR.WHITE:
        default:           return Sprites.whiteBall;
    }
}

// Assets are loaded on-demand by the Auth flow (see Auth.js)
// Example usage from Auth.js:
// loadAssets(() => {
//   Game.init(options);
//   Game.start(options);
// });