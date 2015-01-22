/**
 * Created by asem63 on 22/01/15.
 */

$(document).ready(function(){
    var socket = io();
    var roomName = $("title").text();
    var messageIndex;

    socket.emit("connected_to_room", roomName);

    /* send message to server */
    $("form").submit(function(e){
        console.log("here");
        e.preventDefault()
        socket.emit("chat_message", {room: roomName, mes:$("#m").val()});
        $("#m").val("");
        console.log("here1");
    });

    /* receive message from server */
    socket.on("chat_message", function(msg){
        $("#messages").append($("<li>").text(msg));
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
            $("#messages").append($("<li>").text(val));
        });
    });

    /* retrieve messageIndex from server */
    socket.on("set_message_index", function(msg){
        messageIndex = msg;
    });

    /* retrieve active user list from server */
    socket.on("userlist", function(msg){
        Object.keys(msg).forEach(function (key) {
            $("#users").append($("<li id='"+key+"'>").text(msg[key]));
        });
    });

    /* retrieve new connected user from server */
    socket.on("adduser", function(msg){
        $("#users").append($("<li id='" + msg.id + "'>").text(msg.name));
    });

    /* cleanup after user disconnects */
    socket.on("user_disconnected", function(msg){
        console.log("user discon:" + msg);
        $("#messages").append($("<li>").text("<"+msg.userName+">: disconnected from room"));
        $("#" + msg.id).remove();
    });

    /* hacks */
    $(window).on('beforeunload', function(){
        socket.emit("room_disconnect", roomName);
        return 'Are you sure you want to chat?';
    });

});


