
// Setting up an socket.io connection
const socket = io();
socket.on("connect", () => {
    console.log(socket);
});

let meta_info;


let c;

// Setup root for getting the whole canvas from the data base
socket.on("send_canvas", data => {
    if (data.length > 1) {
        fill(255);
        strokeWeight(0);
        rect(0, 0, meta_info.width, meta_info.height);
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

// Get the meta information about the canvas before the canvas gets made. This route is made with express and not with websockets.
function preload() {
    meta_info = loadJSON("/meta_info");
}

function setup() {
    const windowRatio = innerHeight / innerWidth;
    const canvasRatio = meta_info.height / meta_info.width;
    let scaling;
    console.log("windowR: " + windowRatio);
    console.log("windowR: " + canvasRatio);

    if (canvasRatio > windowRatio) {
        scaling = innerHeight / meta_info.height;
    } else if (canvasRatio < windowRatio) {
        scaling = innerWidth / meta_info.width;
    }
    console.log("scaling: " + innerWidth);
    c = createCanvas(meta_info.height, meta_info.width);

    console.log(c);
    c.drawingContext.scale(scaling, scaling);
    c.canvas.style.marginLeft = `${innerWidth / 2 - (meta_info.width / 2) * scaling}`;
    c.canvas.style.marginTop = `${innerHeight / 2 - (meta_info.height / 2) * scaling}`;
    window.addEventListener('resize', (event) => {
        c.canvas.style.marginLeft = `${innerWidth / 2 - (meta_info.width / 2) * scaling}`;
        c.canvas.style.marginTop = `${innerHeight / 2 - (meta_info.height / 2) * scaling}`;
    });


}



