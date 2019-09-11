const express = require("express")
const router = express.Router()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")

// user related routes
router.get("/", userController.home)
router.post("/register", userController.register)
router.post("/login", userController.login)
router.post("/logout", userController.logout)

// post related routes
router.get("/create-post", userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post("/create-post", userController.mustBeLoggedIn, postController.create)
router.get("/post/:id", postController.viewSingle) // "/:id" makes it flexible. The reason we excluded userController is bcs we wanna make post public like any Blog websites.


module.exports = router
