var Ball = function(x, y, i, j, r, cue) {
    this.pos = {
        x: x || 0,
        y: y || 0
    };
    this.vel = {
        i: i || 0,
        j: j || 0
    }
    this.radius = r || 10;
    this.stuck = false;
    this.alive = true;
    this.lifetime = config.lifetime;
    this.value = 100;

    if(cue) {
        this.hue = 0;    
    } else {
        this.hue = Math.floor(Math.random() * 360);
    }
};

Ball.prototype.setPos = function(x, y) {
    this.x = x;
    this.y = y;
};

Ball.prototype.changePos = function(x, y) {
    this.x += x;
    this.y += y;
};

Ball.prototype.incrRad = function(amount) {
    this.radius += amount;
};

Ball.prototype.dist = function(that) {
    return Math.sqrt(Math.pow((that.pos.y - this.pos.y), 2) + 
        Math.pow((that.pos.x - this.pos.x), 2));
};

Ball.prototype.stick = function() {
    this.vel.i = 0;
    this.vel.j = 0;
    this.stuck = true;
};

Ball.prototype.die = function() {
    this.alive = false;
};