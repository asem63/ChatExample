/**
 * Created by asem63 on 21/01/15.
 */
var LocalStrategy   = require("passport-local").Strategy;
var bCrypt = require("bcrypt");
var db = require("./../database");


module.exports = function(passport){
    passport.use("signup", new LocalStrategy({
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, username, password, done) {
                findOrCreateUser = function(){
                    db.getUserId(username, function(err, existingUserId){
                        if (err){
                            console.log('Error in SignUp: '+err);
                            return done(err);
                        }
                        if (existingUserId) {
                            console.log('User already exists with username: ' + username);
                            return done(null, false, req.flash('message','User Already Exists'));
                        } else {
                            db.addNewUserToDb(username, password, function (err, userInfo) {
                                if (err){
                                    console.log('Error in Saving user: '+err);
                                    throw err;
                                }
                                console.log('User Registration succesful');
                                return done(null, userInfo);
                            });
                        }
                    });
                };
                // Delay the execution of findOrCreateUser and execute the method
                // in the next tick of the event loop
                process.nextTick(findOrCreateUser);
            })
    );
};