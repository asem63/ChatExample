/**
 * Created by asem63 on 20/01/15.
 */
var redis = require("redis"),
    bcrypt = require("bcrypt");
    client = redis.createClient();

client.on("error", function (err) {
    console.error("DBError: " + err);
});

/**
 * Adds new user to database (create unique id and calls insertUserInfo)
 * @param {String} userName
 * @param {String} password
 * @param {Function} callbackFn
 */

function addNewUserToDb(userName, password, callbackFn){
    client.incr("unique_user_id", function(err, id) {
        if (err){
            return console.error("incr unique_user_id failed");
        }
        insertUserInfo(userName, password, id, callbackFn);
    });
}

/**
 * Insert new user to database
 * @param {String} userName
 * @param {String} password
 * @param {Number} id
 * @param {Function} callbackFn
 */

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

/**
 * Changes user name in database
 * @param {String} userName
 * @param {Number} userId
 * @param {String} newUserName
 * @param {Function} callbackFn
 */

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

/**
 * Changes user password in database
 * @param {Number} userId
 * @param {String} password
 * @param {Function} callbackFn
 */

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

/**
 * Gets user id by user name and passes it to callbackFn
 * @param {String} userName
 * @param {Function} callbackFn
 */

function getUserId(userName, callbackFn){
    client.hget("users", userName, function (err, userId) {
        if (err){
            return console.error("hget user id failed");
        }
        callbackFn(err, userId);
    });
}

/**
 * Gets user information by user id and passes it to callbackFn
 * @param {Number} userId
 * @param {Function} callbackFn
 */
function getUserInfo(userId, callbackFn){
    client.hgetall("user:"+userId, function(err, info){
        if (err){
            return console.error("hgetall user info failed");
        }
        callbackFn(err, info);
    });
}

/**
 * Adds new room to database
 * Creates unique room id, links creator name to roomName and roomId.
 * @param {String} roomName
 * @param {String} password
 * @param {String} userName
 * @param {String} roomDescr
 */

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

/**
 * Changes room information (room name and room description)
 * @param {String} roomName
 * @param {Number} roomId
 * @param {Number} userId
 * @param {String} newRoomName
 * @param {String} newRoomDescr
 * @param {Function} callbackFn
 */

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

/**
 * Changes room password
 * @param {Number} roomId
 * @param {String} newPassword
 */

