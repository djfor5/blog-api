import User from "../models/user.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import { body, validationResult } from "express-validator"

import asyncHandler from "express-async-handler"

// Display list of all users.
const user_list = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find({})
    .sort({ name: 1 })
    .exec();

  res.json(allUsers);
});

// Display details for one user.
const user_detail = asyncHandler(async (req, res, next) => {
  // Get details of user and associated posts / comments
  const [user, posts, comments] = await Promise.all([
    User.findById(req.params.id).exec(),
    Post.find({ userId: req.params.id }, "_id").exec(),
    Comment.find({ userId: req.params.id }, "_id").exec(),
  ]);

  if (user === null) {
    // No results.
    const err = new Error("User not found");
    err.status = 404;
    return next(err);
  }

  const userObj = user.toObject() // need to convert (immutable) instance of MongoDB model into (mutable) JS object to add additional posts and comments properties
  userObj.postsId = posts.map(post => post._id) // add comment IDs to post OBJECT (not MongoDB model instance)
  userObj.commentsId = comments.map(comment => comment._id) // add comment IDs to post OBJECT (not MongoDB model instance)
  
  res.json(userObj);
});

// Handle user create on POST.
const user_create_post = [
  // Validate and sanitize fields.
  body("name", "Name is required.")
    .trim()
    .escape(),
  body("email", "Email is required.")
    .trim()
    .escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a User object with escaped and trimmed data.
    const user = new User({
      name: req.body.name,
      email: req.body.email,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.json({
        user,
        errors: errors.array(),
      });
    } else {
      // Data from API call is valid. Save user.
      await user.save();
      // res.json(user);
      res.json({
        user,
        // TODO - Only return 'true' if user actually created
        created: true,
      });
    }
  }),
];

// Handle User update on PATCH.
const user_update_patch = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .optional()
    .escape(),
  body("email")
    .trim()
    .optional()
    .escape(),
  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const originalUser = User.findById(req.params.id)
    // Create a User object with escaped/trimmed data where provided, otherwise use original properties.
    const user = new User({
      name: req.body.name || originalUser.name,
      email: req.body.email || originalUser.email,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.json({
        user,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from API call is valid. Update the record.
      const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          user,
          {new: true, runValidators: true}
        );
      // res.json(updatedUser);
      res.json({
        updatedUser,
        updated: updatedUser === null ? false : true,
      });
    }
  }),
];

// Handle User delete on DELETE.
const user_delete_delete = asyncHandler(async (req, res, next) => {
  // Get details of user and all their posts and comments (in parallel)
  const [user, allPostsByUser, allCommentsByUser] = await Promise.all([
    User.findById(req.params.id).exec(),
    Post.find({ userId: req.params.id }).exec(),
    Comment.find({ userId: req.params.id }).exec(),
  ]);

  if (allPostsByUser.length > 0 && allCommentsByUser.length > 0) {
    // User has posts and comments.
    res.json({
      user,
      postsId: allPostsByUser.map(post => post._id),
      commentsId: allCommentsByUser.map(comment => comment._id),
      // TODO - Throw actual error
      error: 'All posts and comments associated with user must be deleted prior to deleting user.'
    });
    return;
  } else if (allPostsByUser.length > 0) {
    // User has posts.
    res.json({
      user,
      postsId: allPostsByUser.map(post => post._id),
      // TODO - Throw actual error
      error: 'All posts associated with user must be deleted prior to deleting user.'
    });
    return;
  } else if (allCommentsByUser.length > 0) {
    // User has comments.
    res.json({
      user,
      commentsId: allCommentsByUser.map(comment => comment._id),
      // TODO - Throw actual error
      error: 'All comments associated with user must be deleted prior to deleting user.'
    });
    return;
  } else {
    // User has no posts and no comments. Delete object and return deleted user.
    // TODO - Do I need to escape ID parameter before using as argument in findByIdAndDelete?
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.json({
      user: deletedUser,
      deleted: deletedUser === null ? false : true,
    });
  }
});

export default {
  user_list,
  user_detail,
  user_create_post,
  user_update_patch,
  user_delete_delete,
}