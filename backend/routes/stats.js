// In routes/stats.js or similar
const express = require("express");
const User = require("../models/User");
const Question = require("../models/Question");
const Answer = require("../models/Answer");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [questionCount, answerCount, userCount, topics] = await Promise.all([
      Question.countDocuments(),
      Answer.countDocuments(),
      User.countDocuments(),
      Question.distinct("tags") // Assuming you store tags in each question
    ]);

    res.json({
      questions: questionCount,
      answers: answerCount,
      users: userCount,
      topics: topics.length,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