function changeRoomPass(roomId, newPassword){
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

/**
 * Deletes room with all related messages from database
 * @param {String} roomName
 * @param {Number} roomId
 * @param {Number} userId
 * @param {Function} callbackFn
 */

function deleteRoom (roomName, roomId, userId, callbackFn){
    var multi = client.multi();

    multi.del("room:" + roomId, redis.print);
    multi.del("inRoom:" + roomId, redis.print);
    multi.del("messages:" + roomId, redis.print);
    multi.del(roomId + "_unique_message_id", redis.print);
    multi.hdel("rooms", roomName, redis.print);
    multi.hdel("userRooms:" + userId, roomId, redis.print);

    multi.exec(function (err) {
        if (err){
            return console.error("multi.exec error");
        }
        callbackFn(err);
    });
}

/**
 * Gets room id by room name and passes it to callbackFn
 * @param {String} roomName
 * @param {Function} callbackFn
 */

function getRoomId(roomName, callbackFn){
    client.hget("rooms", roomName, function (err, roomId) {
        if (err){
            return console.error("hget room id failed");
        }
        callbackFn(err, roomId);
    });
}

/**
 * Gets all rooms created by certain user and passes them to callback function
 * @param {Number} userId
 * @param {Function} callbackFn
 */

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

/**
 * Checks if user created given room
 * if true passes room name to callback function
 * @param {Number} userId
 * @param {Function} callbackFn
 */

function checkOwner (userId, roomId, callbackFn){
    client.hget("userRooms:" + userId, roomId, function(err, result){
        callbackFn(err, result);
    });
}

/**
 * Gets all rooms information from database and passes it to callback function
 * @param {Function} callbackFn
 */

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

/**
 * Gets room info by room id and passes it to callback function
 * @param {Number} roomId
 * @param {Function} callbackFn
 */

function getRoomInfo(roomId, callbackFn){
    client.hgetall("room:"+roomId, function(err, pass){
        if (err){
            return console.error("hgetall room failed");
        }
        callbackFn(err, pass);
    });
}

/**
 * Checks if user currently in given room and passes user name to callback Function
 * @param {Object} user
 * @param {String} roomName
 * @param {Function} callbackFn
 */

function userInRoom(user, roomName, callbackFn){
    getRoomId(roomName, function(err, roomId){
        client.hget("inRoom:"+roomId, user.id, function(err, result){
            if (err){
                return console.error("hget users from room failed");
            }
            callbackFn(err, result);
        });
    });
}

/**
 * Add user to given room
 * @param {Object} user
 * @param {Number} roomId
 * @param {Function} callbackFn
 */

function addUserToRoom(user, roomId, callbackFn){
    client.hset("inRoom:"+roomId, user.id, user.userName, function(err){
        if (err){
            return console.error("hset users to room failed");
        }
        callbackFn(err);
    });
}

/**
 * Removes user from given room
 * @param {Number} userId
 * @param {String} roomName
 * @param {Function} callbackFn
 */

function removeUserFromRoom(userId, roomName, callbackFn){
    getRoomId(roomName, function(err, roomId){
        client.hdel("inRoom:"+roomId, userId, function(err){
            if (err){
                return console.error("hdet users from room failed");
            }
            callbackFn(err);
        });
    });
}

/**
 * Gets all current users in given room and passes them to callback function
 * @param {Number} roomId
 * @param {Function} callbackFn
 */

function getAllUserNamesInRoom(roomId, callbackFn){
    client.hgetall("inRoom:"+roomId, function(err, result){
        if (err){
            return console.error("getall users in room failed");
        }
        callbackFn(err, result);
    });
}

/**
 * Saves message to database
 * @param {String} message
 * @param {String} roomName
 */

function saveMessage(message, roomName){
    getRoomId(roomName, function(err, roomId){
        client.incr(roomId + "_unique_message_id", function(err, roomMessageId) {
            if (err){
                return console.error("incr room_unique_massage_id failed");
            }
            client.hset("messages:" + roomId, roomMessageId, message, function (err) {
                if (err){
                    return console.error("hset room messages failed");
                }
            });

        });
    });
}

/**
 * Gets gets number of messages in given room and passes it to callback function
 * @param {String} roomName
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callbackFn
 */

function getRoomMessageCount(roomId, callbackFn){
    client.get(roomId + "_unique_message_id", function(err, count){
        if (err){
            return console.error("get room messages count failed");
        }
        callbackFn(err, count);
    });
}

/**
 * Gets given range of messages from room and passes them to callback function
 * @param {String} roomName
 * @param {Number} start
 * @param {Number} end
 * @param {Function} callbackFn
 */

function getMessageRange(roomName, start, end, callbackFn){
    var localStart = start;

    if (localStart < 0){
        localStart = 0;
    }

    var argsArr = [];
    for (var i = localStart; i <= end; i++) {
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

/**
 * Gets all messages from given room and passes them to callback function
 * @param {String} roomName
 * @param {Function} callbackFn
 */

function getAllMessages(roomName, callbackFn){

    getRoomId(roomName, function(err, roomId){
        client.hvals("messages:" + roomId, function (err, resultArr) {
            if (err){
                return console.error("hmget local room messages failed");
            }
            callbackFn(err, resultArr);
        });
    });
}

module.exports.getMessageRange = getMessageRange;
module.exports.saveMessage = saveMessage;
module.exports.getRoomMessageCount = getRoomMessageCount;
module.exports.getAllMessages = getAllMessages;

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

module.exports.userInRoom = userInRoom;
module.exports.addUserToRoom = addUserToRoom;
module.exports.removeUserFromRoom = removeUserFromRoom;
module.exports.getAllUserNamesInRoom = getAllUserNamesInRoom;