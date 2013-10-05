CanvasRenderingContext2D.prototype.ellipse = function(x, y, r, stroke) {
  var startingAngle = 0;
  var endingAngle = 2 * Math.PI; 

  this.beginPath();
  this.arc(x, y, r, startingAngle, endingAngle, false);
  this.closePath();
  if(!stroke) {
    this.fill();
  } else {
    this.stroke();
  }
}