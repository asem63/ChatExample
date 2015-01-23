var express = require("express");
var mid = require("./../middleware");
var db = require("./../database");
var router = express.Router();

module.exports = function(passport){
  /* GET room page. */
  router.get('/chat/:name', mid.isAuthenticated, function(req, res, next) {
    var roomName = req.params.name;
    db.getRoomId(roomName, function (err, roomId) {
      if (err){
        req.flash("message", "database error");
        return res.redirect("/");
      }
      if(!roomId){
        req.flash("message", "Room does not exist")
        return res.redirect("/");
      }
      db.getRoomInfo(roomId, function(err, roomInfo){
        if (err){
          req.flash("message", "database error");
          return res.redirect("/");
        }
        res.render('chat', { title: 'Chat', room: roomInfo });
      });

    });


  });

  /* GET all rooms list. */
  router.get("/allrooms", mid.isAuthenticated, function(req, res){
    db.getAllRooms(function (err, rooms) {
      if (err){
        return res.render("allrooms", { message: req.flash("message"), rooms: null});
      }

      return res.render("allrooms", { message: req.flash("message"), rooms: rooms});
    });
  });

  /* GET room creation page. */
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
        return res.render("createRoom", { message: req.flash("message"), rooms: null});
      }
      if(roomId){
        req.flash("message", "Room with this name already exists")
        return res.render("createRoom", { message: req.flash("message")});
      }
      db.addNewRoomToDb(roomName, roomPass, req.user.userName, roomDescr);
      res.redirect("/home");
    });
  });

  /* GET change room information page */
  router.get("/changeinfo/:roomname", mid.isAuthenticated, function(req, res) {
    res.render("roomEditInfo", { roomName: req.params.roomname});
  });

  /* Handle POST with room changed information */
  router.post("/changeinfo/:roomname", mid.isAuthenticated, function(req, res){
    var roomNewName = req.body.newname;
    var roomNewDescr = req.body.newdescr;
    var roomName = req.params.roomname;

    db.getRoomId(roomName, function (err, roomId) {
      if (err){
        req.flash("message", "database error");
        return res.render("roomEditInfo", { message: req.flash("message"), roomName: roomName});
      }
      db.getRoomId(roomNewName, function (err, roomNewId){
        if(roomNewId){
          req.flash("message", "Room with this name already exists")
          return res.render("roomEditInfo", { message: req.flash("message"), roomName: roomName});
        }
        db.changeRoomInfo(roomName, roomId, req.user.id, roomNewName, roomNewDescr, function(err){
          if (err){
            req.flash("message", "database error");
            return res.render("roomEditInfo", { message: req.flash("message"), roomName: roomName});
          }
          res.redirect("/home");
        });
      });
    });
  });

  /* GET change room password page */
  router.get("/changepass/:roomname", mid.isAuthenticated, function(req, res) {
    res.render("roomEditPass", { roomName: req.params.roomname});
  });

  /* Handle POST with room new password */
  router.post("/changepass/:roomname", mid.isAuthenticated, function(req, res){
    var roomNewPass = req.body.newpass;
    var roomName = req.params.roomname;

    db.getRoomId(roomName, function (err, roomId) {
      if (err){
        req.flash("message", "database error");
        return res.render("roomEditPass", { message: req.flash("message"), roomName: roomName});
      }

      if(!roomId){
        req.flash("message", "Room with this name does not exist")
        return res.render("roomEditPass", { message: req.flash("message"), roomName: roomName});
      }
      db.checkOwner(req.user.id, roomId, function (err, room) {
        if (err){
          req.flash("message", "database error");
          return res.render("roomEditPass", { message: req.flash("message"), roomName: roomName});
        }

        if(!room){
          req.flash("message", "You don't own this room")
          return res.render("roomEditPass", { message: req.flash("message"), roomName: roomName});
        }
        db.changeRoomPass(roomId, roomNewPass);
        res.redirect("/home");
      });
    });
  });

  /* Handles delete room POST*/
  router.post("/delete/:roomname", mid.isAuthenticated, function(req, res){
    var roomName = req.params.roomname;

    db.getRoomId(roomName, function (err, roomId) {
      if (err) {
        req.flash("message", "database error");
        return res.redirect("/home");
      }

      if (!roomId) {
        req.flash("message", "Room with this name does not exist")
        return res.redirect("/home");
      }
      db.checkOwner(req.user.id, roomId, function (err, room) {
        if (err) {
          req.flash("message", "database error");
          return res.redirect("/home");
        }

        if (!room) {
          req.flash("message", "You don't own this room")
          return res.redirect("/home");
        }
        db.deleteRoom(roomName, roomId, req.user.id, function (err) {
          if (err) {
            req.flash("message", "database error");
            return res.redirect("/home");
          }
          res.redirect("/home");
        });
      });
    });
  });

  return router;
};

