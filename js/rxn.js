(function() {

    var canvas, ctx, mouse;
    var balls = [];
    var width = 800;
    var height = 600;

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

        populate(30);
        setInterval(play, config.tickRate);
    };

    /**
     * Updates all entities in the scene
     */
    var update = function() {
        for(idx in balls) {
            if(!updateBall(balls[idx])) {
                balls.splice(idx, 1);
            }  
        }
    };

    var updateBall = function(ball, idx) {

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
                        other.stick();
                        other.value = ball.value * 2;
                    }
                }
            }
        }

        ball.pos.x += ball.vel.i * 10;
        ball.pos.y += ball.vel.j * 10;

        // ball lives on
        return true;
    };

    var placeBall = function(x, y) {
        
        var cueBall = new Ball(
            x, y,
            0, 0,
            config.ballRadius,
            true // cueball
        );
        cueBall.stick();

        balls.push(cueBall);

    };

    //***********// 
    //__BECAUSE__//
    ///\/\/\/\/\///

    // ##*~*~*~*~*~*~*~*~*~*~##
    //  | THAT WAS DOM BASED |
    //  | THIS IS CANVAS     |
    // ##*~*~*~*~*~*~*~*~*~*~##

    //  o <- dom
    // -|-[] <- canvas
    // /\  /  <- dom has unhappy legs
    // <==/ 
    // | |
    // he'll never have a career as a leg model
    // poor dom

    // HOORAY! FUN! YEAH! BISCUITS!
    // ***** WEB DEVING ****** //
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~

    var populate = function(amount) {
        console.log("POPULATE");

        // ball settings
        var x, y, i, j, r;

        for(var _ = 0; _ < amount; _++) {
            x = Math.random() * width;
            y = Math.random() * height;
            i = Math.random() - 0.5,
            j = Math.random() - 0.5
            r = config.ballRadius;
            balls.push(new Ball(
                x, y, // coords
                i, j, // velocity
                r     // radius
            ));
        }
    };

    var play = function() {
        update();
        render();
    };

    var render = function() {
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#222";

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
            ctx.fillStyle = "hsla("+ ball.hue +", 50%, 50%, 0.5)";
            ctx.ellipse(0, 0, ball.radius);

            if(ball.stuck && ball.lifetime > 0) {
                ctx.fillStyle = "#fff";
                ctx.font="12px Arial";
                var textLength = ball.value.toString().length * 7;
                ctx.fillText(ball.value, -(textLength / 2), 6);
            }

            ctx.restore();
        }
    };

    window.addEventListener("load", init);

})();