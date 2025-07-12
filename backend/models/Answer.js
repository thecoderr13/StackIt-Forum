const mongoose = require("mongoose")

const answerSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
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
    isAccepted: {
      type: Boolean,
      default: false,
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
answerSchema.virtual("voteScore").get(function () {
  const upvotes = this.votes?.upvotes?.length || 0
  const downvotes = this.votes?.downvotes?.length || 0
  return upvotes - downvotes
})
// Ensure virtuals are included in JSON
answerSchema.set("toJSON", { virtuals: true })

module.exports = mongoose.model("Answer", answerSchema)
