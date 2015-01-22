/**
 * Created by asem63 on 20/01/15.
 */
var redis = require("redis"),
    bcrypt = require("bcrypt");
    client = redis.createClient();

client.on("error", function (err) {
    console.error("DBError: " + err);
});


function addNewUserToDb(userName, password, callbackFn){
    client.incr("unique_user_id", function(err, id) {
        if (err){
            return console.error("incr unique_user_id failed");
        }
        insertUserInfo(userName, password, id, callbackFn);
    });
}

function insertUserInfo (userName, password, id, callbackFn){
    client.hset("users", userName, id, redis.print);

    bcrypt.hash(password, 8, function(err, hash) {
        if (err){
            return console.error("hash generation failed");
        }

        client.hmset("user:"+id, "id", id, "userName", userName, "password", hash, function(err){
            if (err){
                return console.error("hmset user password hash failed");
            }
            callbackFn(err, {id: id, userName: userName, password: hash});
        });
    });
}

function changeUserName(userName, userId, newUserName, callbackFn){
    var multi = client.multi();
    multi.hdel("users", userName, redis.print);
    multi.hset("users", newUserName, userId, redis.print);

    multi.hset("user:"+userId, "userName", newUserName, redis.print);
    multi.exec(function (err) {
        if(err){
            return console.error("multi changeUserName failed");
        }
        callbackFn(err);
    });
}

function changeUserPass(userId, password, callbackFn){
    bcrypt.hash(password, 8, function(err, hash) {
        if (err){
            return console.error("hash generation failed");
        }

        client.hset("user:"+userId, "password", hash, function (err) {
            callbackFn(err);
        });
    });
}

function getUserId(userName, callbackFn){
    client.hget("users", userName, function (err, userId) {
        if (err){
            return console.error("hget user id failed");
        }
        callbackFn(err, userId);
    });
}

function getUserInfo(userId, callbackFn){
    client.hgetall("user:"+userId, function(err, info){
        if (err){
            return console.error("hgetall user info failed");
        }
        callbackFn(err, info);
    });
}


function addNewRoomToDb(roomName, password, userName, roomDescr){
    client.incr("unique_room_id", function(err, id) {
        if (err){
            return console.error("incr unique_room_id failed");
        }

        client.hset("rooms", roomName, id, redis.print);

        getUserId(userName, function (err, userId) {
            client.hset("userRooms:" + userId, id, roomName, redis.print);
        });

        if(password !== ""){
            bcrypt.hash(password, 8, function(err, hash) {
                if (err){
                    return console.error("hash generation failed");
                }
                client.hmset("room:" + id, "room_name", roomName, "room_descr", roomDescr, "password", hash, redis.print);
            });
        }else{
            client.hmset("room:" + id, "room_name", roomName, "room_descr", roomDescr, "password", "", redis.print);
        }
    });
}

function changeRoomInfo(roomName, roomId, userId, newRoomName, newRoomDescr, callbackFn){
    var multi = client.multi();

    multi.hdel("rooms", roomName, redis.print);
    multi.hset("userRooms:" + userId, roomId, newRoomName, redis.print);
    multi.hset("rooms", newRoomName, roomId, redis.print);
    multi.hmset("room:" + roomId, "room_name", newRoomName, "room_descr", newRoomDescr, redis.print);
    multi.exec(function(err){
        if (err){
            return console.error("multi change room info failed");
        }
        callbackFn(err);
    });
}

function changeRoomPass(roomId, newPassword, callbackFn){
    if(newPassword !== ""){
        bcrypt.hash(newPassword, 8, function(err, hash) {
            if (err){
                return console.error("hash generation failed");
            }
            client.hset("room:" + roomId, "password", hash, redis.print);
        });
    }else{
        client.hset("room:" + roomId, "password", "", redis.print);
    }
}

function deleteRoom (roomName, roomId, userId, callbackFn){
    var multi = client.multi();

    multi.hdel("rooms", roomName, redis.print);
    multi.del("room:" + roomId, redis.print);
    multi.hdel("userRooms:" + userId, roomId, redis.print);
    multi.exec(function (err) {
        if (err){
            return console.error("multi.exec error");
        }
        callbackFn(err);
    });
}

function getRoomId(roomName, callbackFn){
    client.hget("rooms", roomName, function (err, roomId) {
        if (err){
            return console.error("hget room id failed");
        }
        callbackFn(err, roomId);
    });
}

function getUserRooms(userId, callbackFn){
    client.hkeys("userRooms:" + userId, function (err, result) {
        if (err){
            return console.error("hgetall userRooms id failed");
        }

        var multi = client.multi();
        result.forEach(function(val, index){
            multi.hgetall("room:" + val);
        });

        multi.exec(function(err, replies){
            callbackFn(err, replies);
        });
    });
}

function checkOwner (userId, roomId, callbackFn){
    client.hget("userRooms:" + userId, roomId, function(err, result){
        callbackFn(err, result);
    });
}

function getAllRooms(callbackFn){
    client.hvals("rooms", function(err, roomIds){
        if (err){
            return console.error("hvals rooms failed");
        }

        var multi = client.multi();
        roomIds.forEach(function (val) {
            multi.hgetall("room:" + val);
        });

        multi.exec(function(err, replies){
            callbackFn(err, replies);
        });
    });
}

function getRoomInfo(roomName, callbackFn){
    client.hgetall(roomName, function(err, pass){
        if (err){
            return console.error("hgetall room failed");
        }
        callbackFn(err, pass);
    });
}

function saveMessage(message, roomName, userName){
    client.incr("unique_message_id", function(err, messageId) {
        if (err){
            return console.error("incr unique_massage_count failed");
        }

        getRoomId(roomName, function(err, roomId){
            client.incr(roomId + "_unique_message_id", function(err, roomMessageId) {
                if (err){
                    return console.error("incr room_unique_massage_id failed");
                }
                // Message content = json string {userName:name, content:content}
                client.hset("messages:" + roomId, roomMessageId, message, redis.print);

            });
        });
    });
}

function getMessageRange(roomName, start, end, callbackFn){
    var argsArr = [];
    for (var i = start; i <= end; i++) {
        argsArr.push(i);
    }

    getRoomId(roomName, function(err, roomId){
        client.hmget("messages:" + roomId, argsArr, function (err, resultArr) {
            if (err){
                return console.error("hmget local room messages failed");
            }
            callbackFn(err, resultArr);
        });
    });
}

module.exports.getMessageRange = getMessageRange;
module.exports.saveMessage = saveMessage;

module.exports.addNewRoomToDb = addNewRoomToDb;
module.exports.getRoomInfo = getRoomInfo;
module.exports.getRoomId = getRoomId;
module.exports.getAllRooms = getAllRooms;
module.exports.getUserRooms = getUserRooms;
module.exports.checkOwner = checkOwner;
module.exports.changeRoomInfo = changeRoomInfo;
module.exports.changeRoomPass = changeRoomPass;
module.exports.deleteRoom = deleteRoom;

module.exports.addNewUserToDb = addNewUserToDb;
module.exports.getUserInfo = getUserInfo;
module.exports.getUserId = getUserId;
module.exports.changeUserName = changeUserName;
module.exports.changeUserPass = changeUserPass;
