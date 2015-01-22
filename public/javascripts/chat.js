/**
 * Created by asem63 on 22/01/15.
 */
$(document).ready(function(){
    var socket = io();

    var roomName = $("title").text();
    socket.emit("connected_to_room", roomName);

    $("form").submit(function(e){
        console.log("here");
        e.preventDefault()
        socket.emit("chat_message", {room: roomName, mes:$("#m").val()});
        $("#m").val("");
        console.log("here1");
    });

    socket.on("chat_message", function(msg){
        console.log(msg);
        $("#messages").append($("<li>").text(msg));
    });

    window.onbeforeunload = function() {
        socket.emit("disconnect", {room: roomName, mes:"disconnected"});
    };
});

