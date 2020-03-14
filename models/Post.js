const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    text: {
      type: String,
      required: true
    },
    name: {
      type: String
    },
    avatar: {
      type: String
    },
    likes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "user"
        }
      }
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "user"
        },
        name: {
          type: String
        },
        text: {
          type: String,
          required: true
        },
        avatar: {
          type: String
        },
        date: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Post = mongoose.model("post", postSchema);

module.exports = Post;
