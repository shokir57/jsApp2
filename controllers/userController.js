const User = require("../models/User")  // Dot-dot-slash is how you move one dir up.

exports.login = function(){

}

exports.logout = function(){
    
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
    res.render("home-guest")
}

