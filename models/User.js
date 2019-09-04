let User = function(data) {
    this.data = data
    this.errors = []
}

User.prototype.validate = function(){
    if (this.data.username == ""){
        this.errors.push("You must provide a username.")
    }
    if (this.data.email == ""){
        this.errors.push("You must provide a valid email address.")
    }
    if (this.data.password == ""){
        this.errors.push("You must provide a password.")
    }
}

User.prototype.register = function(){
    // Step #1: Validate User data. None of fields can be left empty.
    this.validate()

    // Step #2: Only if there are no valdaton errors, then save the user data into a DB.

}

module.exports = User