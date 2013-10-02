var Mouse = function(el) {
    var self = this;
    this.x = 0;
    this.y = 0;

    this.click = function(fn) {
        el.addEventListener("click", function() {
            fn(self.x, self.y);
        });
    };

    el.addEventListener("mousemove", function(e) {
        self.x = e.offsetX;
        self.y = e.offsetY;
    });

};