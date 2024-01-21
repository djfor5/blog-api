import mongoose from "mongoose";

const Schema = mongoose.Schema

const CommentSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Post",
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  text: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,
})

const Comment = mongoose.model('Comment', CommentSchema)
export default Comment