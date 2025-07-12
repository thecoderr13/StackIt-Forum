const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer",
      },
    ],
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
    votes: {
      upvotes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      downvotes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Virtual for vote score
questionSchema.virtual("voteScore").get(function () {
  return this.votes.upvotes.length - this.votes.downvotes.length
})

// Virtual for answer count
questionSchema.virtual("answerCount").get(function () {
  return this.answers.length
})

// Ensure virtuals are included in JSON
questionSchema.set("toJSON", { virtuals: true })

module.exports = mongoose.model("Question", questionSchema)
