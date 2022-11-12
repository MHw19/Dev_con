const express = require('express');

const router = express.Router();

const { check, validationResult } = require('express-validator/check');

const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');


//@route POST api/post
//@desc   Create a post 
//@acess  private

router.post('/', [auth,
    [
        check('text', 'text is required ').not().isEmpty()

    ]],
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });

        }

        try {

            const user = await User.findById(req.user.id).select("-password");

            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,

            });

            const post = await newPost.save();

            res.json(post);

        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server Error');
        }


    });

//@route GET api/post
//@desc   Get all posts
//@acess  private

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});


//@route GET api/post/:id
//@desc   Get posts by id 
//@acess  private

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {

            return res.status(404).json({ msg: "post not found " });

        }

        res.json(post);

    } catch (error) {
        console.log(error.message);

        if (error.kind == "ObjectId") {

            return res.status(404).json({ msg: "post not found " });

        }
        res.status(500).send('Server Error');
    }
});


//@route DELETE api/post/:id
//@desc  Delete a post
//@acess  private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: "post not found " });
        }


        // check user 
        if (post.user.toString() !== req.user.id) {

            return res.status(401).json({ msg: "user not authorized " });

        }

        await post.remove();

        res.json({ msg: " post removed " });

    } catch (error) {
        console.log(error.message);

        if (error.kind == "ObjectId") {

            return res.status(404).json({ msg: "post not found " });

        }
        res.status(500).send('Server Error');
    }
});



//@route PUT api/post/like/:id
//@desc   like posts by id 
//@acess  private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // check if the post has been already liked 
        if (post.likes.filter(like => like.user.toString() == req.user.id).length > 0) {

            return res.status(400).json({ msg: "post already liked " });

        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes);

    } catch (error) {
        console.log(error.message);

        if (error.kind == "ObjectId") {

            return res.status(404).json({ msg: "post not found " });

        }
        res.status(500).send('Server Error');
    }
});



//@route PUT api/post/unlike/:id
//@desc   unlike a post
//@acess  private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // check if the post has been already unliked 
        if (post.likes.filter(like => like.user.toString() == req.user.id).length === 0) {

            return res.status(400).json({ msg: "post has not yet been liked " });

        }

        // Get a remove Index

        const removeIndex = post.likes.filter(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);


        await post.save();

        res.json(post.likes);

    } catch (error) {
        console.log(error.message);

        if (error.kind == "ObjectId") {

            return res.status(404).json({ msg: "post not found " });

        }
        res.status(500).send('Server Error');
    }
});


//@route POST api/post/comment/:id
//@desc   Comment on  a post 
//@acess  private

router.post('/comment/:id', [auth,
    [
        check('text', 'text is required ').not().isEmpty()

    ]],
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });

        }

        try {

            const user = await User.findById(req.user.id).select("-password");
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            };

            post.comments.unshift(newComment);

            await post.save();

            res.json(post.comments);

        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server Error');
        }


    });

//@route DELETE api/post/comment/:id/:comment_id
//@desc  Delete Comment on  a post 
//@acess  private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        // pull out comment 
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        // make sure comment exists
        if (!comment) {

            return res.status(404).json({ msg: "comment does not exists" });

        }

        // check user 

        if (comment.user.toString() !== req.user.id) {

            return res.status(401).json({ msg: "user not authorized" });
        }
        // Get a remove Index

        const removeIndex = post.comments.filter(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);

        await post.save();

        res.json(post.comments);



    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }


});





module.exports = router;