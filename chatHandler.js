/**
 * Created by asem63 on 22/01/15.
 */
var db = require("./database");
var bcrypt = require("bcrypt");

module.exports = function(io){

    io.on('connection', function(socket){

        /* handle user disconnection from room*/
        socket.on('room_disconnect', function(msg){
            db.userInRoom(socket.request.user, msg, function (err, userInRoom) {
                if(userInRoom){
                    db.removeUserFromRoom(socket.request.user.id, msg, function (err) {
                        io.sockets.in(msg).emit('user_disconnected', socket.request.user);
                    });
                    io.sockets.in(msg).emit('user_disconnected', socket.request.user);
                }
            });
        });

        /* handle user disconnection from room*/
        socket.on('chat_message', function(msg){
            db.userInRoom(socket.request.user, msg.room, function (err, userInRoom) {
                if(userInRoom){
                    var message = "<"+socket.request.user.userName+">: "+msg.mes;
                    io.sockets.in(msg.room).emit('chat_message', message);
                    db.saveMessage(message, msg.room);
                }
            });
        });

        /* handle request for all message history in room */
        socket.on('get_all_messages', function(msg){
            db.userInRoom(socket.request.user, msg.room, function (err, userInRoom) {
                if(userInRoom){
                    db.getAllMessages(msg.room, function(err, messages){
                        io.to(socket.id).emit('get_messages', messages);
                    });
                }
            });
        });

        /* handle request for 100 last messages from given point in room */
        socket.on('get_100_messages', function(msg){
            db.userInRoom(socket.request.user, msg.room, function (err, userInRoom) {
                if(userInRoom){
                    db.getMessageRange(msg.room, msg.mi - 100, msg.mi, function(err, messages){
                        io.to(socket.id).emit('get_messages', messages);
                    });
                }
            });
        });

        /* handle room initialization request */
        socket.on('connected_to_room', function(msg){
            var roomName = msg;

            db.getRoomId(roomName, function (err, roomId) {
                db.getRoomInfo(roomId, function(err, roomInfo){
                    if(!roomInfo.password){
                        connectToRoom(roomName, roomId, socket);
                    }else{
                        io.to(socket.id).emit("auth_required");
                    }
                });
            });
        });

        /* handle private room initialization*/
        socket.on('private_room_auth', function(msg){
            var roomName = msg.room;
            var password = msg.password;
            db.getRoomId(roomName, function (err, roomId) {
                db.getRoomInfo(roomId, function(err, roomInfo){
                    bcrypt.compare(password, roomInfo.password, function(err, result) {
                        if (result){
                            connectToRoom(roomName, roomId, socket);
                        }
                    });
                });
            });
        });

        /* initialize room for user */
        function connectToRoom(roomName, roomId, socket){
            io.sockets.in(roomName).emit("chat_message", "<"+socket.request.user.userName+">: connected to room");

            db.getAllUserNamesInRoom(roomId, function (err, result) {
                console.log(result);

                io.to(socket.id).emit("userlist", {userList: result, userId: socket.request.user.id});

                db.addUserToRoom(socket.request.user, roomId, function (err) {
                    io.sockets.in(roomName).emit("adduser", {name: socket.request.user.userName, id:socket.request.user.id});
                });
            });

            db.getRoomMessageCount(roomId, function (err, count) {
                io.to(socket.id).emit("set_message_index", count);
            });
            socket.join(roomName);
        }
    });


};

