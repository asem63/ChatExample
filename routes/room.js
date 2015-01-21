var express = require("express");
var mid = require("./../middleware");
var db = require("./../database");
var router = express.Router();

module.exports = function(passport){
  /* GET home page. */
  router.get('/sample', function(req, res, next) {
    res.render('chat', { title: 'Chat' });
  });

  router.get("/createroom", mid.isAuthenticated, function(req, res){
    res.render("createRoom", { user: req.user });
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

