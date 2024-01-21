import Comment from "../models/comment.js";
import { body, validationResult } from "express-validator"
import mongoose from "mongoose";

import asyncHandler from "express-async-handler"

// Get list of all comments.
const comment_list = asyncHandler(async (req, res, next) => {
  const allComments = await Comment.find({})
    .sort({ text: 1 })
    .exec();

  res.json(allComments);
});

// Get details for one Comment.
const comment_detail = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  // Get details of comment
  const comment = await Comment.findById(req.params.id).exec();

  if (comment === null) {
    // No results.
    const err = new Error("Comment not found");
    err.status = 404;
    return next(err);
  }

  res.json(comment);
});

// Handle Comment create on POST.
const comment_create_post = [
  // Validate and sanitize fields.
  body("postId", "Post ID is required.")
    .trim()
    .escape(),
  body("userId", "User ID is required.")
    .trim()
    .escape(),
  body("text", "Text is required.")
    .trim()
    .escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Comment object with escaped and trimmed data.
    const comment = new Comment({
      postId: req.body.postId, // this will fail when document is saved if ID is invalid
      userId: req.body.userId, // this will fail when document is saved if ID is invalid
      text: req.body.text,
    });

    if (!errors.isEmpty()) {
      // There are errors. Return original submission again but with sanitized values/error messages.
      res.json({
        comment,
        errors: errors.array(),
      });
    } else {
      // Data from API call is valid. Save comment.
      await comment.save();
      res.json(comment);
    }
  }),
];

// Handle Comment update on PATCH.
const comment_update_patch = [
  // Validate and sanitize fields.
  body("text", "Text is required.")
    .trim()
    .optional()
    .escape(),
  
  // Check for an invalid ID
  (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    next(); // Proceed to the next middleware if the ID is valid
  },

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const originalComment = await Comment.findById(req.params.id, {postId: 1, userId: 1})
    
    // Check if the document exists
    if (!originalComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Create a Comment object with escaped/trimmed data where provided, otherwise use original properties.
    const comment = new Comment({
      text: req.body.text || originalComment.text,
      postId: originalComment.postId, // prevent assigning comment to another post
      userId: originalComment.userId, // prevent assigning comment to another user
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Return sanitized values/error messages.
      res.json({
        comment,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from API call is valid. Update the record.
      const updatedComment = await Comment.findByIdAndUpdate(
          req.params.id,
          comment,
          {
            new: true, // return updated document
            runValidators: true, // validate against Mongoose schema
          }
        );
      res.json({
        comment: updatedComment,
        updated: updatedComment === null ? false : true
      });
    }
  }),
];

// Handle Comment delete on DELETE.
const comment_delete_delete = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  // Delete comment and return deleted comment.
  const deletedComment = await Comment.findByIdAndDelete(req.params.id);

  // Check if the document exists
  if (!deletedComment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  res.json({
    comment: deletedComment,
    deleted: deletedComment === null ? false : true
  });
});

export default {
  comment_list,
  comment_detail,
  comment_create_post,
  comment_update_patch,
  comment_delete_delete,
}