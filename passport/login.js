/**
 * Created by asem63 on 21/01/15.
 */
var db = require("./../database");
var bcrypt = require("bcrypt");


module.exports = function(passport){
    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
            // check in db if a user with username exists or not
            db.getUserId(username, function (err, userId) {
                if (err)
                    return done(err);
                // Username does not exist, log error & redirect back
                if (!userId){
                    console.log('User Not Found with username '+username);
                    return done(null, false,
                        req.flash('message', 'User Not found.'));
                }
                db.getUserInfo(userId, function(err, userInfo){
                    if (err)
                        return done(err);
                    bcrypt.compare(password, userInfo.password, function(err, res) {
                        if (!res){
                            console.log('Invalid Password');
                            return done(null, false,
                                req.flash('message', 'Invalid Password'));
                        }
                        // User and password both match, return user from
                        // done method which will be treated like success
                        return done(null, userInfo);
                    });

                });
            });
        }));
}