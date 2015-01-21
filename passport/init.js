/**
 * Created by asem63 on 21/01/15.
 */
var db = require("./../database");
var login = require('./login');
var signup = require('./signup');

module.exports = function(passport){

    passport.serializeUser(function(user, done) {
        console.log("SERIALIZING:"+user);
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        console.log("DESERIALIZING:"+id);
        db.getUserInfo(id, function (err, userInfo) {
            console.log("DESERIALIZING:"+userInfo.userName);
            done(err, userInfo);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);
};