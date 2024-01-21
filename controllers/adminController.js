import User from "../models/user.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import { body, validationResult } from "express-validator"

import asyncHandler from "express-async-handler"

const index = asyncHandler(async (req, res, next) => {
  // Get details of users, posts, and comments counts (in parallel)
  const [
    numUsers,
    numPosts,
    numComments,
  ] = await Promise.all([
    User.countDocuments({}).exec(),
    Post.countDocuments({}).exec(),
    Comment.countDocuments({}).exec(),
  ]);

  res.json({
    numUsers,
    numPosts,
    numComments,
  })
});

const all_delete_delete = asyncHandler(async (req, res, next) => {
  // Delete all users, posts, and comments (in parallel)
  const [
    users,
    posts,
    comments,
  ] = await Promise.all([
    User.deleteMany({}).exec(),
    Post.deleteMany({}).exec(),
    Comment.deleteMany({}).exec(),
  ]);

  res.json({
    users,
    posts,
    comments,
    deleted: true,
  })
});

export default {
  index,
  all_delete_delete,
}