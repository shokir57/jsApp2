const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const flash = require("connect-flash")
const app = express()

let sessionOptions = session({
    secret: "Javascript is sooooo cool!",
    store: new MongoStore({client: require("./db")}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}  // 1000 * 60 * 60 * 24 sets cookie's life to expire after 1 day. 
})

app.use(sessionOptions)
app.use(flash())

app.use(function(req, res, next){
    // make all error and success flash messages available from all templates
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")

    // make current user id available on the req object
    if (req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId = 0}
        
    // make user session data  available from within view templates
    res.locals.user = req.session.user
    next()
})
const router = require("./router")

app.use(express.urlencoded({extended: false})) // boiler plate code. it tells express to add user submitted data to add to our req obj so that we can access it from "req.body".
app.use(express.json())  // tells to accept json data while submitting to the web. 


app.use(express.static("public"))
app.set("views", "views" ) //1.arg is Express obj. 2.arg is our folder name where we have html
app.set("view engine", "ejs")  // 2.arg tells which template engine we are using. ejs packg install needed to use it. npm install ejs

app.use("/", router)

module.exports = app
