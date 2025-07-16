const express = require("express")
const Notification = require("../models/Notification")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get user notifications
// Get user notifications
router.get("/", auth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "username avatar")
      .populate("relatedQuestion", "title") // Needed for link
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // So we can add `link`

    const enhancedNotifications = notifications.map((notif) => ({
      ...notif,
      link: notif.relatedQuestion ? `/questions/${notif.relatedQuestion._id}` : null,
    }));

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      notifications: enhancedNotifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    notification.isRead = true
    await notification.save()

    res.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Mark notification read error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark all notifications as read
router.put("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
