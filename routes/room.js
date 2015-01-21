var express = require("express");
var mid = require("./../middleware");
var db = require("./../database");
var router = express.Router();

module.exports = function(passport){
  /* GET home page. */
  router.get('/sample', function(req, res, next) {
    res.render('chat', { title: 'Chat' });
  });

  router.get("/allrooms", function(req, res){
    db.getAllRooms(function (err, rooms) {
      if (err){
        console.log('Error in getting user rooms: '+err);
        return res.render("allrooms", { message: req.flash("message"), rooms: null});
      }

      return res.render("allrooms", { message: req.flash("message"), rooms: rooms});
    });
  });

  router.get("/createroom", mid.isAuthenticated, function(req, res){
    res.render("createRoom");
  });

  router.post("/createroom", mid.isAuthenticated, function(req, res){
    var roomName = req.body.roomname;
    var roomPass = req.body.password;
    var roomDescr = req.body.roomdescr;
    db.addNewRoomToDb(roomName, roomPass, req.user.userName, roomDescr);
    res.redirect("/home");
  });

  return router;
};

