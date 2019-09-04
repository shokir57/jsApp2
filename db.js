const mongodb = require("mongodb")

const connectionString = "mongodb+srv://todoAppUser:todoAppUser100@cluster0-wtfzp.mongodb.net/complexApp?retryWrites=true&w=majority"

mongodb.connect(connectionString, {useNewUrlParser:true, useUnifiedTopology: true}, function(err, client){
    module.exports = client.db()  // this returns the db object we are interested in. This gives access and working with db from within any file when we just require in db.js file.
    const app = require("./app")
    app.listen(3000)   // listening for incoming request
})