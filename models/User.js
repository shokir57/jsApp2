const validator = require("validator")

let User = function(data) {
    this.data = data
    this.errors = []
}

User.prototype.validate = function(){
    // no empty fields accepted
    if (this.data.username == ""){
        this.errors.push("You must provide a username.")
    }
    if (!validator.isEmail(this.data.email)){
        this.errors.push("You must provide a valid email address.")
    }
    if (this.data.password == ""){
        this.errors.push("You must provide a password.")
    }

    // password validation
    if (this.data.password.length > 0 && this.data.password.length < 12){
        this.errors.push("Password should be longer than 12 chars.")
    }
    if (this.data.password.length > 100){
        this.errors.push("Password cannot exceed 100 chars")
    }

    // username validation
    if (this.data.username.length > 0 && this.data.username.length < 3){
        this.errors.push("Username should be at least 3 chars.")
    }
    if (this.data.username.length > 30){
        this.errors.push("Username cannot exceed 30 chars")
    }
}

User.prototype.register = function(){
    // Step #1: Validate User data. None of fields can be left empty.
    this.validate()

    // Step #2: Only if there are no valdaton errors, then save the user data into a DB.

}

module.exports = User