/**
 * Created by asem63 on 22/01/15.
 */
var db = require("./database");

module.exports = function(io){

    io.on('connection', function(socket){

        console.log("URL:"+socket.request.user.userName);

        socket.on('disconnect', function(msg){
            io.sockets.in(msg.room).emit('chat_message', socket.request.user.userName+":"+msg.mes);
        });

        socket.on('chat_message', function(msg){
            io.sockets.in(msg.room).emit('chat_message', msg.mes);
        });


        socket.on('connected_to_room', function(msg){
            console.log("connected To ROOM:" + msg);
            var roomName = msg;
            io.sockets.in(roomName).emit('chat_message', msg.mes);
            db.addUserToRoom(socket.request.user, roomName, function (err) {
                if (err){
                    socket.emit("chat_error", "database error");
                }
                socket.emit(roomName+"_adduser", socket.request.user.userName);
            });

            db.getAllUserNamesInRoom(roomName, function (err, result) {
                if (err){
                    socket.emit("chat_error", "database error");
                }
                socket.emit(socket.request.user.userName +"_"+ roomName+"_userlist", result);
            });

            socket.join(roomName);
        });
    });
};

