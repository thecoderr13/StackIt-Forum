const express = require("express")
const User = require("../models/User")
const Question = require("../models/Question")
const Answer = require("../models/Answer")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()


// GET all users
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (err) {
    console.error("Admin fetch users error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// DELETE user
router.delete("/user/:id", adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted successfully" })
  } catch (err) {
    console.error("Admin delete user error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Promote user to admin
router.put("/user/:id/promote", adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true }
    )
    res.json({ message: "User promoted to admin", user })
  } catch (err) {
    console.error("Promote user error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// GET all questions
router.get("/questions", adminAuth, async (req, res) => {
  try {
    const questions = await Question.find().populate("author", "username avatar")
    res.json(questions)
  } catch (err) {
    console.error("Fetch all questions error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// DELETE question
router.delete("/question/:id", adminAuth, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id)
    res.json({ message: "Question deleted successfully" })
  } catch (err) {
    console.error("Delete question error:", err)
    res.status(500).json({ message: "Server error" })
  }
})
router.get("/answers",  adminAuth, async (req, res) => {
  try {
    const answers = await Answer.find()
      .populate("author", "username avatar")
      .populate("question", "title")
    res.json(answers)
  } catch (err) {
    console.error("Fetch all answers error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// DELETE answer
router.delete("/answer/:id", adminAuth, async (req, res) => {
  try {
    await Answer.findByIdAndDelete(req.params.id)
    res.json({ message: "Answer deleted successfully" })
  } catch (err) {
    console.error("Delete answer error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
