const express = require("express");
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const UserManager = require('./manager/UserManager')
const PORT = process.env.PORT || 8080;
const userManager = new UserManager.UserManager();

app.use(express.static('view'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/view/home/index.html');
});

app.get('/room', (req, res) => {
    res.sendFile(__dirname + '/view/room/index.html');
});

io.sockets.on('connection', async function (socket) {

    socket.on('disconnect', function () {
        userManager.removeUser(socket.id);
        let room = userManager.getSocketRoom(socket.id)
        if(room != null) {
            let roomSockets = userManager.getRoomSockets(room)
            roomSockets.forEach(x=>io.to(x).emit("deletePeering", socket.id));
        }
    });

    socket.on("room", function (room) {
        userManager.addUser(room, socket.id);
        const socketList = userManager.getRoomSockets(room).filter(x=>x !== socket.id);
        socket.emit("startPeering", socketList);
    })

    socket.on("sdp", function (to, sdp) {
        io.to(to).emit("sdp", socket.id , sdp);
    })

    socket.on('ice', function (to, ice) {
        io.to(to).emit("ice", socket.id, ice);
    });

});

server.listen(PORT);
console.log(`Server started on port: ${PORT}`)