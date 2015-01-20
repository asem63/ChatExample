/**
 * Created by asem63 on 20/01/15.
 */
var redis = require("redis"),
    bcrypt = require('bcrypt');
    client = redis.createClient();

client.on("error", function (err) {
    console.log("DBError: " + err);
});

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
    var argsArr = []
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