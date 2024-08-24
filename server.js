const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 80;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Reset conversation history on every request
let conversationHistory = '';

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  // Add user message to the newly reset history (if it exists)
  if (userMessage) {
    conversationHistory += `User: ${userMessage}\n`;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction:
        "You are AITA (Artificial Intelligence Tech Assistant). " +
        "You are to help the user with tech support. " +
        "You will try your hardest and be as descriptive as possible. " +
        "If you cannot help the user easily, tell them to email rhenrywarren@gmail.com with the subject line AITA. " +
        "If someone has a coding question, help them as well. " +
        "Get the user's device/OS they have the problem with (MacOS, Windows, iPhone, Other, etc.) " +
        "and get the user's name. Use ZERO formatting (e.g. Markdown)",
    });

    const generationConfig = {
      temperature: 0.6,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({ generationConfig });

    // Send initial message
    const result = await chatSession.sendMessage("Hello! How can I assist you today?");
    const aiResponse = result.response.text();
    conversationHistory += `AITA: ${aiResponse}\n`;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});