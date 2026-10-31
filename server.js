require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

// Gemini AI setup
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Emergency symptoms
const emergencyKeywords = [
  "difficulty breathing",
  "cannot breathe",
  "can't breathe",
  "shortness of breath",
  "chest pain",
  "unconscious",
  "not breathing",
  "severe bleeding",
  "seizure",
  "stroke",
  "overdose"
];

// Basic health information
const healthAnswers = [
  {
    keywords: ["fever", "temperature"],
    answer:
      "For a fever, rest, drink fluids, and monitor your temperature. Seek medical advice if the fever is persistent or worsening. Get urgent help if you experience confusion, difficulty breathing, or other severe symptoms."
  },
  {
    keywords: ["headache", "head pain"],
    answer:
      "For a mild headache, rest, drink water, and avoid triggers such as bright lights. Seek medical attention for a sudden, extremely severe headache or a headache with weakness, confusion, or vision problems."
  },
  {
    keywords: ["dehydration", "thirst", "water", "hydration"],
    answer:
      "To help prevent dehydration, drink water regularly, increase fluids during hot weather and exercise, and eat water-rich foods. If you have vomiting or diarrhea, an oral rehydration solution (ORS) may help. Seek urgent care for confusion, fainting, or inability to keep fluids down."
  },
  {
    keywords: ["cough", "cold", "sore throat"],
    answer:
      "For a mild cough or cold, rest, drink fluids, and consider warm drinks for comfort. Seek medical advice if symptoms worsen or persist. Difficulty breathing or severe chest pain needs urgent medical attention."
  },
  {
    keywords: ["burn", "burns", "burnt"],
    answer:
      "For a minor thermal burn, cool the area under cool running water for 20 minutes. Do not apply ice, toothpaste, or butter. Do not pull off clothing stuck to the burn. Get medical help for large, deep, chemical, or electrical burns, or burns affecting the face or airway."
  },
  {
    keywords: ["stomach pain", "stomach ache", "abdominal pain"],
    answer:
      "Mild stomach discomfort may improve with rest and small sips of water. Avoid foods that worsen symptoms. Seek urgent care for severe or worsening pain, a rigid abdomen, blood in vomit or stool, or fainting."
  },
  {
    keywords: ["vomiting", "vomit", "nausea"],
    answer:
      "Take small, frequent sips of water or ORS to help prevent dehydration. Seek medical care if vomiting continues, you cannot keep fluids down, you see blood, or you develop severe pain or signs of dehydration."
  },
  {
    keywords: ["diarrhea", "loose motion", "loose motions"],
    answer:
      "Drink fluids and use ORS to replace lost water and salts. Continue eating as tolerated. Seek medical help for blood in stool, severe abdominal pain, high fever, or signs of dehydration."
  }
];

// Home route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "RuralHealth Connect backend is running."
  });
});

// Existing rule-based health assistant
app.post("/api/health-assistant", (req, res) => {
  const question = String(req.body.question || "").toLowerCase();

  if (!question.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please enter your health question."
    });
  }

  if (emergencyKeywords.some((word) => question.includes(word))) {
    return res.json({
      success: true,
      emergency: true,
      answer:
        "Your symptoms may require emergency medical attention. Contact your local emergency service or go to the nearest emergency department now. In India, call 112 for emergency assistance.",
      sourceNote: "General safety guidance"
    });
  }

  const matched = healthAnswers.find((item) =>
    item.keywords.some((word) => question.includes(word))
  );

  if (matched) {
    return res.json({
      success: true,
      answer: matched.answer,
      sourceNote: "General health information; not a medical diagnosis."
    });
  }

  return res.json({
    success: true,
    answer:
      "I can share general health information, but I could not confidently match your question. Please consult a qualified healthcare professional for advice specific to your situation.",
    sourceNote: "General health information; not a medical diagnosis."
  });
});

// Gemini AI health assistant
app.post("/api/ai-health-assistant", async (req, res) => {
  try {
    const question = String(req.body.question || "").trim();
    const language = String(req.body.language || "en").toLowerCase();

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Please enter your health question."
      });
    }

    // Handle possible emergencies before calling AI.
    const normalizedQuestion = question.toLowerCase();

    if (
      emergencyKeywords.some((word) =>
        normalizedQuestion.includes(word)
      )
    ) {
      return res.json({
        success: true,
        emergency: true,
        answer:
          "Your symptoms may be an emergency. Please call India's emergency number 112 or go to the nearest emergency department immediately. Do not wait for an AI response.",
        sourceNote: "Emergency safety guidance"
      });
    }

    // Check whether the Gemini API key is configured.
    if (!ai) {
      return res.status(503).json({
        success: false,
        message:
          "Gemini AI is not configured. Please add your API key to the .env file and restart the server."
      });
    }

    const responseLanguage =
      language === "hi" || language === "hindi"
        ? "simple Hindi"
        : language === "hinglish"
        ? "simple Hinglish"
        : "simple English";

    const prompt = `
You are RuralHealth Connect, a rural health information assistant.

Answer the user's question in ${responseLanguage}.

Safety rules:
- Provide general educational health information, not a diagnosis.
- Use clear, simple language suitable for rural communities.
- Give practical, low-risk suggestions when appropriate.
- Never prescribe medicines or invent medication dosages.
- Do not claim that you are a doctor.
- Explain warning signs and when to seek professional medical care.
- If the question requires a medical professional, clearly say so.
- Do not invent medical references or claim you verified a source.
- Keep the response concise and easy to understand.

User's question:
${question}
`;

    console.log("Gemini AI request received.");

    const result = await ai.models.generateContent({
      model: "gemma-4-26b-a4b-it",
      contents: prompt
    });

    const answer = result.text;

    if (!answer) {
      throw new Error("The AI returned an empty response.");
    }

    return res.json({
      success: true,
      answer: answer,
      language: language,
      sourceNote:
        "AI-generated general health information. Not a diagnosis; verify medical advice with a qualified healthcare professional."
    });
  } catch (error) {
    console.error("AI assistant error:", error.message);

    return res.status(500).json({
      success: false,
      message:
        "The AI assistant could not generate a response. Check your API key, model access, and server terminal.",
      error: error.message
    });
  }
});

// Unknown API route handler
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
    path: req.path
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("==================================");
  console.log("RuralHealth Connect is running!");
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log("AI health route: POST /api/ai-health-assistant");
  console.log("==================================");
});