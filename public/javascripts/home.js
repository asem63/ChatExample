/**
 * Created by asem63 on 22/01/15.
 */
$(document).ready(function(){
    $(".delete").click(function(event){
        event.preventDefault();
        var roomName = $(this).attr("href");
        var url = "/room/delete/" + roomName;
        $.post(url).done(function() {
           $("." + roomName).remove();
        });
    });
});