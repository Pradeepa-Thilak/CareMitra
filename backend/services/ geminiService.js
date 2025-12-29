// backend/services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });
    
    // System prompt for healthcare assistant
    this.systemPrompt = `You are CareMitra AI, a helpful and empathetic healthcare assistant for Indian users.

IMPORTANT GUIDELINES:
1. Provide GENERAL health information and suggestions only
2. NEVER diagnose medical conditions
3. NEVER prescribe medications
4. ALWAYS recommend consulting a qualified doctor for medical issues
5. Be culturally sensitive to Indian healthcare practices
6. Use simple, clear language
7. Show empathy and understanding
8. For emergencies, always advise going to the nearest hospital

AREAS YOU CAN HELP WITH:
- General health information
- Symptom understanding
- Preventive healthcare tips
- Healthy lifestyle suggestions
- Understanding medical terms
- Medication information (general)
- Home remedies (for minor issues)
- When to see a doctor

EMERGENCY KEYWORDS: chest pain, difficulty breathing, severe bleeding, unconscious, stroke symptoms, severe injury

If user mentions emergency keywords, immediately advise:
"Please go to the nearest hospital emergency room immediately or call 108/112 for ambulance."`;
  }

  async generateResponse(userMessage, conversationHistory = []) {
    try {
      // For now, return a mock response since Gemini API is not working
      console.log('Using mock AI response for:', userMessage);
      
      const responses = [
        "I understand you're experiencing some health concerns. While I can't provide medical advice, I can offer some general information. Please consult a healthcare professional for proper diagnosis and treatment.",
        "Health is very important. For any medical symptoms, it's best to speak with a qualified doctor who can provide personalized advice based on your specific situation.",
        "I'm here to help with general health information. Remember that I'm not a substitute for professional medical care. Please see a doctor for any health concerns.",
        "Thank you for sharing that with me. For personalized health advice, I recommend consulting with a healthcare provider who can assess your individual needs.",
        "I appreciate you reaching out. While I can provide general health information, please consult a medical professional for specific concerns or symptoms."
      ];
      
      // Check for emergency keywords
      const isEmergency = this.checkForEmergency(userMessage);
      if (isEmergency) {
        return "🚨 **EMERGENCY DETECTED** 🚨\n\nBased on your message, this appears to be a medical emergency. Please:\n1. Go to the nearest hospital emergency room immediately\n2. Call 108 or 112 for ambulance\n3. Do not wait for a response here\n\nYour health and safety are the top priority!";
      }
      
      return responses[Math.floor(Math.random() * responses.length)];
      
      /* Original Gemini code - commented out until API key is fixed
      // Format conversation history
      const chatHistory = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Start chat with history
      const chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: this.systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: 'Understood. I am CareMitra AI, your healthcare assistant. How can I help you today?' }]
          },
          ...chatHistory
        ],
      });

      // Generate response
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      return text;
      */
      
    } catch (error) {
      console.error('Gemini API Error Details:');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error status:', error.status);
      console.error('Full error object:', error);
      
      // Fallback responses
      const fallbacks = [
        "I apologize, but I'm having trouble processing your request. Please try again.",
        "I'm currently experiencing technical difficulties. Please try again in a moment.",
        "I'm unable to generate a response right now. Please try again or contact support if the issue persists."
      ];
      
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }

  // Check for emergency keywords
  checkForEmergency(message) {
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'difficulty breathing', 'can\'t breathe',
      'severe bleeding', 'unconscious', 'passed out', 'stroke',
      'severe pain', 'broken bone', 'burn', 'poison', 'overdose',
      'suicide', 'self harm', 'accident', 'emergency'
    ];

    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
  }
}

module.exports = new GeminiService();