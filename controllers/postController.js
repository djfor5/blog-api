import User from "../models/user.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import { body, validationResult } from "express-validator"

import asyncHandler from "express-async-handler"

// Get list of all posts.
const post_list = asyncHandler(async (req, res, next) => {
  const allPosts = await Post.find({})
    .sort({ title: 1 })
    .exec();
  res.json(allPosts);
});

// Get details for one Post.
const post_detail = asyncHandler(async (req, res, next) => {
  // Get details of post and associated comments
  const [post, comments] = await Promise.all([
    Post.findById(req.params.id).exec(),
    Comment.find({ postId: req.params.id }, "_id").exec(),
  ]);

  if (post === null) {
    // No results.
    const err = new Error("Post not found");
    err.status = 404;
    return next(err);
  }

  const postObj = post.toObject() // need to convert (immutable) instance of MongoDB model into (mutable) JS object to add additional comments property
  postObj.commentsId = comments.map(el => el._id) // add comment IDs to post OBJECT (not MongoDB model instance)
  
  res.json(postObj);
});

// Handle Post create on POST.
const post_create_post = [
  // Validate and sanitize fields.
  body("userId", "User ID must not be empty.")
    .trim()
    .isLength({ min: 24 })
    .isLength({ max: 24 })
    .escape(),
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("text", "Text must not be empty.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Post object with escaped and trimmed data.
    const post = new Post({
      userId: req.body.userId,
      title: req.body.title,
      text: req.body.text,
    });

    if (!errors.isEmpty()) {
      // There are errors. Return original submission again but with sanitized values/error messages.
      res.json({
        post,
        errors: errors.array(),
      });
    } else {
      // Data from API call is valid. Save post.
      await post.save();
      // res.json(post);
      res.json({
        post,
        created: true,
      });
    }
  }),
];

// Handle Post update on PATCH.
const post_update_patch = [
  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .optional()
    .escape(),
  body("text", "Text must not be empty.")
    .trim()
    .optional()
    .escape(),
  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const originalPost = Post.findById(req.params.id)
    // Create a Post object with escaped/trimmed data where provided, otherwise use original properties.
    const post = new Post({
      title: req.body.title || originalPost.title,
      text: req.body.text || originalPost.text,
      userId: originalPost.userId, // prevent assigning post to another user
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Return sanitized values/error messages.
      res.json({
        post,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from API call is valid. Update the record.
      const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          post,
          {
            new: true, // return updated document
            runValidators: true, // validate against Mongoose schema
          }
        );
      // res.json(updatedPost);
      res.json({
        updatedPost,
        updated: true,
      });
    }
  }),
];

// Handle Post delete on DELETE.
const post_delete_delete = asyncHandler(async (req, res, next) => {
  // Get details of post and all their comments (in parallel)
  const [post, allCommentsInPost] = await Promise.all([
    Post.findById(req.params.id).exec(),
    Comment.find({ postId: req.params.id }).exec(),
  ]);

  if (allCommentsInPost.length > 0) {
    // Post has comments.
    res.json({
      post,
      commentsId: allCommentsInPost.map(comment => comment._id),
      error: 'All comments associated with post must be deleted prior to deleting post.'
    });
    return;
  } else {
    // Post has no comments. Delete object and return deleted post.
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    // const postObj = post.toObject()
    // postObj.deleted = true
    // res.json(postObj);
    res.json({
      post: deletedPost,
      deleted: true,
    });
  }
});

export default {
  post_list,
  post_detail,
  post_create_post,
  post_update_patch,
  post_delete_delete,
}
