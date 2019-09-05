const dotenv = require("dotenv")
dotenv.config()  // this knows to look at .env file for the required info.
const mongodb = require("mongodb")

// we created .env for connectionString due to security reasons. We install "dotenv" package too. While creating an actual App, I put .env to ignore file during uploading.

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, client){
    module.exports = client.db()  // this returns the db object we are interested in. This gives access and working with db from within any file when we just require in db.js file.
    const app = require("./app")
    app.listen(process.env.PORT)   // listening for incoming request
})