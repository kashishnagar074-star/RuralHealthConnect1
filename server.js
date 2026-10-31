
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI securely on the backend.
const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
  ? new GoogleGenAI({ apiKey })
  : null;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Emergency symptom keywords
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
  "overdose",
  "saans nahi aa rahi",
  "saans lene mein dikkat",
  "behosh",
  "bahut khoon beh raha"
];

// Home route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Backend health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RuralHealth Connect backend is running.",
    aiConfigured: Boolean(apiKey)
  });
});

// Basic rule-based health assistant
app.post("/api/health-assistant", (req, res) => {
  const question = String(req.body?.question || "").toLowerCase().trim();

  if (!question) {
    return res.status(400).json({
      success: false,
      message: "Please enter your health question."
    });
  }

  if (emergencyKeywords.some(word => question.includes(word))) {
    return res.json({
      success: true,
      emergency: true,
      answer:
        "Your symptoms may require emergency medical attention. In India, call 112 or go to the nearest emergency department immediately.",
      sourceNote: "Emergency safety guidance"
    });
  }

  const healthAnswers = [
    {
      keywords: ["dehydration", "thirst", "water", "hydration"],
      answer:
        "Drink water regularly, especially in hot weather and during exercise. If you have vomiting or diarrhoea, ORS can help replace lost fluids and salts. Seek urgent care for confusion, fainting, or inability to keep fluids down."
    },
    {
      keywords: ["fever", "temperature"],
      answer:
        "Rest, drink fluids, and monitor your temperature. Seek medical advice if your fever persists or worsens. Get urgent help for confusion or difficulty breathing."
    },
    {
      keywords: ["headache", "head pain"],
      answer:
        "For a mild headache, rest and drink water. Seek urgent medical care for a sudden, extremely severe headache or one accompanied by weakness, confusion, or vision problems."
    },
    {
      keywords: ["cough", "cold", "sore throat"],
      answer:
        "For mild cold symptoms, rest and drink fluids. Seek medical advice if symptoms worsen or persist. Difficulty breathing requires urgent medical attention."
    },
    {
      keywords: ["vomiting", "vomit", "nausea"],
      answer:
        "Take small, frequent sips of water or ORS. Seek medical care if you cannot keep fluids down, see blood, or develop severe pain or signs of dehydration."
    },
    {
      keywords: ["diarrhea", "diarrhoea", "loose motion"],
      answer:
        "Drink fluids and use ORS to replace lost water and salts. Seek medical help for blood in stool, severe pain, high fever, or signs of dehydration."
    }
  ];

  const matched = healthAnswers.find(item =>
    item.keywords.some(word => question.includes(word))
  );

  return res.json({
    success: true,
    answer: matched
      ? matched.answer
      : "I can share general health information, but I could not confidently match your question. Please consult a qualified healthcare professional for advice specific to your situation.",
    sourceNote: "General health information; not a medical diagnosis."
  });
});

// Gemini AI health assistant
app.post("/api/ai-health-assistant", async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim();
    const language = String(req.body?.language || "en").toLowerCase();

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Please enter your health question."
      });
    }

    if (question.length > 4000) {
      return res.status(400).json({
        success: false,
        message: "Please keep your question under 4000 characters."
      });
    }

    // Handle emergencies before calling the AI.
    const normalizedQuestion = question.toLowerCase();

    if (
      emergencyKeywords.some(word => normalizedQuestion.includes(word))
    ) {
      return res.json({
        success: true,
        emergency: true,
        answer:
          "Your symptoms may be an emergency. In India, call 112 or go to the nearest emergency department immediately. Do not wait for an AI response.",
        sourceNote: "Emergency safety guidance"
      });
    }

    if (!ai) {
      console.error("GEMINI_API_KEY is not configured.");

      return res.status(503).json({
        success: false,
        message:
          "AI service is not configured. Please check the GEMINI_API_KEY environment variable in Render."
      });
    }

    let responseLanguage = "simple English";

    if (language === "hi" || language === "hindi") {
      responseLanguage = "simple Hindi";
    } else if (language === "hinglish") {
      responseLanguage = "simple Hinglish";
    }

    const prompt = `
You are RuralHealth Connect, a rural health information assistant.

Answer the user's question in ${responseLanguage}.

Rules:
- Give general educational health information, not a diagnosis.
- Use clear, simple language.
- Offer practical, low-risk suggestions when appropriate.
- Do not prescribe medicines or invent dosages.
- Never claim to be a doctor.
- Explain warning signs and when professional care is needed.
- Never invent references or claim to have verified a source.
- Keep the answer concise and understandable.
- If the question is unrelated to health, politely explain your role.

User question:
${question}
`;

    console.log("AI health request received.");

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 700
      }
    });

    const answer =
      typeof result.text === "string" ? result.text.trim() : "";

    if (!answer) {
      console.error("Gemini returned an empty response.");

      return res.status(502).json({
        success: false,
        message: "The AI returned an empty answer. Please try again."
      });
    }

    console.log("AI health response generated successfully.");

    return res.json({
      success: true,
      answer,
      language,
      sourceNote:
        "AI-generated general health information. This is not a diagnosis; consult a qualified healthcare professional."
    });

  } catch (error) {
    // Keep detailed errors in server logs, not in public responses.
    console.error("AI assistant error:", {
      message: error.message,
      status: error.status || error.statusCode || null
    });

    const status = error.status || error.statusCode;

    if (status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI request limit reached. Please wait and try again."
      });
    }

    if (status === 401 || status === 403) {
      return res.status(502).json({
        success: false,
        message: "AI authentication failed. Check the Gemini API key and its permissions in Render."
      });
    }

    return res.status(502).json({
      success: false,
      message:
        "The AI service could not generate an answer. Please try again shortly."
    });
  }
});

// Handle unknown API routes
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
  console.log("RuralHealth Connect backend started.");
  console.log(`Port: ${PORT}`);
  console.log(`Gemini configured: ${Boolean(apiKey)}`);
  console.log("AI route: POST /api/ai-health-assistant");
  console.log("==================================");
});
