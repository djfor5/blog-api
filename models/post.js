import mongoose from "mongoose";

const Schema = mongoose.Schema

const PostSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,
})

const Post = mongoose.model('Post', PostSchema)
export default Post