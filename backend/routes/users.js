const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { auth } = require("../middleware/auth")
const multer = require("multer")
const cloudinary = require("../utils/cloudinary")
const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

// Get user profile
// GET /api/users/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
  .populate("questionsAsked", "title createdAt")
  .populate({
    path: "answersGiven",
    select: "content createdAt question",
    populate: {
      path: "question",
      select: "_id title", // You can include more fields if needed
    },
  })
  .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar, // ✅ this was missing earlier
        reputation: user.reputation,
        questionsAsked: user.questionsAsked,
        answersGiven: user.answersGiven,
        createdAt: user.createdAt,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})
// POST /api/users/avatar
router.post("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `avatars/${req.user._id}`,
            resource_type: "image",
            width: 256,
            height: 256,
            crop: "fill",
          },
          (error, result) => {
            if (error) return reject(error)
            resolve(result)
          }
        )
        stream.end(buffer)
      })
    }

    const result = await streamUpload(req.file.buffer)

    const user = await User.findById(req.user._id)
    user.avatar = result.secure_url
    await user.save()

    res.json({ message: "Avatar updated", avatar: result.secure_url })
  } catch (err) {
    console.error("Avatar upload error:", err)
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
    avatar: user.avatar, // <== This is important
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
