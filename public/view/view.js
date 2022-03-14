

let canvas_height;
let canvas_width;

// Setting up an socket.io connection
const socket = io();
socket.on("connect", () => {
    console.log(socket);
});

socket.on("meta_info", (data) => {
    canvas_height = data.canvas_height;
    canvas_width = data.canvas_width;
});

let c;

// Setup root for getting the whole canvas from the data base
socket.on("send_canvas", data => {
    if (data.length > 1) {
        fill(255);
        strokeWeight(0);
        rect(0, 0, canvas_width, canvas_height);
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
    const canvasRatio = canvas_height / canvas_width;
    let scaling;
    console.log("windowR: " + windowRatio);
    console.log("windowR: " + canvasRatio);

    if (canvasRatio > windowRatio) {
        scaling = innerHeight / canvas_height;
    } else if (canvasRatio < windowRatio) {
        scaling = innerWidth / canvas_width;
    }
    console.log("scaling: " + innerWidth);
    c = createCanvas(canvas_height, canvas_width);

    console.log(c);
    c.drawingContext.scale(scaling, scaling);
    c.canvas.style.marginLeft = `${innerWidth / 2 - (canvas_width / 2) * scaling}`;
    c.canvas.style.marginTop = `${innerHeight / 2 - (canvas_height / 2) * scaling}`;
    window.addEventListener('resize', (event) => {
        c.canvas.style.marginLeft = `${innerWidth / 2 - (canvas_width / 2) * scaling}`;
        c.canvas.style.marginTop = `${innerHeight / 2 - (canvas_height / 2) * scaling}`;
    });
}



