var express = require("express");
var bcrypt = require("bcrypt");
var mid = require("./../middleware");
var db = require("./../database");
var router = express.Router();

module.exports = function(passport){

  /* GET login page. */
  router.get("/", function(req, res) {
    // Display the Login page with any flash message, if any
    res.render("index", { message: req.flash("message"), sampleText: "Welcome to glorious chat!"});
  });
  /* Handle Login POST */
  router.get("/login", function(req, res){
    res.render("login", { message: req.flash("message") });
  });
  /* Handle Login POST */
  router.post("/login", passport.authenticate("login", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash : true
  }));

  /* GET Registration Page */
  router.get("/signup", function(req, res){
    res.render("register",{message: req.flash("message")});
  });

  /* Handle Registration POST */
  router.post("/signup", passport.authenticate("signup", {
    successRedirect: "/home",
    failureRedirect: "/signup",
    failureFlash : true
  }));

  /* GET Home Page */
  router.get("/home", mid.isAuthenticated, function(req, res){
    db.getUserRooms(req.user.id, function(err, rooms){
      if (err){
        console.log('Error in getting user rooms: '+err);
        return res.render("home", { message: req.flash("message"), rooms: null});
      }

      return res.render("home", { message: req.flash("message"), rooms: rooms});
    });
  });

  /* GET change user info page */
  router.get("/user/changeinfo", mid.isAuthenticated, function(req, res) {
    // Display the Login page with any flash message, if any
    res.render("userEditInfo");
  });

  /* Handles user change info POST*/
  router.post("/user/changeinfo/:userid", mid.isAuthenticated, function(req, res){
    var userNewName = req.body.email;
    var userId = req.params.userid;

    if(userId !== req.user.id){
      req.flash("message", "unauthorised");
      return res.render("userEditInfo", { message: req.flash("message")});
    }
    db.getUserId(req.user.userName, function(err, checkedUserId){
      if(!checkedUserId){
        req.flash("message", "User does not exist");
        return res.render("userEditInfo", { message: req.flash("message")});
      }
      db.changeUserName(req.user.userName, userId, userNewName, function (err) {
        if (err){
          req.flash("message", "database error");
          return res.render("userEditInfo", { message: req.flash("message")});
        }
        res.redirect("/home");
      });
    });
  });

  /* GET change user password page */
  router.get("/user/changepass", mid.isAuthenticated, function(req, res) {
    // Display the Login page with any flash message, if any
    res.render("userEditPass");
  });

  /* Handles user change info POST*/
  router.post("/user/changepass/:userid", mid.isAuthenticated, function(req, res){
    var userNewPass = req.body.newpass;
    var userOldPass = req.body.oldpass;
    var userId = req.params.userid;

    if(userId !== req.user.id){
      req.flash("message", "unauthorised");
      return res.render("userEditPass", { message: req.flash("message")});
    }

    db.getUserId(req.user.userName, function(err, checkedUserId){
      if(!checkedUserId){
        req.flash("message", "User does not exist");
        return res.render("userEditPass", { message: req.flash("message")});
      }
      bcrypt.compare(userOldPass, req.user.password, function(err, result) {
        if(!result){
          req.flash("message", "Invalid password");
          return res.render("userEditPass", { message: req.flash("message")});
        }
        db.changeUserPass(userId, userNewPass, function(err){
          if (err){
            req.flash("message", "database error");
            return res.render("userEditPass", { message: req.flash("message")});
          }
          res.redirect("/signout");
        });
      });
    });
  });

  /* Handle Logout */
  router.get("/signout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  return router;
};
