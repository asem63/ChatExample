/**
 * Created by asem63 on 20/01/15.
 */
var redis = require("redis"),
    bcrypt = require("bcrypt");
    client = redis.createClient();

client.on("error", function (err) {
    console.log("DBError: " + err);
});


//function createUser(userName, password, callbackFn){
//    client.hexists("users", userName, function(err, exists){
//        if(err){
//            return console.error("hexist users failed");
//        }
//        if(exists){
//            callbackFn(err);
//        }else{
//            addNewUserToDB(userName, password);
//        }
//    });
//}

function addNewUserToDb(userName, password, callbackFn){
    client.incr("unique_user_id", function(err, id) {
        if (err){
            return console.error("incr unique_user_id failed");
        }
        insertUserInfo(userName, password, id, callbackFn);
    });
}

function insertUserInfo (userName, password, id, callbackFn){
    client.hset("users", userName, id, function (err) {
        if (err){
            return console.error("hset user id failed");
        }
    });

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

function changeUserName(userName, newUserName, callbackFn){
    client.hexists("users", userName, function(err, exists){
        if(err){
            return console.error("hexist users failed");
        }

        if(exists){
            getUserId(userName, function(id){
                client.hdel("users", userName, function (err) {
                    if (err){
                        return console.error("hdel user name failed");
                    }
                });
                client.hset("users", newUserName, id, function (err) {
                    if (err){
                        return console.error("hset user id failed");
                    }
                });

                client.hset("user:"+id, "userName", newUserName, function(err){
                    if (err){
                        return console.error("hset user password hash failed");
                    }
                });
            });
        }else{
            callbackFn(err);
        }
    });
}

function changeUserPass(userName, password, callbackFn){
    client.hexists("users", userName, function(err, exists){
        if(err){
            return console.error("hexist users failed");
        }

        if(exists){
            getUserId(userName, function(id){
                bcrypt.hash(password, 8, function(err, hash) {
                    if (err){
                        return console.error("hash generation failed");
                    }

                    client.hset("user:"+id, "password", hash, function(err){
                        if (err){
                            return console.error("hset user password hash failed");
                        }
                    });
                });
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

function getUserInfo(userId, callbackFn){
    client.hgetall("user:"+userId, function(err, info){
        if (err){
            return console.error("hgetall user info failed");
        }
        callbackFn(err, info);
    });
}

//function createRoom(roomName, password, userName, callbackFn){
//    client.hexists("rooms", roomName, function(err, exists){
//        if(err){
//            return console.error("hexist rooms failed");
//        }
//        if(exists){
//            callbackFn(err);
//        }else{
//            addNewRoomToDb(roomName, password, userName);
//        }
//    });
//}

function addNewRoomToDb(roomName, password, userName, roomDescr){
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
            client.hset("userRooms:" + userId, id, roomName, function (err) {
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
                client.hmset("room:" + id, "room_name", roomName, "room_descr", roomDescr, "password", hash, function(err){
                    if (err){
                        return console.error("hmset room password hash failed");
                    }
                });
            });
        }else{
            client.hmset("room:" + id, "room_name", roomName, "room_descr", roomDescr, "password", "", function(err){
                if (err){
                    return console.error("hmset room password hash failed");
                }
            });
        }
    });
}

function changeRoomName(roomName, newRoomName, callbackFn){
    client.hexists("rooms", roomName, function(err, exists){
        if(err){
            return console.error("hexist rooms failed");
        }

        if(exists){
            getRoomId(roomName, function(id){
                client.hdel("rooms", roomName, function (err) {
                    if (err){
                        return console.error("hdel room name failed");
                    }
                });
                client.hset("rooms", newRoomName, id, function (err) {
                    if (err){
                        return console.error("hset room id failed");
                    }
                });
                client.hset("room:" + id, "room_name", newRoomName, function(err){
                    if (err){
                        return console.error("hset room name failed");
                    }
                });
            });
        }else{
            callbackFn(err);
        }
    });
}

function changeRoomPass(roomName, newPassword, callbackFn){
    client.hexists("rooms", roomName, function(err, exists){
        if(err){
            return console.error("hexist rooms failed");
        }

        if(exists){
            getRoomId(roomName, function(id){
                if(newPassword !== ""){
                    bcrypt.hash(newPassword, 8, function(err, hash) {
                        if (err){
                            return console.error("hash generation failed");
                        }
                        client.hset("room:" + id, "password", hash, function(err){
                            if (err){
                                return console.error("hset room password hash failed");
                            }
                        });
                    });
                }else{
                    client.hset("room:" + id, "password", "", function(err){
                        if (err){
                            return console.error("hset room password hash failed");
                        }
                    });
                }
            });
        }else{
            callbackFn(err);
        }
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

function getUserRooms(userName, callbackFn){
    getUserId(userName, function (err, userId) {
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

function saveMessage(message, roomName, userName){
    client.incr("unique_message_id", function(err, messageId) {
        if (err){
            return console.error("incr unique_massage_count failed");
        }
        //getUserId(userName, function(err, userId){
        //    client.hset("userIdToMessageId", userId, messageId, function (err) {
        //        if (err){
        //            return console.error("hset UserId ->messageId hash=userIdToMessageId failed");
        //        }
        //    });
        //});
        getRoomId(roomName, function(err, roomId){
            client.incr(roomId + "_unique_message_id", function(err, roomMessageId) {
                if (err){
                    return console.error("incr room_unique_massage_id failed");
                }
                // Message content = json string {userName:name, content:content}
                client.hset("messages:" + roomId, roomMessageId, message, function (err) {
                    if (err){
                        return console.error("hset room message failed");
                    }
                });

                //client.hset("messageIdToRoomMessageId", messageId, roomMessageId,  function (err) {
                //    if (err){
                //        return console.error("hset room localMessageIds failed");
                //    }
                //});
                //
                //client.hset("roomIdToMessageId", roomId, messageId, function (err) {
                //    if (err){
                //        return console.error("hset roomId->messageId hash=roomIdToMessageId failed");
                //    }
                //});
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
module.exports.getAllRoomNames = getAllRoomNames;
module.exports.getUserRooms = getUserRooms;
module.exports.changeRoomName = changeRoomName;
module.exports.changeRoomPass = changeRoomPass;

module.exports.addNewUserToDb = addNewUserToDb;
module.exports.getUserInfo = getUserInfo;
module.exports.getUserId = getUserId;
module.exports.changeUserName = changeUserName;
module.exports.changeUserPass = changeUserPass;
