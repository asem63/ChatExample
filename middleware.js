/**
 * Created by asem63 on 21/01/15.
 */

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}

module.exports.isAuthenticated = isAuthenticated;