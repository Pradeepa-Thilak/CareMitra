// // backend/routes/chat.js
// const express = require('express');
// const router = express.Router();
// const chatController = require('../controllers/chatController');

// // Send message
// router.post('/send', chatController.sendMessage);

// // Get conversation by session ID
// router.get('/conversation/:userId/:sessionId', chatController.getConversation);

// // Get all conversations for user
// router.get('/conversations/:userId', chatController.getUserConversations);

// // Delete conversation
// router.delete('/conversation/:userId/:sessionId', chatController.deleteConversation);

// module.exports = router;

// routes/chatRoutes.js

const express = require("express");
const router = express.Router();
const { streamChat } = require("../controllers/chatController");

router.post("/stream", streamChat);

module.exports = router;
