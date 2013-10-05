(function() {

    var canvas, ctx, mouse, gameInterval;
    var balls = [];
    var width = 800;
    var height = 600;
    var score = 0;
    var levelIndex = 0;
    var placed = false;
    var burst = 0;
    var mod = modifiers.medium;
    var fx = false;

    /**
     * Starts the game.
     * Should only be called after the 
     * document is ready.
     */
    var init = function() {
        console.log("INIT");
        canvas = document.getElementById("game");
        ctx = canvas.getContext("2d");
        mouse = new Mouse(canvas);
        mouse.click(placeBall);

        // apply modifier to all 
        for(prop in config) {
            config[prop] *= mod;
        }

        populate(30);
        gameInterval = setInterval(play, config.tickRate);
    };

    /**
     * Updates all entities in the scene
     */
    var update = function() {
        for(idx in balls) {
            if(!updateBall(balls[idx])) {
                balls.splice(idx, 1);
                if(isOver()) {
                    endRound();
                }
            }  
        }
    };

    /**
     * End of the round
     * To be called when no there 
     * are no stuck balls left
     */
    var endRound = function() {
        balls.length = 0;
        if(burst >= levels[levelIndex].required) {
            levelIndex++;

            if(levelIndex >= levels.length) {
                win();
            } else {
                populate();
            }

        } else {
            lose();
        }
    };

    /**
     * Win state
     */
    var win = function() {
        console.log("win");
        clearInterval(gameInterval);
    };

    /**
     * Lose state
     */
    var lose = function() {
        console.log("lose");
        // populate without
        // increasing levelIndex
        populate();
    };

    /**
     * Is the round finished?
     */
    var isOver = function() {
        return balls.reduce(function(pr, cu) {
            return pr && !cu.stuck;
        });  
    };

    /**
     * Update a ball
     * Takes a ball object
     */
    var updateBall = function(ball) {
        // edge collisions
        if(ball.pos.x + ball.radius > width) {
            ball.vel.i *= -1;
        }
        if(ball.pos.x - ball.radius < 0) {
            ball.vel.i *= -1;
        }
        if(ball.pos.y + ball.radius > height) {
            ball.vel.j *= -1;
        }
        if(ball.pos.y - ball.radius < 0) {
            ball.vel.j *= -1;
        }


        if(ball.stuck) {
            ball.lifetime--;

            if(ball.lifetime <= 0) {
                ball.die();
            }

            if(ball.alive) {
                // make it bigger if we need
                if(ball.radius < config.expandedRadius) {
                    ball.radius += config.growthRate;
                }
            } else {
                if(ball.radius > 0) {
                    ball.radius -= config.shrinkRate;
                } else {
                    // ball is no longer here
                    return false;
                }
            }

            // check for collisions
            for(idx in balls) {
                var other = balls[idx];
                if(other != ball && !other.stuck) {
                    if(ball.dist(other) < ball.radius + other.radius) {
                        burst++;
                        other.stick();
                        other.value = ball.value * 2;
                        score += other.value;
                    }
                }
            }
        }

        ball.pos.x += ball.vel.i * 10;
        ball.pos.y += ball.vel.j * 10;

        // ball lives on
        return true;
    };

    /**
     * Place the cue ball
     * at the mouse position.
     */
    var placeBall = function(x, y) {
        // only allow the user to
        // place one ball
        if(!placed) {
            placed = true;    
            var cueBall = new Ball(
                x, y,
                0, 0,
                config.ballRadius,
                true // cueball boolean
            );
            cueBall.stick();
            score += cueBall.value;

            balls.push(cueBall);
        }
    };

    /**
     * Populate the game with 
     * information for the current
     * level
     */
    var populate = function(amount) {
        var level = levels[levelIndex];
        // reset
        burst = 0;
        score = 0;
        placed = false;
        createBalls(level.total);
    };

    /**
     * Create 'number' of balls
     */
    var createBalls = function(number) {
        for(var i = 0; i < number; i++) {
            createBall();
        }    
    };

    /**
     * Create a random ball
     */
    var createBall = function() {
        // ball settings
        var x, y, i, j, r;
        x = config.ballRadius + Math.random() * (width - config.ballRadius * 2);
        y = config.ballRadius + Math.random() * (height - config.ballRadius * 2);
        i = Math.random() - 0.5,
        j = Math.random() - 0.5
        r = config.ballRadius;
        balls.push(new Ball(
            x, y, // coords
            i, j, // velocity
            r     // radius
        ));
    };

    /**
     * Wrapper for update and render
     */
    var play = function() {
        update();
        render();
    };

    /**
     * Render everything in the scene
     */
    var render = function() {
        ctx.save();

        if(fx) {
            ctx.fillStyle = "rgba(20,20,20,0.3)";
        } else {
            ctx.fillStyle = "#222;"
        }
        ctx.fillRect(0, 0, width, height);
        
        // render mouse marker
        ctx.save();
        ctx.translate(mouse.x, mouse.y);
        ctx.fillStyle = "#fff"
        ctx.ellipse(0, 0, 4);
        ctx.restore();

        for(idx in balls) {
            ctx.save();
            var ball = balls[idx];
            ctx.translate(ball.pos.x, ball.pos.y);
            
            if(fx) {
                ctx.strokeStyle = "hsla("+ ball.hue +", 80%, 80%, 0.1)";
                ctx.ellipse(0, 0, ball.radius + 5, true);
            }

            ctx.fillStyle = "hsla("+ ball.hue +", 50%, 50%, 0.5)";
            ctx.ellipse(0, 0, ball.radius);

            // write value if ball is not dead
            if(ball.stuck && ball.lifetime > 0) {
                ctx.fillStyle = "#fff"; 
                var text = ("+" + ball.value);
                label("+" + ball.value, 0, 0, 12, true);
            }

            ctx.restore();
        }

        ctx.fillStyle = "#fff";
        ctx.fillText(score, 10, 20);

        var progress = burst +"/"+ levels[levelIndex].required + " balls";
        ctx.fillText(progress, width / 2 - progress.length * 7, 20);


        var roundText = "Round " + (levelIndex + 1);
        ctx.fillText(roundText, width / 2 - roundText.length * 7, height - 20);

        ctx.fillStyle = "#222";

        ctx.restore();
    };

    /**
     * Helper method for writing text
     */
    var label = function(text, x, y, fontSize, centered) {
        ctx.font = fontSize + "px Arial";
        if(centered && typeof centered !== "undefined") {
            x -= (text.length * (fontSize / 2)) / 2;
            y += fontSize / 2;
        }
        ctx.fillText(text, x, y);
    };

    window.addEventListener("load", init);

})();