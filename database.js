/**
 * Created by asem63 on 20/01/15.
 */
var redis = require("redis"),
    bcrypt = require("bcrypt");
    client = redis.createClient();

client.on("error", function (err) {
    console.log("DBError: " + err);
});


function createUser(userName, password, callbackFn){
    client.hexists("users", userName, function(err, exists){
        if(err){
            return console.error("hexist users failed");
        }
        if(exists){
            callbackFn(err);
        }else{
            addNewUserToDB(userName, password);
        }
    });
}

function addNewUserToDB(userName, password){
    client.incr("unique_user_id", function(err, id) {
        if (err){
            return console.error("incr unique_user_id failed");
        }
        insertUserInfo(userName, password, id);
    });
}

function insertUserInfo (userName, password, id){
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
}

function changeUserInfo(userName, password, callbackFn){
    client.hexists("users", userName, function(err, exists){
        if(err){
            return console.error("hexist rooms failed");
        }

        if(exists){
            getUserId(userName, function(id){
                insertUserInfo(userName, password, id);
            });
        }else{
            callbackFn(err);
        }
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

function getUserInfo(userName, callbackFn){
    client.hget("users", userName, function (err, userId) {
        if (err){
            return console.error("hget user id failed");
        }
        client.hgetall("user:"+userId, function(err, info){
            if (err){
                return console.error("hgetall user info failed");
            }
            callbackFn(err, info);
        });
    });
}

function createRoom(roomName, password, userName, callbackFn){
    client.hexists("rooms", roomName, function(err, exists){
        if(err){
            return console.error("hexist rooms failed");
        }
        if(exists){
            callbackFn(err);
        }else{
            addRoomToDb(roomName, password, userName);
        }
    });
}

function addRoomToDb(roomName, password, userName){
    client.incr("unique_room_id", function(err, id) {
        if (err){
            return console.error("incr unique_room_id failed");
        }
        client.hset("rooms", roomName, id, function (err) {
            if (err){
                return console.error("hset room id failed");
            }
        });

        getUserId(userName, function (err, userId) {
            client.hset("userIdToRoomId", userId, id, function (err) {
                if (err){
                    return console.error("hset room id failed");
                }
            });
        });


        if(password !== ""){
            bcrypt.hash(password, 8, function(err, hash) {
                if (err){
                    return console.error("hash generation failed");
                }
                client.hmset("room:" + id, "room_name", roomName, "password", hash, function(err){
                    if (err){
                        return console.error("hmset room password hash failed");
                    }
                });
            });
        }else{
            client.hmset("room:" + id, "room_name", roomName, "password", "", function(err){
                if (err){
                    return console.error("hmset room password hash failed");
                }
            });
        }
    });
}

function getAllRoomNames(callbackFn){
    client.hkeys("rooms", function(err, rooms){
        if (err){
            return console.error("hkeys rooms failed");
        }
        callbackFn(err, rooms);
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

function saveMessage(message, roomName){
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
}

function getMessageRange(roomName, start, end, callbackFn){
    var argsArr = [];
    for (var i = start; i <= end; i++) {
        argsArr.push(i);
    }

    client.hmget(roomName, argsArr, function(err, result){
        if (err){
            return console.error("hmget room messages range failed");
        }

        callbackFn(err, result);
    });
}

module.exports.getMessageRange = getMessageRange;
module.exports.saveMessage = saveMessage;
module.exports.getRoomInfo = getRoomInfo;
module.exports.getAllRoomNames = getAllRoomNames;

module.exports.createUser = createUser;
module.exports.getUserId = getUserId;
module.exports.getUserInfo = getUserInfo;
module.exports.changeUserInfo = changeUserInfo;
module.exports.createRoom = createRoom;
