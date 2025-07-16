const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Register
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { username, email, password } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      })

      if (existingUser) {
        return res.status(400).json({
          message: existingUser.email === email ? "User with this email already exists" : "Username already taken",
        })
      }

      // Create new user
      const user = new User({ username, email, password })
      await user.sres.status(201).json({
  message: "User registered successfully",
  token,
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar, // ✅ Add this
  },
})
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  },
)

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body

      // Find user by email
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Check password
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.json({
  message: "Login successful",
  token,
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar, // ✅ Add this
  },
})

    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error during login" })
    }
  },
)

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })

    res.json({ user })
    //console.log("🚀 Auth user after login:", user)

  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
