const User = require("../models/User")  // Dot-dot-slash is how you move one dir up.

exports.login = function(){

}

exports.logout = function(){
    
}

exports.register = function(req, res){
    let user = new User()
    res.send("thanks for register")    
}

exports.home = function(req, res){
    res.render("home-guest")
}

