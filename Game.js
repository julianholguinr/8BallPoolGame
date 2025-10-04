const Game = {
    init: function(options) {
        if (window.Sound && !Sound._inited) {
            Sound.init();
            Sound._inited = true;
            document.addEventListener('pointerdown', () => Sound.unlock(), { once: true });
        }
        this.gameWorld = new GameWorld(options || {});
    },
    start: function(options) {
        PoolGame.lastOptions = options || {};
        PoolGame.init(PoolGame.lastOptions);
        PoolGame.mainLoop();
    },
    mainLoop: function() {
        Canvas.clear();
        PoolGame.gameWorld.update();
        PoolGame.gameWorld.draw(); 

        // Handle clicks for menu, pause, and game over
        if (Mouse.left.pressed) {
            const m = Mouse.position;

            // Menu button
            if (!PoolGame.gameWorld.gameOver && !PoolGame.gameWorld.paused) {
                const menuBtn = PoolGame.gameWorld.menuButtonBounds;
                if (menuBtn && m.x >= menuBtn.x && m.x <= menuBtn.x + menuBtn.w && m.y >= menuBtn.y && m.y <= menuBtn.y + menuBtn.h) {
                    if (typeof Sound !== 'undefined') Sound.play('click', 0.6);
                    Mouse.left.down = false;
                    Mouse.left.pressed = false;
                    PoolGame.gameWorld.paused = true;
                    return requestAnimationFrame(PoolGame.mainLoop);
                }
            }

            // Pause menu buttons
            if (PoolGame.gameWorld.paused) {
                const resumeBtn = PoolGame.gameWorld.resumeButtonBounds;
                if (resumeBtn && m.x >= resumeBtn.x && m.x <= resumeBtn.x + resumeBtn.w && m.y >= resumeBtn.y && m.y <= resumeBtn.y + resumeBtn.h) {
                    if (typeof Sound !== 'undefined') Sound.play('click', 0.6);
                    Mouse.left.down = false;
                    Mouse.left.pressed = false;
                    PoolGame.gameWorld.paused = false;
                    return requestAnimationFrame(PoolGame.mainLoop);
                }
                const resetBtn = PoolGame.gameWorld.resetButtonBounds;
                if (resetBtn && m.x >= resetBtn.x && m.x <= resetBtn.x + resetBtn.w && m.y >= resetBtn.y && m.y <= resetBtn.y + resetBtn.h) {
                    if (typeof Sound !== 'undefined') Sound.play('click', 0.6);
                    Mouse.left.down = false;
                    Mouse.left.pressed = false;
                    PoolGame.gameWorld.reset();
                    return requestAnimationFrame(PoolGame.mainLoop);
                }
            }

            // Game over buttons
            if (PoolGame.gameWorld.gameOver) {
                const btn = PoolGame.gameWorld.replayButtonBounds;
                if (btn && m.x >= btn.x && m.x <= btn.x + btn.w && m.y >= btn.y && m.y <= btn.y + btn.h) {
                    if (typeof Sound !== 'undefined') Sound.play('click', 0.6);
                    // Prevent carry-over click from charging/shooting the stick
                    Mouse.left.down = false;
                    Mouse.left.pressed = false;
                    // Restart the game (preserve player names)
                    PoolGame.gameWorld = new GameWorld(PoolGame.lastOptions || {});
                    return requestAnimationFrame(PoolGame.mainLoop);
                }
                const btn2 = PoolGame.gameWorld.returnButtonBounds;
                if (btn2 && m.x >= btn2.x && m.x <= btn2.x + btn2.w && m.y >= btn2.y && m.y <= btn2.y + btn2.h) {
                    if (typeof Sound !== 'undefined') Sound.play('click', 0.6);
                    // Prevent carry-over click
                    Mouse.left.down = false;
                    Mouse.left.pressed = false;
                    // Return to menu
                    Auth.show();
                    return;
                }
            }
        }

        Mouse.reset();                          // reset the mouse state 

        requestAnimationFrame(PoolGame.mainLoop);
    }
};

let PoolGame = Object.create(Game);

// Game start is now controlled by the Auth flow (see Auth.js).
// Assets are still loaded from index.html, but we delay starting until the user logs in and sets player names.
