/**
 * Created by asem63 on 22/01/15.
 */
var socket = io();
var roomName;
$(document).ready(function(){

    roomName = $("title").text();
    socket.emit("connected_to_room", roomName);

    $("form").submit(function(e){
        console.log("here");
        e.preventDefault()
        socket.emit("chat_message", {room: roomName, mes:$("#m").val()});
        $("#m").val("");
        console.log("here1");
    });

    socket.on("chat_message", function(msg){
        $("#messages").append($("<li>").text(msg));
    });

    socket.on("userlist", function(msg){
        console.log(msg);
        Object.keys(msg).forEach(function (key) {
            $("#users").append($("<li id='"+key+"'>").text(msg[key]));
        });
    });

    socket.on("adduser", function(msg){
        $("#users").append($("<li id='" + msg.id + "'>").text(msg.name));
    });

    socket.on("user_disconnected", function(msg){
        console.log("user discon:" + msg);
        $("#messages").append($("<li>").text("<"+msg.userName+">: disconnected from room"));
        $("#" + msg.id).remove();
    });

    $(window).on('beforeunload', function(){
        socket.emit("room_disconnect", roomName);
        return 'Are you sure you want to chat?';
    });

});


