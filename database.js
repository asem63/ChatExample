/**
 * Created by asem63 on 20/01/15.
 */
var redis = require("redis"),
    client = redis.createClient();

exports.createRoom = function(roomName){
    client.incr("unique_room_id", function(err, id) {
        if (err){
            return console.error("room Id creation failed");
        }
        client.hset("rooms", roomName, id, function (err) {
            if (err){
                return console.error("room name creation failed");
            }
        });
    });

}

exports.saveMessage = function(message, roomName){
    client.incr(roomName + "_message_count", function(err, count) {
        if (err){
            return console.error("room Id creation failed");
        }
        client.hset(roomName, count, message, function (err) {
            if (err){
                return console.error("room name creation failed");
            }
        });
    });
}

exports.getMessageRange = function(roomName, start, end, callbackFn){
    var argsArr = []
    for (var i = start; i <= end; i++) {
        argsArr.push(i);
    }

    client.hmget(roomName, argsArr, function(err, result){
        if (err){
            return console.error("room Id creation failed");
        }
        callbackFn(result);
    });
}