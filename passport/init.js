/**
 * Created by asem63 on 21/01/15.
 */
var db = require("./../database");
var login = require('./login');
var signup = require('./signup');

module.exports = function(passport){

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        db.getUserInfo(id, function (err, userInfo) {
            done(err, {id: userInfo[0], name: userInfo[1], password: userInfo[2]});
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);
};