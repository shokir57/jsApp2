const express = require("express")
const session = require("express-session")
const app = express()

let sessionOptions = session({
    secret: "Javascript is sooooo cool!",
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}  // 1000 * 60 * 60 * 24 sets cookie's life to expire after 1 day. 
})

app.use(sessionOptions)

const router = require("./router")

app.use(express.urlencoded({extended: false})) // boiler plate code. it tells express to add user submitted data to add to our req obj so that we can access it from "req.body".
app.use(express.json())  // tells to accept json data while submitting to the web. 


app.use(express.static("public"))
app.set("views", "views" ) //1.arg is Express obj. 2.arg is our folder name where we have html
app.set("view engine", "ejs")  // 2.arg tells which template engine we are using. ejs packg install needed to use it. npm install ejs

app.use("/", router)

module.exports = app
