const bcrypt = require("bcryptjs")
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
    if (this.data.password.length > 50){
        this.errors.push("Password cannot exceed 50 chars")
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
   return new Promise((resolve, reject) =>{
        this.cleanUp()
        usersCollection.findOne({username: this.data.username}).then((attemptedUser) => {
            if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){ // here "this" keyword points to user obj because we used arrow function. Oherwise, it would point to global object which we don't want here.
                resolve("Congrats!!!")
            }
            else{
                reject("Invalid username / password") 
            }
        }).catch(function(){
            reject("Please try again later.") // something is wrong with the server or some unforseen errors that we didn't account for. MongoDB failed for some reason. Error is on our side as a developer.
        })
    })
}

User.prototype.register = function(){
    // Step #1: Validate User data. None of fields can be left empty.
    this.cleanUp()
    this.validate()

    // Step #2: Only if there are no valdaton errors, then save the user data into a DB.
    if (!this.errors.length){
        // hash user password. Bcrypt is a 2-step process.
        let salt = bcrypt.genSaltSync(10)
        this.data.password = bcrypt.hashSync(this.data.password, salt)

        usersCollection.insertOne(this.data)
    }
}

module.exports = User