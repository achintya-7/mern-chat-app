const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessage,
  updateMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/").delete(protect, deleteMessage)
router.route("/").put(protect, updateMessage)

module.exports = router;
