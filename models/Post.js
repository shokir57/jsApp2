const postsCollection = require("../db").db().collection("posts")
const followsCollection = require("../db").db().collection("follows")
const ObjectID = require("mongodb").ObjectID  // a tool from mongodb, where we pass a string of text and it will return that as a special ObjectID object type.
const User = require("./User")
const sanitizeHTML = require("sanitize-html")


let Post = function(data, userid, requestedPostId){
    this.data = data
    this.errors = []
    this.userid = userid
    this.requestedPostId = requestedPostId
}

Post.prototype.cleanUp = function(){
    if (typeof(this.data.title) != "string") {this.data.title = ""}

    if (typeof(this.data.body) != "string") {this.data.body = ""}

    // get rid of any bogus properties
    this.data = {
        title: sanitizeHTML(this.data.title.trim(), {allowedTags: [], allowedAttributes: {}}),
        body: sanitizeHTML(this.data.body.trim(), {allowedTags: [], allowedAttributes: {}}),
        createdDate: new Date(),
        author: ObjectID(this.userid)
    }

}

Post.prototype.validate = function(){
    if (this.data.title == ""){this.errors.push("You must provide a title.")}
    if (this.data.body == ""){this.errors.push("You must provide post content.")}
}

Post.prototype.create = function(){
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()

        if (!this.errors.length){
            postsCollection.insertOne(this.data).then((info) => {
                resolve(info.ops[0]._id)
            }).catch(() => {
                this.errors.push("Please try again later...")  // server problem or db connection problem.  
                reject(this.errors)
            })
        }
        else {
            reject(this.errors)
        }
    })
}

Post.prototype.update = function() {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(this.requestedPostId, this.userid)
            if (post.isVisitorOwner) {
                // actually update the db
                let status = await this.actuallyUpdate()
                resolve(status)
            } else {
                reject()
            }

        } catch {
            reject()
        }
    })
}

Post.prototype.actuallyUpdate = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            await postsCollection.findOneAndUpdate({_id: new ObjectID(this.requestedPostId)}, {$set: {title: this.data.title, body: this.data.body}})
            resolve("success")
        } else {
            resolve("failure")
        }
    })
}

// Reusable prototype starts here.

Post.reusablePostQuery = function(uniqueOperations, visitorId){
    return new Promise(async function(resolve, reject){

        let aggOperations = uniqueOperations.concat([
            {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}}, 
            {$project: { 
                title: 1,
                body: 1,
                createdDate: 1,
                authorId: "$author",
                author: {$arrayElemAt: ["$authorDocument", 0]}
            }}
        ])
        
        let posts = await postsCollection.aggregate(aggOperations).toArray()

        // clean up author property in each post object
        posts = posts.map(function(post){
            post.isVisitorOwner = post.authorId.equals(visitorId)
            post.authorId = undefined  // author id should not be seen when we have a search result.

            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })
        
        resolve(posts)
    })
}

//Reusable prototype ends here.


Post.findSingleById = function(id, visitorId){
    return new Promise(async function(resolve, reject){
        if (typeof(id) != "string" || !ObjectID.isValid(id)){
            reject()
            return
        } 
        
        let posts = await Post.reusablePostQuery([
            {$match: {_id: new ObjectID(id)}}
        ], visitorId)

        if (posts.length){
            console.log(posts[0])
            resolve(posts[0])
        }
        else {
            reject()
        }
    })
}

Post.findByAuthorId = function(authorId) {
    return Post.reusablePostQuery([
        {$match: {author: authorId}},
        {$sort: {createdDate: -1}}  // value of 1 lists the date in Ascending order, whereas -1 lists in Descending order.
    ])
}

Post.delete = function(postIdToDelete, currentUserId) {
    return new Promise(async (resolve, reject) => {
        try {  
            let post = await Post.findSingleById(postIdToDelete, currentUserId)
            if (post.isVisitorOwner) {
                await postsCollection.deleteOne({_id: new ObjectID(postIdToDelete)})
                resolve()
            }
            else {
                reject()  // a person deleting the post is not owner of it.
            }
        } catch {
            reject()  // post id is not valid or the post does not exist.
        }
    })
}
Post.search = function(searchTerm) {
    return new Promise(async (resolve, reject) => {
        if (typeof(searchTerm) == "string") {
            let posts = await Post.reusablePostQuery([
                {$match: {$text: {$search: searchTerm}}},
                {$sort: {score: {$meta: "textScore"}}}
            ])
            resolve(posts)
        }
        else {
            reject()
        }
    })
}

Post.countPostByAuthor = function (id) {
    return new Promise(async (resolve, reject) => {
        let postCount = await postsCollection.countDocuments({author: id})
        resolve(postCount)
    })
}

Post.getFeed = async function (id) {
    // create an array of the user ids that the current user follows
    let followedUsers = await followsCollection.find({authorId: new ObjectID(id)}).toArray()
    followedUsers = followedUsers.map(function (followDoc) {
        return followDoc.followedId
    })
    // look for posts where the author is in the above array of followed users
    return Post.reusablePostQuery([
        {$match: {author: {$in: followedUsers}}},
        {$sort: {createdDate: -1}}  // -1 displays the newest post at the top.
    ])
}

module.exports = Post