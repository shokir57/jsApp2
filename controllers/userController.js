const User = require("../models/User")  // Dot-dot-slash is how you move one dir up.

exports.mustBeLoggedIn = function(req, res, next){
    if (req.session.user){  // means user is logged in.
         next()  // tells express to call next function for this route.
    }
    else {
        req.flash("errors", "You must be logged in to perform that action.")
        req.session.save(function(){
            res.redirect("/")
        })
    }
}

exports.login = function(req, res){
    let user = new User(req.body)
    user.login().then(function(result){   // "then" gets executed when Promise resolves.
        req.session.user = {avatar: user.avatar, username: user.data.username}
        res.session.save(function(){  // we are manually saving req.session.user again, so that we can execute the function after.
            res.redirect("/")
        })
    }).catch(function(error){  // "catch" gets executed when Promise rejects.
        req.flash("errors", error)
        req.session.save(function(){
            res.redirect("/")
        })
    })
}

exports.logout = function(req, res){
    req.session.destroy(function(){
        res.redirect("/")
    })
}

exports.register = function(req, res){
    let user = new User(req.body)
    user.register().then(() => {
        req.session.user = {username: user.data.username, avatar: user.avatar}
        req.session.save(function(){
            res.redirect("/")
        }) 
    }).catch((regErrors) => {
        regErrors.forEach(function(error){
            req.flash("regErrors", error)
        })
        req.session.save(function(){
            res.redirect("/")
        })
    })
    
}

exports.home = function(req, res){
    if (req.session.user){
        res.render("home-dashboard")
    }
    else {
        res.render("home-guest", {errors: req.flash("errors"), regErrors: req.flash("regErrors")}) 
    }
}

