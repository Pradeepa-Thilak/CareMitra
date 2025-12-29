// Test Gemini API
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key loaded:', !!process.env.GEMINI_API_KEY);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    console.log('Listing available models...');
    const models = await genAI.listModels();
    console.log('Available models:');
    models.forEach(model => {
      console.log(`- ${model.name}`);
    });

  } catch (error) {
    console.error('Gemini API Error:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.status);
  }
}

testGemini();