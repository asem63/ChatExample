/**
 * Created by asem63 on 20/01/15.
 */
var redis = require("redis"),
    bcrypt = require('bcrypt');
    client = redis.createClient();

client.on("error", function (err) {
    console.log("DBError: " + err);
});


exports.createUser = function(userName, password){
    client.incr("unique_user_id", function(err, id) {
        if (err){
            return console.error("incr unique_user_id failed");
        }
        client.hset("users", userName, id, function (err) {
            if (err){
                return console.error("hset user id failed");
            }
        });

        bcrypt.hash(password, 8, function(err, hash) {
            if (err){
                return console.error("hash generation failed");
            }

            client.hmset("user:"+id, "userName", userName, "password", hash, function(err){
                if (err){
                    return console.error("hmset user password hash failed");
                }
            });
        });
    });
};

exports.getUserInfo = function(userName, callbackFn){
    client.hget("users", userName, function (err, userId) {
        if (err){
            return console.error("hget user id failed");
        }
        client.hgetall("user:"+userId, function(err, info){
            if (err){
                return console.error("hgetall user info failed");
            }
            callbackFn(info);
        });
    });
};

exports.createRoom = function(roomName, password){
    client.incr("unique_room_id", function(err, id) {
        if (err){
            return console.error("incr unique_room_id failed");
        }
        client.hset("rooms", roomName, id, function (err) {
            if (err){
                return console.error("hset room id failed");
            }
        });

        if(password !== ""){
            bcrypt.hash(password, 8, function(err, hash) {
                if (err){
                    return console.error("hash generation failed");
                }
                client.hset("room_passwords", roomName, hash, function(err){
                    if (err){
                        return console.error("hset room password hash failed");
                    }
                });
            });
        }
    });
};

exports.getAllRoomNames = function(callbackFn){
    client.hkeys("rooms", function(err, rooms){
        if (err){
            return console.error("hkeys rooms failed");
        }
        callbackFn(rooms);
    });
};

exports.gatRoomPasswordHash = function(roomName, callbackFn){
    hget("room_passwords", roomName, function(err, pass){
        if (err){
            return console.error("hget room password hash failed");
        }
        callbackFn(pass);
    });
};

exports.saveMessage = function(message, roomName){
    client.incr(roomName + "_message_count", function(err, count) {
        if (err){
            return console.error("incr room_massage_count failed");
        }
        client.hset(roomName, count, message, function (err) {
            if (err){
                return console.error("hset room message failed");
            }
        });
    });
};

exports.getMessageRange = function(roomName, start, end, callbackFn){
    var argsArr = [];
    for (var i = start; i <= end; i++) {
        argsArr.push(i);
    }

    client.hmget(roomName, argsArr, function(err, result){
        if (err){
            return console.error("hmget room messages range failed");
        }

        callbackFn(result);
    });
};