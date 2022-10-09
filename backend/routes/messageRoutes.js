const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessage,
  updateMessage,
  replyMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/").delete(protect, deleteMessage)
router.route("/").put(protect, updateMessage)
router.route("/reply").post(protect, replyMessage)

module.exports = router;
