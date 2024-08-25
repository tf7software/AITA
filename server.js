const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const session = require('express-session');

const app = express();
const port = 80;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.use(session({
  secret: 'your-secret-key', // Replace with a secure secret
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  // Check if a conversation history exists for this session
  if (!req.session.conversationHistory) {
    req.session.conversationHistory = '';
  }

  // Add user message to the existing conversation history (if it exists)
  if (userMessage) {
    req.session.conversationHistory += `User: ${userMessage}\n`;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction:
        "You are AITA (Artificial Intelligence Tech Assistant). " +
        "You are to help the user with tech support. " +
        "You will try your hardest and be as descriptive as possible. " +
        "If you cannot help the user easily, tell them to email rhenrywarren@gmail.com with the subject line AITA, and for them to download the chat using the button below and attach it. " +
        "If someone has a coding question, help them as well. " +
        "Get the user's device/OS they have the problem with (MacOS, Windows, iPhone, Other, etc.) " +
        "and get the user's name. Use ZERO formatting (e.g. Markdown), also there's no need to start every sentence with Hello I'm AITA, or Hello {name}",
    });

    const generationConfig = {
      temperature: 0.6,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({ generationConfig });

    // Send initial message if conversation history is empty
    if (req.session.conversationHistory === '') {
      const result = await chatSession.sendMessage("Hello! How can I assist you today?");
      const aiResponse = result.response.text();
      req.session.conversationHistory += `AITA: ${aiResponse}\n`;
      res.json({ response: aiResponse });
    } else {
      // Otherwise, send the user's message with context
      const result = await chatSession.sendMessage(req.session.conversationHistory + `User: ${userMessage}`);
      const aiResponse = result.response.text();
      req.session.conversationHistory += `AITA: ${aiResponse}\n`;
      res.json({ response: aiResponse });
    }
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});