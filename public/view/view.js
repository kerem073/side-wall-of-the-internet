

// Setting up an socket.io connection
const socket = io();
socket.on("connect", () => {

    console.log(socket);
});

let c;

// Setup root for getting the whole canvas from the data base
socket.on("send_canvas", data => {
    if (data.length > 1) {
        fill(255);
        rect(0, 0, 932, 2000);
        for (let i = 0; i < data.length; i++) {
            stroke(data[i].line_color);
            strokeWeight(data[i].line_thickness);
            line(data[i].x, data[i].y, data[i].px, data[i].py);
        }
    }
});

// Setup root for getting the lines of the other users
socket.on("other_user", data => {
    stroke(data.line_color);
    strokeWeight(data.line_thickness);
    line(data.x, data.y, data.px, data.py);
});

function preload() {

}

function setup() {

    const windowRatio = innerHeight / innerWidth;
    const canvasRatio = 2000 / 932;
    let scaling;
    console.log("windowR: " + windowRatio);
    console.log("windowR: " + canvasRatio);


    if (canvasRatio > windowRatio) {
        scaling = innerHeight / 2000;
    } else if (canvasRatio < windowRatio) {
        scaling = innerWidth / 932;
    }
    console.log("scaling: " + innerWidth);
    c = createCanvas(2000, 932);

    console.log(c);
    c.drawingContext.scale(scaling, scaling);
    c.canvas.style.marginLeft = `${innerWidth / 2 - (932 / 2) * scaling}`;
    c.canvas.style.marginTop = `${innerHeight / 2 - (2000 / 2) * scaling}`;
    window.addEventListener('resize', (event) => {
        c.canvas.style.marginLeft = `${innerWidth / 2 - (932 / 2) * scaling}`;
        c.canvas.style.marginTop = `${innerHeight / 2 - (2000 / 2) * scaling}`;
    });

}



