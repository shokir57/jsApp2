const usersCollection = require("../db").collection("users")  // We can perform CRUD operations on this variable.

const validator = require("validator")

let User = function(data) {
    this.data = data
    this.errors = []
}

User.prototype.cleanUp = function(){
    if (typeof(this.data.username) != "string"){
        this.data.username = ""
    }
    if (typeof(this.data.email) != "string"){
        this.data.email = ""
    }
    if (typeof(this.data.password) != "string"){
        this.data.password = ""
    }

    // get rid of any bogus properties
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}


User.prototype.validate = function(){
    // no empty fields accepted
    if (this.data.username == ""){
        this.errors.push("You must provide a username.")
    }
    if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)){
        this.errors.push("Username can only contain letters and numbers")
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

User.prototype.login = function(){
    this.cleanUp()
    usersCollection.findOne({username: this.data.username}, (err, attemptedUser) => {
        if (attemptedUser && attemptedUser.password == this.data.password){ // here "this" keyword points to user obj because we used arrow function. Oherwise, it would point to global object which we don't want here.
            console.log("Congrats!!!")
        }
        else{
            console.log("Invalid username / password")
        }
    })
}

User.prototype.register = function(){
    // Step #1: Validate User data. None of fields can be left empty.
    this.cleanUp()
    this.validate()

    // Step #2: Only if there are no valdaton errors, then save the user data into a DB.
    if (!this.errors.length){
        usersCollection.insertOne(this.data)
    }
}

module.exports = User