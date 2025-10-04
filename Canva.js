function Canvas2D(){

    this.canvas = document.getElementById('screen'); // canvas element
    this.canvasContext = this.canvas.getContext('2d'); // 2D context

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas()); // resize the canvas when the window is resized

}
Canvas2D.prototype.resizeCanvas = function(){ // resize the canvas
    this.canvas.width = window.innerWidth; // set the width of the canvas to the width of the window
    this.canvas.height = window.innerHeight; // set the height of the canvas to the height of the window
}

Canvas2D.prototype.clear = function(){  // clear the canvas
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

Canvas2D.prototype.drawImage = function(image, position, origin, rotation = 0){   

    if(!position) {
        position = new Vector2(); 

    }

    if(!origin) {
        origin = new Vector2(); 
    }
    this.canvasContext.save(); // save the current cont ext
    this.canvasContext.translate(position.x, position.y ); // translate the context to the position of the image
    this.canvasContext.rotate(rotation);
    this.canvasContext.drawImage(image, -origin.x, -origin.y);   
    this.canvasContext.restore(); // restore the context to the previous state 
} 

let Canvas = new Canvas2D(); 
 