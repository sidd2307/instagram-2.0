const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// model
const Post = mongoose.model("Post")

// middleware
const requireLogin = require("../middleware/requireLogin")

// create post
router.post("/createpost", requireLogin, (req, res) => {
    const { title, body, pic } = req.body

    if (!title || !body || !pic) {
        return res.status(422).json({ error: "Please add all fields!" })
    }

    req.user.password = undefined
    const post = new Post({
        title, body, pic, postedBy: req.user
    })
    post.save().then(result => {
        res.json({ post: result, message: "Created Post Successfully!" })
    }).catch(err => { console.log(err) })
})

// get all posts
router.get("/allposts", requireLogin, (req, res) => {
    Post.find().populate("postedBy", "_id, name")
        .populate("comments.postedBy", "_id name")
        .then(posts => {
            res.json({ posts })
        }).catch(err => {
            console.log(err)
        })
})

// posts created by user
router.get("/myposts", requireLogin, (req, res) => {
    Post.find({ postedBy: req.user._id })
        .populate("postedBy", "_id, name")
        .then(myposts => {
            res.json({ myposts })
        })
        .catch(err => {
            console.log(err)
        })
})

// like posts
router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user._id }
    }, {
        new: true
    }).exec((err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        } else {
            res.json(result)
        }
    })
})

// unlike posts
router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
    }, {
        new: true
    }).exec((err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        } else {
            res.json(result)
        }
    })
})

// comment on posts
router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    }).populate("comments.postedBy", "_id name")
        .populate("postedBy", "_id name")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})

// delete post
router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    Post.findOne({ _id: req.params.postId })
        .populate("postedBy", "_id")
        .exec((err, post) => {
            if (err || !post) {
                return res.status(422).json({ error: err })
            }
            if (post.postedBy._id.toString() === req.user._id.toString()) {
                post.remove()
                    .then(result => {
                        res.json(result)
                    })
                    .catch(err => {
                        console.log(err)
                    })
            }
        })
})

// see posts of users whom we follow
router.get("/getsubposts", requireLogin, (req, res) => {
    Post.find({ postedBy: { $in: req.user.following } }).populate("postedBy", "_id, name")
        .populate("comments.postedBy", "_id name")
        .then(posts => {
            res.json({ posts })
        }).catch(err => {
            console.log(err)
        })
})

module.exports = router