// // backend/controllers/chatController.js
// const Conversation = require('../models/Conversation');
// const geminiService = require('../services/ geminiService');

// class ChatController {
//   // Send message and get AI response
//   async sendMessage(req, res) {
//     try {
//       const { message, userId = 'anonymous', sessionId } = req.body;

//       if (!message || message.trim() === '') {
//         return res.status(400).json({
//           success: false,
//           error: 'Message cannot be empty'
//         });
//       }

//       // Generate session ID if not provided
//       const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//       // Get or create conversation
//       let conversation = await Conversation.findOne({
//         userId,
//         sessionId: currentSessionId
//       });

//       if (!conversation) {
//         conversation = new Conversation({
//           userId,
//           sessionId: currentSessionId,
//           messages: [],
//           title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
//         });
//       }

//       // Add user message
//       conversation.messages.push({
//         role: 'user',
//         content: message,
//         timestamp: new Date()
//       });

//       // Check for emergency
//       const isEmergency = geminiService.checkForEmergency(message);
//       let aiResponse;

//       if (isEmergency) {
//         aiResponse = "🚨 **EMERGENCY DETECTED** 🚨\n\nBased on your message, this appears to be a medical emergency. Please:\n1. Go to the nearest hospital emergency room immediately\n2. Call 108 or 112 for ambulance\n3. Do not wait for a response here\n\nYour health and safety are the top priority!";
//       } else {
//         // Get last 10 messages for context
//         const recentMessages = conversation.messages.slice(-10);
//         aiResponse = await geminiService.generateResponse(message, recentMessages);
//       }

//       // Add AI response
//       conversation.messages.push({
//         role: 'assistant',
//         content: aiResponse,
//         timestamp: new Date()
//       });

//       // Save conversation
//       await conversation.save();

//       res.json({
//         success: true,
//         response: aiResponse,
//         sessionId: currentSessionId,
//         messageId: conversation.messages[conversation.messages.length - 1]._id,
//         isEmergency: isEmergency,
//         timestamp: new Date()
//       });

//     } catch (error) {
//       console.error('Send message error:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to process message',
//         message: error.message
//       });
//     }
//   }

//   // Get conversation history
//   async getConversation(req, res) {
//     try {
//       const { userId, sessionId } = req.params;

//       const conversation = await Conversation.findOne({ userId, sessionId });

//       if (!conversation) {
//         return res.json({
//           success: true,
//           messages: [],
//           sessionId,
//           userId
//         });
//       }

//       res.json({
//         success: true,
//         messages: conversation.messages,
//         title: conversation.title,
//         createdAt: conversation.createdAt,
//         updatedAt: conversation.updatedAt
//       });

//     } catch (error) {
//       console.error('Get conversation error:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to fetch conversation'
//       });
//     }
//   }

//   // Get all conversations for a user
//   async getUserConversations(req, res) {
//     try {
//       const { userId } = req.params;

//       const conversations = await Conversation.find({ userId })
//         .sort({ updatedAt: -1 })
//         .select('sessionId title createdAt updatedAt messages')
//         .lean();

//       // Add last message preview
//       const conversationsWithPreview = conversations.map(conv => ({
//         ...conv,
//         lastMessage: conv.messages.length > 0 
//           ? conv.messages[conv.messages.length - 1].content.substring(0, 100)
//           : 'No messages yet'
//       }));

//       res.json({
//         success: true,
//         conversations: conversationsWithPreview
//       });

//     } catch (error) {
//       console.error('Get user conversations error:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to fetch conversations'
//       });
//     }
//   }

//   // Delete conversation
//   async deleteConversation(req, res) {
//     try {
//       const { userId, sessionId } = req.params;

//       await Conversation.deleteOne({ userId, sessionId });

//       res.json({
//         success: true,
//         message: 'Conversation deleted successfully'
//       });

//     } catch (error) {
//       console.error('Delete conversation error:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to delete conversation'
//       });
//     }
//   }
// }

// module.exports = new ChatController();
// controllers/chatController.js

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

exports.streamChat = async (req, res) => {
  try {
    const { prompt, model = "mistral" } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    // 🔴 SSE headers (VERY IMPORTANT)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: true
      })
    });

    if (!ollamaRes.ok) {
      res.write(`event: error\ndata: Ollama not responding\n\n`);
      return res.end();
    }

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete line

for (const line of lines) {
  if (!line) continue; // ❌ NO trim()

  try {
    const json = JSON.parse(line);

    if (json.response) {
      const token = json.response;

      // ✅ FIX spacing here
      const formatted =
        /^[\s.,!?;:]/.test(token) ? token : " " + token;

      res.write(`data: ${formatted}\n\n`);
    }

    if (json.done) {
      res.write(`event: done\ndata: [DONE]\n\n`);
      res.end();
      return;
    }
  } catch (err) {
    console.error("Chunk parse error:", err.message);
  }
}
    }

    res.end();

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.write(`event: error\ndata: AI stream failed\n\n`);
    res.end();
  }
};
