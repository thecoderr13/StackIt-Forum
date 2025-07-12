const express = require("express")
const { body, validationResult } = require("express-validator")
const Question = require("../models/Question")
const User = require("../models/User")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get all questions
router.get("/", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const search = req.query.search || ""
    const tags = req.query.tags ? req.query.tags.split(",") : []
    const sortBy = req.query.sortBy || "createdAt"
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1

    // Build query
    const query = { isActive: true }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (tags.length > 0) {
      query.tags = { $in: tags }
    }

    const questions = await Question.find(query)
      .populate("author", "username avatar reputation")
      .populate("acceptedAnswer")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)

    const total = await Question.countDocuments(query)

    res.json({
      questions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get questions error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get question by ID
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("author", "username avatar reputation")
      .populate({
        path: "answers",
        populate: {
          path: "author",
          select: "username avatar reputation",
        },
      })
      .populate("acceptedAnswer")

    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    // Increment view count
    question.views += 1
    await question.save()

    res.json(question)
  } catch (error) {
    console.error("Get question error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new question
router.post(
  "/",
  auth,
  [
    body("title").isLength({ min: 10, max: 200 }).withMessage("Title must be between 10 and 200 characters"),
    body("description").isLength({ min: 20 }).withMessage("Description must be at least 20 characters"),
    body("tags").isArray({ min: 1, max: 5 }).withMessage("Please provide 1-5 tags"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { title, description, tags } = req.body

      const question = new Question({
        title,
        description,
        tags: tags.map((tag) => tag.toLowerCase().trim()),
        author: req.user._id,
      })

      await question.save()
      await question.populate("author", "username avatar reputation")

      // Add to user's questions
      await User.findByIdAndUpdate(req.user._id, {
        $push: { questionsAsked: question._id },
      })

      res.status(201).json({
        message: "Question created successfully",
        question,
      })
    } catch (error) {
      console.error("Create question error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update question
router.put(
  "/:id",
  auth,
  [
    body("title").optional().isLength({ min: 10, max: 200 }).withMessage("Title must be between 10 and 200 characters"),
    body("description").optional().isLength({ min: 20 }).withMessage("Description must be at least 20 characters"),
    body("tags").optional().isArray({ min: 1, max: 5 }).withMessage("Please provide 1-5 tags"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const question = await Question.findById(req.params.id)

      if (!question) {
        return res.status(404).json({ message: "Question not found" })
      }

      // Check if user is the author or admin
      if (question.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this question" })
      }

      const { title, description, tags } = req.body

      if (title) question.title = title
      if (description) question.description = description
      if (tags) question.tags = tags.map((tag) => tag.toLowerCase().trim())

      await question.save()
      await question.populate("author", "username avatar reputation")

      res.json({
        message: "Question updated successfully",
        question,
      })
    } catch (error) {
      console.error("Update question error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete question
router.delete("/:id", auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    // Check if user is the author or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this question" })
    }

    question.isActive = false
    await question.save()

    res.json({ message: "Question deleted successfully" })
  } catch (error) {
    console.error("Delete question error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Vote on question
router.put("/:id/vote", auth, async (req, res) => {
  try {
    const { voteType } = req.body // 'up' or 'down'
    const question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    const userId = req.user._id
    const hasUpvoted = question.votes.upvotes.includes(userId)
    const hasDownvoted = question.votes.downvotes.includes(userId)

    // Remove existing votes
    question.votes.upvotes = question.votes.upvotes.filter((id) => !id.equals(userId))
    question.votes.downvotes = question.votes.downvotes.filter((id) => !id.equals(userId))

    // Add new vote if different from existing
    if (voteType === "up" && !hasUpvoted) {
      question.votes.upvotes.push(userId)
    } else if (voteType === "down" && !hasDownvoted) {
      question.votes.downvotes.push(userId)
    }

    await question.save()

    res.json({
      message: "Vote recorded successfully",
      voteScore: question.voteScore,
    })
  } catch (error) {
    console.error("Vote question error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
