const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    console.log("👉 PROFILE ROUTE HIT")
    console.log("req.user:", req.user)

    const user = await User.findById(req.user._id)
      .populate("questionsAsked", "title createdAt")
      .populate("answersGiven", "content createdAt")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        reputation: user.reputation,
        questionsAsked: user.questionsAsked,
        answersGiven: user.answersGiven,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("❌ Get profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})


// Update user profile
router.put(
  "/profile",
  auth,
  [
    body("username")
      .optional()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),
    body("bio").optional().isLength({ max: 500 }).withMessage("Bio must be less than 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { username, bio } = req.body
      const user = await User.findById(req.user._id)

      if (username && username !== user.username) {
        // Check if username is already taken
        const existingUser = await User.findOne({ username })
        if (existingUser) {
          return res.status(400).json({ message: "Username already taken" })
        }
        user.username = username
      }

      if (bio !== undefined) {
        user.bio = bio
      }

      await user.save()

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          reputation: user.reputation,
        },
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get user by ID (public profile)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-email")
      .populate("questionsAsked", "title createdAt voteScore")
      .populate("answersGiven", "content createdAt voteScore")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        bio: user.bio,
        reputation: user.reputation,
        questionsAsked: user.questionsAsked,
        answersGiven: user.answersGiven,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
