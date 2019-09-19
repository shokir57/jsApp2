const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const flash = require("connect-flash")
const markdown = require("marked")
const csrf = require("csurf")
const app = express()
const sanitizeHTML = require("sanitize-html")

app.use(express.urlencoded({extended: false})) // boiler plate code. it tells express to add user submitted data to add to our req obj so that we can access it from "req.body".
app.use(express.json())  // tells to accept json data while submitting to the web. 

app.use("/api", require("./router-api"))

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
    // make the markdown function available from within ejs templates
    res.locals.filterUserHTML = function(content) {
        return sanitizeHTML(markdown(content), {allowedTags: ["p", "br", "ul", "ol", "li", "strong", "bold", "i", "em", "h1", "h2", "h3", "h4", "h5", "h6"],allowedAttributes: {}})
    }
    
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

app.use(express.static("public"))
app.set("views", "views" ) //1.arg is Express obj. 2.arg is our folder name where we have html
app.set("view engine", "ejs")  // 2.arg tells which template engine we are using. ejs packg install needed to use it. npm install ejs


// the code below is for csrf attacks protection reasons
app.use(csrf())

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken()
    next()
})


app.use (function(err, req, res, next) {
    if (err) {
        if (err.code == "EBADCSRFTOKEN") {
            req.flash("errors", "Cross site request forgery detected.")
            req.session.save(() => res.redirect("/"))
        } else {
            res.render("404")
        }
    }
})

// csrf code ends here

app.use("/", router)

const server = require("http").createServer(app)
const io = require("socket.io")(server)

io.use(function (socket, next) {
    sessionOptions(socket.request, socket.request.res, next)
})

io.on("connection", function(socket) {
    if (socket.request.session.user) {
        let user = socket.request.session.user

        socket.emit("welcome", {username: user.username, avatar: user.avatar})

        socket.on("chatMessageFromBrowser", function (data) {  // taking the msg from a browser (socket)
            socket.broadcast.emit("chatMessageFromServer", {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar})  // sending your msg to all browsers except your own (socket.broadcast)
        })
    }
})

module.exports = server
