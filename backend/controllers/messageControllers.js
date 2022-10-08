const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const { response } = require("express");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});




//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, content_type } = req.body;

  if (!content || !chatId || !content_type) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    content_type: content_type,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Delete one message
//@route           DELETE /api/Message
//@access          Protected
const deleteMessage = asyncHandler(async (req, res) => {

  const { chatId, messageId } = req.body;
  if (!chatId || !messageId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    const message = await Message.find({ chat: chatId }).findOne({ _id: messageId })
    var messageTimestamp = new Date(message['createdAt']).getTime() / 1000
    var currentTimestamp = Date.now() / 1000

    if (currentTimestamp - messageTimestamp <= 1800) {
      const response = await Message.findByIdAndDelete({ chatId: chatId, _id: messageId })
      res.status(200).json({ "response": response, "status": "message deleted" })
    } else {
      res.status(400).json({ "status": "Message older than 30 min" })
    }
  } catch (error) {
    res.status(400).json({ "error": error.message });
    console.log(error.message)
    throw new Error(error.Message);
  }
})

//@description     Update one message
//@route           PUT /api/Message
//@access          Protected
const updateMessage = asyncHandler(async (req, res) => {
  const { chatId, messageId, content } = req.body;

  if (!chatId || !messageId || !content) {
    return res.status(400).json({ "error": "Provide chatId, messageId and content" })
  }

  try {
    const message = await Message.find({ chat: chatId }).findOne({ _id: messageId })
    var messageTimestamp = new Date(message['createdAt']).getTime() / 1000;
    var currentTimestamp = Date.now() / 1000;

    if (currentTimestamp - messageTimestamp <= 1800) {
      const response = await Message.findByIdAndUpdate({ chatId: chatId, _id: messageId }, { content: content }, function (err, docs) {
        if (err) {
          res.status(400).json({ "error": error.message });
        } else {
          res.status(200).json({
            "prev_response": docs,
            "new_response_content": content,
            "status": "Message updated"
          })
        }
      })
    } else {
      res.status(400).json({ "status": "Message older than 30 min" })
    }


  } catch (error) {
    res.status(400).json({ "error": error.message });
    console.log(error.message)
    throw new Error(error.Message);
  }


})



module.exports = { allMessages, sendMessage, deleteMessage, updateMessage };
