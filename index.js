//Express initialization
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Database
const Datastore = require('nedb');
const database = new Datastore('database.db');
database.loadDatabase();

// Sockets.io initialization
const { Server } = require("socket.io");
const io = new Server({});

// Starting Express server and feed it to socket.io
const server = app.listen(port);
io.listen(server);

// Serve static files in the public folder
app.use(express.static("public"));

console.log(`server listing on port ${port}`);

io.on("connection", (socket) => {
    console.log(socket);

    socket.emit("meta_info", {
        canvas_width: 932,
        canvas_height: 2000
    });

    database.find({}, (err, data) => {
        socket.emit("send_canvas", data);
    });

    database.find({}).sort({ date: 1 }).exec((err, data) => {
        socket.emit("send_canvas", data);
    });

    database.find({}).sort({ date: 1 }).exec((err, data) => {
        socket.emit("send_canvas", data);
    });

    socket.on("lines", (data) => {
        console.log(data);
        database.insert(data);
        socket.broadcast.emit("other_user", data);
    });


});