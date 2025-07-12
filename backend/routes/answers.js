const express = require("express")
const { body, validationResult } = require("express-validator")
const Answer = require("../models/Answer")
const Question = require("../models/Question")
const User = require("../models/User")
const Notification = require("../models/Notification")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Create new answer
router.post(
  "/",
  auth,
  [
    body("content").isLength({ min: 20 }).withMessage("Answer must be at least 20 characters"),
    body("questionId").isMongoId().withMessage("Valid question ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { content, questionId } = req.body

      // Check if question exists
      const question = await Question.findById(questionId)
      if (!question) {
        return res.status(404).json({ message: "Question not found" })
      }

      const answer = new Answer({
        content,
        author: req.user._id,
        question: questionId,
      })

      await answer.save()
      await answer.populate("author", "username avatar reputation")

      // Add answer to question
      question.answers.push(answer._id)
      await question.save()

      // Add to user's answers
      await User.findByIdAndUpdate(req.user._id, {
        $push: { answersGiven: answer._id },
      })

      // Create notification for question author
      if (question.author.toString() !== req.user._id.toString()) {
        const notification = new Notification({
          recipient: question.author,
          sender: req.user._id,
          type: "answer",
          message: `${req.user.username} answered your question: ${question.title}`,
          relatedQuestion: questionId,
          relatedAnswer: answer._id,
        })
        await notification.save()
      }

      res.status(201).json({
        message: "Answer created successfully",
        answer,
      })
    } catch (error) {
      console.error("Create answer error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update answer
router.put(
  "/:id",
  auth,
  [body("content").isLength({ min: 20 }).withMessage("Answer must be at least 20 characters")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const answer = await Answer.findById(req.params.id)

      if (!answer) {
        return res.status(404).json({ message: "Answer not found" })
      }

      // Check if user is the author or admin
      if (answer.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this answer" })
      }

      answer.content = req.body.content
      await answer.save()
      await answer.populate("author", "username avatar reputation")

      res.json({
        message: "Answer updated successfully",
        answer,
      })
    } catch (error) {
      console.error("Update answer error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete answer
router.delete("/:id", auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id)

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" })
    }

    // Check if user is the author or admin
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this answer" })
    }

    answer.isActive = false
    await answer.save()

    res.json({ message: "Answer deleted successfully" })
  } catch (error) {
    console.error("Delete answer error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Vote on answer
router.put("/:id/vote", auth, async (req, res) => {
  try {
    const { voteType } = req.body // 'up' or 'down'
    const answer = await Answer.findById(req.params.id)

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" })
    }

    const userId = req.user._id
    const hasUpvoted = answer.votes.upvotes.includes(userId)
    const hasDownvoted = answer.votes.downvotes.includes(userId)

    // Remove existing votes
    answer.votes.upvotes = answer.votes.upvotes.filter((id) => !id.equals(userId))
    answer.votes.downvotes = answer.votes.downvotes.filter((id) => !id.equals(userId))

    // Add new vote if different from existing
    if (voteType === "up" && !hasUpvoted) {
      answer.votes.upvotes.push(userId)
    } else if (voteType === "down" && !hasDownvoted) {
      answer.votes.downvotes.push(userId)
    }

    await answer.save()

    res.json({
      message: "Vote recorded successfully",
      voteScore: answer.voteScore,
    })
  } catch (error) {
    console.error("Vote answer error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Accept answer
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id)

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" })
    }

    const question = await Question.findById(answer.question)

    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    // Check if user is the question author
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only question author can accept answers" })
    }

    // Remove accepted status from other answers
    await Answer.updateMany({ question: question._id }, { isAccepted: false })

    // Accept this answer
    answer.isAccepted = true
    await answer.save()

    // Update question's accepted answer
    question.acceptedAnswer = answer._id
    await question.save()

    // Create notification for answer author
    if (answer.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: answer.author,
        sender: req.user._id,
        type: "accept",
        message: `Your answer was accepted for: ${question.title}`,
        relatedQuestion: question._id,
        relatedAnswer: answer._id,
      })
      await notification.save()
    }

    res.json({
      message: "Answer accepted successfully",
      answer,
    })
  } catch (error) {
    console.error("Accept answer error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
