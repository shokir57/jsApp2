const postsCollection = require("../db").db().collection("posts")
const ObjectID = require("mongodb").ObjectID  // a tool from mongodb, where we pass a string of text and it will return that as a special ObjectID object type.
const User = require("./User")

let Post = function(data, userid){
    this.data = data
    this.errors = []
    this.userid = userid
}

Post.prototype.cleanUp = function(){
    if (typeof(this.data.title) != "string") {this.data.title = ""}

    if (typeof(this.data.body) != "string") {this.data.body = ""}

    // get rid of any bogus properties
    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
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
            postsCollection.insertOne(this.data).then(() => {
                resolve()
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

// Reusable prototype starts here.

Post.reusablePostQuery = function(uniqueOperations){
    return new Promise(async function(resolve, reject){

        let aggOperations = uniqueOperations.concat([
            {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}}, 
            {$project: { 
                title: 1,
                body: 1,
                createdDate: 1,
                author: {$arrayElemAt: ["$authorDocument", 0]}
            }}
        ])
        
        let posts = await postsCollection.aggregate(aggOperations).toArray()

        // clean up author property in each post object
        posts = posts.map(function(post){
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


Post.findSingleById = function(id){
    return new Promise(async function(resolve, reject){
        if (typeof(id) != "string" || !ObjectID.isValid(id)){
            reject()
            return
        } 
        
        let posts = await Post.reusablePostQuery([
            {$match: {_id: new ObjectID(id)}}
        ])
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

module.exports = Post