
let canvas;

let scrollY;
let scrollX;

let curtouchX;
let curtouchY;

let isTouching;
let isClicking;

let ptouchX;
let ptouchY;

let line_thickness = 2;
let line_color = 0;

let colors = document.getElementsByClassName('color');

let onCanvas = false;

let meta_info;

const main = document.getElementById("main");
const UI = document.getElementById('UI');

// Setting up an socket.io connection
const socket = io();
socket.on("connect", () => {
    console.log(socket);
});

// Setup root for getting the whole canvas from the data base
socket.on("send_canvas", data => {
    if (data.length > 1) {
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


/*

The app uses two fingers to scroll and one finger to draw but because of the nature of mobile websites, you scroll with one finger.
To prevent unsolicited behavior, most of the touch functionality is disabled. 'touchstart', 'touchmove' and 'touchend' are all 
defaulting to event.preventDefault() so that I can implement my own interaction.

*/

document.addEventListener('touchstart', (event) => {
    if (event.target.isEqualNode(canvas.canvas)) {
        onCanvas = true;
        isTouching = true;
        isClicking = false;
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


// Mouse Events
document.addEventListener('mousedown', (event) => {
    if (event.target.isEqualNode(canvas.canvas)) {
        onCanvas = true;
        isTouching = false;
        isClicking = true;
    } else {
        onCanvas = false;
    }
});

document.addEventListener('mouseup', (event) => {
    isClicking = false;
});

document.getElementById("stroke_weight").addEventListener('input', (event) => {
    strokeWeight(event.target.value);
    line_thickness = event.target.value;
});


// Get the meta information about the canvas before the canvas gets made. This route is made with express and not with websockets.
function preload() {
    socket.on("meta_info", (data) => {
        meta_info = data;
    });
    meta_info = loadJSON("/meta_info");
}

function setup() {

    console.log(meta_info.width);
    canvas = createCanvas(meta_info.width, meta_info.height);
    canvas.parent(main);

    for (let i = 0; i < colors.length; i++) {
        colors[i].style.backgroundColor = colors[i].dataset.color;
        colors[i].addEventListener('click', () => {
            line_color = colors[i].dataset.color;
        });
        colors[i].addEventListener('touchstart', () => {
            line_color = colors[i].dataset.color;
        });
    }
    strokeWeight(line_thickness);
    stroke(line_color);
}

function draw() {

    if (isTouching) {
        // Cheching for a previous touch so that the line can be drawn to the next touch location
        if (touches.length > 0 && (!ptouchX || !ptouchY)) {
            ptouchX = touches[0].x;
            ptouchY = touches[0].y;
            return;
        }

        // Drawing the lines and sending it to the server
        if (touches.length === 1 && ptouchX && ptouchY && onCanvas && touches[0].x < meta_info.width && touches[0].x > -1 && touches[0].y < meta_info.height && touches[0].y > -1) {
            stroke(line_color);
            strokeWeight(line_thickness);
            line(touches[0].x, touches[0].y, ptouchX, ptouchY);
            curtouchX = touches[0].x;
            curtouchY = touches[0].y;
            sendTouchesToServer();
        }

        // Scrolling on two fingers throught the main element
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
    } else if (isClicking && mouseX > -1 && mouseX < meta_info.width && mouseY > -1 && mouseY < meta_info.height) {
        if (onCanvas) {
            stroke(line_color);
            strokeWeight(line_thickness);
            line(mouseX, mouseY, pmouseX, pmouseY);
            sendMouseToServer();
        }
    }
}


function sendTouchesToServer() {
    const data = {
        x: curtouchX,
        y: curtouchY,
        px: ptouchX,
        py: ptouchY,
        line_color: line_color,
        line_thickness: line_thickness,
        date: Date.now()
    };

    socket.emit("lines", data);

}

function sendMouseToServer() {
    const data = {
        x: mouseX,
        y: mouseY,
        px: pmouseX,
        py: pmouseY,
        line_color: line_color,
        line_thickness: line_thickness,
        date: Date.now()
    };

    socket.emit("lines", data);

}



// Checking if we are using the mobile version. Thanks to https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser | Michael Zaporozhets
window.mobileAndTabletCheck = function () {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};