var express = require("express");
var mid = require("./../middleware");
var db = require("./../database");
var router = express.Router();

module.exports = function(passport){

  /* GET login page. */
  router.get("/", function(req, res) {
    // Display the Login page with any flash message, if any
    res.render("index", { message: req.flash("message"), sampleText: "Werks"});
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
    db.getUserRooms(req.user.userName, function(err, rooms){
      if (err){
        console.log('Error in getting user rooms: '+err);
        return res.render("home", { message: req.flash("message"), rooms: null});
      }

      return res.render("home", { message: req.flash("message"), rooms: rooms});
    });
  });

  /* GET change user info page */
  router.get("/user/changeinfo", function(req, res) {
    // Display the Login page with any flash message, if any
    res.render("userEditInfo");
  });

  /* GET change user password page */
  router.get("/user/changepass", function(req, res) {
    // Display the Login page with any flash message, if any
    res.render("userEditPass");
  });

  /* Handle Logout */
  router.get("/signout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  return router;
};
