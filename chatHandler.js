/**
 * Created by asem63 on 22/01/15.
 */
var db = require("./database");

module.exports = function(io){

    io.on('connection', function(socket){

        console.log("URL:"+socket.request.user.userName);

        socket.on('room_disconnect', function(msg){
            console.log("<"+socket.request.user.userName+">: discon from room: " + msg);
            io.sockets.in(msg).emit('user_disconnected', socket.request.user);
        });

        socket.on('chat_message', function(msg){
            var message = "<"+socket.request.user.userName+">: "+msg.mes;

            io.sockets.in(msg.room).emit('chat_message', message);
            db.saveMessage(msg.mes, msg.room);
        });

        socket.on('connected_to_room', function(msg){
            console.log("connected To ROOM:" + msg);
            var roomName = msg;
            io.sockets.in(roomName).emit('chat_message', "<"+socket.request.user.userName+">: connected to room");
            db.addUserToRoom(socket.request.user, roomName, function (err) {
                io.sockets.in(roomName).emit("adduser", {name: socket.request.user.userName, id:socket.request.user.id});
            });

            db.getAllUserNamesInRoom(roomName, function (err, result) {
                io.to(socket.id).emit("userlist", result);
            });

            socket.join(roomName);
        });
    });
};

