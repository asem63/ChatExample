var express = require("express");
var mid = require("./../middleware");
var db = require("./../database");
var router = express.Router();

module.exports = function(passport){
  /* GET simple chat page. */
  router.get('/sample', function(req, res, next) {
    res.render('chat', { title: 'Chat' });
  });

  /* GET all rooms list. */
  router.get("/allrooms", function(req, res){
    db.getAllRooms(function (err, rooms) {
      if (err){
        console.log('Error in getting user rooms: '+err);
        return res.render("allrooms", { message: req.flash("message"), rooms: null});
      }

      return res.render("allrooms", { message: req.flash("message"), rooms: rooms});
    });
  });

  /* GET room edition page. */
  router.get("/createroom", mid.isAuthenticated, function(req, res){
    res.render("createRoom");
  });

  /* POST room creation data. */
  router.post("/createroom", mid.isAuthenticated, function(req, res){
    var roomName = req.body.roomname;
    var roomPass = req.body.password;
    var roomDescr = req.body.roomdescr;
    db.getRoomId(roomName, function (err, roomId) {
      if (err){
        console.log('Error in getting user rooms: '+err);
        return res.render("createRoom", { message: req.flash("message"), rooms: null});
      }
      if(roomId){
        console.log("Room exists");
        req.flash("message", "Room with this name already exists")
        return res.render("createRoom", { message: req.flash("message")});
      }
      db.addNewRoomToDb(roomName, roomPass, req.user.userName, roomDescr);
      res.redirect("/home");
    });
  });

  /* GET change room info page */
  router.get("/changeinfo/:roomname", function(req, res) {
    // Display the Login page with any flash message, if any
    res.render("roomEditInfo");
  });

  /* GET change room password page */
  router.get("/changepass/:roomname", function(req, res) {
    // Display the Login page with any flash message, if any
    res.render("roomEditPass");
  });

  return router;
};

