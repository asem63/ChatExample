/**
 * Created by asem63 on 22/01/15.
 */

$(document).ready(function(){
    var socket = io();
    var roomName = document.URL.split("/").pop();
    var messageIndex;
    var userId;

    var chatContainer = $(".messages-container");
    var chat = $("#messages");
    var users = $("#users");

    socket.emit("connected_to_room", roomName);

    socket.on("auth_required", function(){
        $("#roomPassModal").modal("show");
    });

    /* send private room auth request to server */
    $("#modal-submit").click(function(){
        socket.emit("private_room_auth", {room: roomName, password: $("#passwordInput").val()});
        $("#roomPassModal").modal("hide");
    });

    /* send chat message to server */
    $(".message-form").submit(function(e){
        e.preventDefault();
        socket.emit("chat_message", {room: roomName, mes: $("#m").val()});
        $("#m").val("");
    });

    /* receive chat message from server */
    socket.on("chat_message", function(msg){
        var chat = $("#messages");
        chat.append($("<li>").text(msg));
        chatContainer.scrollTop($(".messages-container")[0].scrollHeight);
    });

    /* ask server for all messages */
    $("#loadall").click(function(){
        if(typeof messageIndex !== "undefined" && messageIndex > 0 )
            socket.emit("get_all_messages", {room: roomName});
    });

    /* ask server for 100 messages */
    $("#load100").click(function(){
        if(typeof messageIndex !== "undefined" && messageIndex > 0 )
            socket.emit("get_100_messages", {room: roomName, mi: messageIndex});
    });

    /* retrieve messages from server */
    socket.on("get_messages", function(msg){
        messageIndex -= msg.length;
        msg.forEach(function (val) {
            chat.append($("<li>").text(val));
        });
        chatContainer.scrollTop($(".messages-container")[0].scrollHeight);
    });

    /* retrieve messageIndex from server */
    socket.on("set_message_index", function(msg){
        messageIndex = msg;
    });

    /* retrieve active user list from server */
    socket.on("userlist", function(msg){
        userId = msg.userId;
        if(msg.userList !== null){
            Object.keys(msg.userList).forEach(function (key) {
                console.log(key);
                users.append("<li id='" + key + "'>" + msg.userList[key] + "</li>");
            });
        }

    });

    /* retrieve new connected user from server */
    socket.on("adduser", function(msg){
        if(userId !== msg.id){
            users.append("<li id='" + msg.id + "'>" + msg.name + "</li>");
        }

    });

    /* cleanup after user disconnects */
    socket.on("user_disconnected", function(msg){
        chat.append($("<li>").text("<"+msg.userName+">: disconnected from room"));
        $("#" + msg.id).remove();
    });

    /* hacks */
    $(window).on('beforeunload', function(){
        socket.emit("room_disconnect", roomName);
        return 'Are you sure you want to chat?';
    });

});


