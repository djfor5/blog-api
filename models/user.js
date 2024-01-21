import mongoose from "mongoose";

const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
},
{
  timestamps: {
    createdAt: 'joinedAt',
    updatedAt: 'updatedAt',
  },
})

const User = mongoose.model('User', UserSchema)
export default User