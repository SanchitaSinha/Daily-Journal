//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const truncate = require("html-truncate");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const uri = "mongodb+srv://username:password@cluster0.code.mongodb.net/blogDB";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function(req,res) {

  Post.find({}, function(err, posts) {
    res.render("home", {
      posts: posts
    });
  });

});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/contact", function(req, res) {
  res.render("contact");
});

app.get("/compose", function(req, res) {
  res.render("compose", {postTitle:"", postBody:""});
});

app.post("/compose", function(req, res) {

    const post = new Post ({
      title: req.body.postTitle,
      content: req.body.postBody
    });

    if(post.title === "" || post.title === null ) {
      res.redirect("/compose");
    } else {
      post.save(function(err) {
        if(!err) {
          res.redirect("/");
        }
      });
    }

});

app.get("/posts/:postId", function(req, res) {

  let requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post) {
    if(err) {
      console.log(err);
    } else {
      res.render("post", {
        title: post.title,
        content: post.content,
        id: post._id
      });
    }
  });
});

app.post("/delete-post", function(req, res) {

  const deletePostId = req.body.postId;
  Post.findByIdAndDelete(deletePostId, function(err) {
    if (err)
      console.log(err);
    else {
      console.log("Deleted item " + deletePostId + " successfully.");
      res.redirect("/");
    }
  });
});

app.post("/edit-post", function(req,res) {

  const editPostId = req.body.postId;

  Post.findOne({_id: editPostId}, function(err, postFound) {
    if(!err) {

      // delete older version of post
      Post.findByIdAndDelete(editPostId, function(err, postFound) {
        if(!err) {
          console.log("Old post deleted");
        } else {
          console.log(err);
        }
      });

      // create a new version of post
      res.render("compose", {postTitle:postFound.title, postBody:postFound.content});

    } else {
      console.log(err);
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port " + port);
});
