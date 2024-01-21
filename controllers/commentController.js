import Comment from "../models/comment.js";
import { body, validationResult } from "express-validator"

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
  body("postId", "Post ID must not be empty.")
    .trim()
    .isLength({ min: 24 })
    .isLength({ max: 24 })
    .escape(),
  body("userId", "User ID must not be empty.")
    .trim()
    .isLength({ min: 24 })
    .isLength({ max: 24 })
    .escape(),
  body("text", "Text must not be empty.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Comment object with escaped and trimmed data.
    const comment = new Comment({
      postId: req.body.postId,
      userId: req.body.userId,
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
      // res.json(comment);
      res.json({
        comment,
        created: true,
      });
    }
  }),
];

// Handle Comment update on PATCH.
const comment_update_patch = [
  // Validate and sanitize fields.
  body("text", "Text must not be empty.")
    .trim()
    .optional()
    .escape(),
  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const originalComment = Comment.findById(req.params.id)
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
      // res.json(updatedComment);
      res.json({
        comment: updatedComment,
        updated: true,
      });
    }
  }),
];

// Handle Comment delete on DELETE.
const comment_delete_delete = asyncHandler(async (req, res, next) => {
  // Delete comment and return deleted comment.
  const comment = await Comment.findByIdAndDelete(req.params.id);
  // const commentObj = comment.toObject()
  // commentObj.deleted = true

  // res.json(commentObj);
  // res.json(comment);
  res.json({
    comment: comment,
    deleted: true,
  });
});

export default {
  comment_list,
  comment_detail,
  comment_create_post,
  comment_update_patch,
  comment_delete_delete,
}