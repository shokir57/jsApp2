const dotenv = require("dotenv")
dotenv.config()  // this knows to look at .env file for the required info.
const mongodb = require("mongodb")

// we created .env for connectionString due to security reasons. We install "dotenv" package too. While creating an actual App, I put .env to ignore file during uploading.

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, client){
    module.exports = client
    const app = require("./app")
    app.listen(process.env.PORT)   // listening for incoming request
})