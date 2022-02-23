// const { response } = require("express");

const socket = io();

socket.on("connect", () => {

    console.log(socket);
});

socket.on("send_canvas", data => {

    if (data.length > 1) {
        for (let i = 0; i < data.length; i++) {
            stroke(data[i].line_color);
            strokeWeight(data[i].line_thickness);
            line(data[i].x, data[i].y, data[i].px, data[i].py);
        }
    }
});


const main = document.getElementById("main");
const UI = document.getElementById('UI');

let canvas;

let scrollY;
let scrollX;

let curtouchX;
let curtouchY;

let ptouchX;
let ptouchY;

let line_thickness = 2;
let line_color = 0;

let colors = document.getElementsByClassName('color');

let onCanvas = false;

document.addEventListener('touchstart', (event) => {
    if (event.target.isEqualNode(canvas.canvas)) {
        onCanvas = true;
        event.preventDefault();
    } else {
        onCanvas = false;
    }
}, { passive: false });

document.addEventListener('touchmove', (event) => {
    if (onCanvas || event.scale !== 1) {
        event.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', (event) => {
    event.preventDefault();
    ptouchY = 0;
    ptouchX = 0;
});

document.getElementById("stroke_weight").addEventListener('input', (event) => {
    strokeWeight(event.target.value);
    line_thickness = event.target.value;
});

// preload function for fetching from the database!


function setup() {
    canvas = createCanvas(932, 2000);
    // canvas = createCanvas(2000, 2000);
    canvas.parent(main);
    for (let i = 0; i < colors.length; i++) {
        colors[i].style.backgroundColor = colors[i].dataset.color;
        colors[i].addEventListener('click', () => {
            stroke(colors[i].dataset.color);
            line_color = colors[i].dataset.color;
        });
        colors[i].addEventListener('touchstart', () => {
            stroke(colors[i].dataset.color);
            line_color = colors[i].dataset.color
        });
    }
    strokeWeight(line_thickness);
    stroke(line_color);
}

function draw() {

    if (touches.length > 0 && (!ptouchX || !ptouchY)) {
        ptouchX = touches[0].x;
        ptouchY = touches[0].y;
        return;
    }

    if (touches.length === 1 && ptouchX && ptouchY && onCanvas) {
        line(touches[0].x, touches[0].y, ptouchX, ptouchY);
        curtouchX = touches[0].x;
        curtouchY = touches[0].y;
        sendToServer();
    }

    if (touches.length === 2) {
        scrollX = ptouchX - touches[0].x;
        scrollY = ptouchY - touches[0].y;

        main.scrollBy(scrollX, scrollY);
        return;
    }
    if (touches.length > 0) {
        ptouchX = touches[0].x;
        ptouchY = touches[0].y;
        return;
    }

}


function sendToServer() {
    const data = {
        x: curtouchX,
        y: curtouchY,
        px: ptouchX,
        py: ptouchY,
        line_color: line_color,
        line_thickness: line_thickness,
        date: Date.now()
    };
    console.log(Date.now());

    socket.emit("lines", data);

}