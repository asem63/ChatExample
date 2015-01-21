var express = require("express");
var mid = require("./../middleware");
var router = express.Router();

module.exports = function(passport){

  /* GET login page. */
  router.get("/", function(req, res) {
    // Display the Login page with any flash message, if any
    console.log("USER:"+req.user);
    res.render("index", { message: req.flash("message"), sampleText: "Werks", user:req.user });
  });
  /* Handle Login POST */
  router.get("/login", function(req, res){
    res.render("login", { message: req.flash("message"), user:req.user });
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
    //here goes db interaction
    console.log("USER:"+req.user.name);
    res.render("home", { user: req.user });
  });

  /* GET Home Page */
  router.get("/createroom", mid.isAuthenticated, function(req, res){

    res.render("createRoom", { user: req.user });
  });

  /* Handle Logout */
  router.get("/signout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  return router;
};
