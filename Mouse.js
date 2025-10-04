function handleMouseMove(evt) {

    let x = evt.pageX; 
    let y = evt.pageY;

    Mouse.position = new Vector2(x, y)      // position of the mouse

}

function handleMouseDown(evt){              // mouse down event

    handleMouseMove(evt);                   // update mouse position

    if (evt.which === 1){
        if (!Mouse.left.down)               // left button
            Mouse.left.pressed = true;      // set the left button to pressed
            Mouse.left.down = true;         // set the left button to down
    } else if (evt.which === 2) {           // middle button
        if (!Mouse.middle.down)            
            Mouse.middle.press = true;    // set the middle button to pressed
            Mouse.middle.down = true;       // set the middle button to down
    }
    else if (evt.which === 3) {             // right button
        if (!Mouse.right.down)             
            Mouse.right.pressed = true;     // set the right button to pressed
            Mouse.right.down = true;        // set the right button to down
    }

}

function handleMouseUp(evt){                // mouse up event

    handleMouseMove(evt);                   // update mouse position

  if (evt.which === 1)                      // left button
        Mouse.left.down = false;  
  else if  (evt.which === 2)                // middle button
        Mouse.middle.down = false; 
    else if (evt.which === 3)               // right button
        Mouse.right.down = false;       
    
}


function MouseHandler(){

    this.left = new ButtonState();
    this.middle = new ButtonState();
    this.right = new ButtonState();

    this.position = new Vector2(); // position of the mouse

    document.onmousemove = handleMouseMove;
    document.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
}

MouseHandler.prototype.reset = function(){ // update the mouse
    this.left.pressed = false;
    this.middle.pressed = false;
    this.right.pressed = false;
}
    
let Mouse = new MouseHandler();

Mouse.position = { x: 0, y: 0 };
document.addEventListener('mousemove', function(e) {
    const rect = Canvas.canvas.getBoundingClientRect();
    Mouse.position.x = e.clientX - rect.left;
    Mouse.position.y = e.clientY - rect.top;
});
