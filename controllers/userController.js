const User = require("../models/User")  // Dot-dot-slash is how you move one dir up.

exports.login = function(req, res){
    let user = new User(req.body)
    user.login().then(function(result){   // "then" gets executed when Promise resolves.
        req.session.user = {favColor: "blue", username: user.data.username}
        res.session.save(function(){  // we are manually saving req.session.user again, so that we can execute the function after.
            res.redirect("/")
        })
    }).catch(function(error){  // "catch" gets executed when Promise rejects.
        res.send(error)
    })
      
}

exports.logout = function(req, res){
    req.session.destroy(function(){
        res.redirect("/")
    })
}

exports.register = function(req, res){
    let user = new User(req.body)
    user.register()
    if (user.errors.length){  // meaning that, if length>0.
        res.send(user.errors)
    }
    else {
        res.send("Congrats, there is no errors.")
    }  
}

exports.home = function(req, res){
    if (req.session.user){
        res.render("home-dashboard", {username: req.session.user.username})
    }
    else {
        res.render("home-guest") 
    }
}

