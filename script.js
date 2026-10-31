// ============================================
// RuralHealth Connect AI — Frontend
// Connects the website to the Express AI backend
// ============================================

const modalRoot = document.getElementById("modalRoot");
const modalContent = document.getElementById("modalContent");
const closeModalButton = document.getElementById("closeModal");
const languageButton = document.getElementById("languageBtn");
const toast = document.getElementById("toast");

let currentLanguage = "en";
let currentView = null;
let recognition = null;
let toastTimer = null;

// --------------------------------------------
// 1. English and Hindi translations
// --------------------------------------------

const translations = {
  en: {
    explore: "Explore Services",
    badge: "🌿 Healthcare for every village",
    heroTitle: 'Better Healthcare,<br><span>Closer to Home.</span>',
    heroText:
      "Access trusted health information, first-aid guidance and nearby medical facilities — all in one place.",
    ask: "💬 Ask Health Assistant",
    firstaid: "🩹 First Aid Guide",
    healthcare: "Healthcare for Everyone",
    healthcareText: "Information and support when you need it.",
    available: "Health resources available",
    stat1: "Health information",
    stat2: "Languages supported",
    stat3: "Easy-to-use platform",
    eyebrow: "OUR SERVICES",
    sectionTitle: "Healthcare support, made simpler.",
    sectionText: "Choose a service to get started.",
    card1: "AI Health Assistant",
    card1text: "Ask general health questions in simple language.",
    start: "Get started →",
    card2: "First Aid Guide",
    card2text: "Learn basic first-aid steps for common emergencies.",
    learn: "Learn more →",
    card3: "Find Nearby Hospitals",
    card3text: "Find hospitals and clinics near your location.",
    find: "Find facilities →",
    card4: "Emergency Help",
    card4text: "Quick access to emergency information.",
    gethelp: "Get help →",
    card5: "Health Knowledge",
    card5text: "Explore hygiene, nutrition and prevention tips.",
    exploremore: "Explore topics →",
    card6: "Voice Assistance",
    card6text: "Ask your question using your voice, if supported.",
    tryvoice: "Try voice →",
    emergencyTitle: "Medical emergency?",
    emergencyText:
      "Do not wait for an online response. Contact emergency services or visit the nearest emergency department.",
    emergencyBtn: "Emergency Information →",
    disclaimerTitle: "Important health notice",
    disclaimer:
      "This website provides general educational information, not a medical diagnosis. Always consult a qualified healthcare professional. In a life-threatening emergency, seek immediate medical help.",
    footer: "Bringing health information closer to every community."
  },

  hi: {
    explore: "सेवाएँ देखें",
    badge: "🌿 हर गाँव के लिए स्वास्थ्य सेवा",
    heroTitle: 'बेहतर स्वास्थ्य सेवा,<br><span>आपके करीब।</span>',
    heroText:
      "विश्वसनीय स्वास्थ्य जानकारी, प्राथमिक उपचार और नज़दीकी चिकित्सा सुविधाएँ एक ही जगह पाएँ।",
    ask: "💬 स्वास्थ्य सहायक से पूछें",
    firstaid: "🩹 प्राथमिक उपचार गाइड",
    healthcare: "सभी के लिए स्वास्थ्य सेवा",
    healthcareText: "ज़रूरत के समय स्वास्थ्य संबंधी जानकारी और सहायता।",
    available: "स्वास्थ्य संसाधन उपलब्ध",
    stat1: "स्वास्थ्य जानकारी",
    stat2: "उपलब्ध भाषाएँ",
    stat3: "आसान प्लेटफ़ॉर्म",
    eyebrow: "हमारी सेवाएँ",
    sectionTitle: "स्वास्थ्य सहायता अब और आसान।",
    sectionText: "शुरू करने के लिए एक सेवा चुनें।",
    card1: "AI स्वास्थ्य सहायक",
    card1text: "आसान भाषा में सामान्य स्वास्थ्य प्रश्न पूछें।",
    start: "शुरू करें →",
    card2: "प्राथमिक उपचार गाइड",
    card2text: "सामान्य आपात स्थितियों में प्राथमिक उपचार सीखें।",
    learn: "और जानें →",
    card3: "नज़दीकी अस्पताल खोजें",
    card3text: "अपने आसपास के अस्पताल और क्लिनिक खोजें।",
    find: "अस्पताल खोजें →",
    card4: "आपातकालीन सहायता",
    card4text: "आपातकालीन जानकारी जल्दी पाएँ।",
    gethelp: "सहायता पाएँ →",
    card5: "स्वास्थ्य ज्ञान",
    card5text: "स्वच्छता, पोषण और बचाव के बारे में जानें।",
    exploremore: "विषय देखें →",
    card6: "आवाज़ से सहायता",
    card6text: "सुविधा उपलब्ध होने पर बोलकर प्रश्न पूछें।",
    tryvoice: "आवाज़ आज़माएँ →",
    emergencyTitle: "चिकित्सा आपातकाल?",
    emergencyText:
      "ऑनलाइन जवाब का इंतज़ार न करें। आपातकालीन सेवा से संपर्क करें या नज़दीकी अस्पताल जाएँ।",
    emergencyBtn: "आपातकालीन जानकारी →",
    disclaimerTitle: "महत्वपूर्ण स्वास्थ्य सूचना",
    disclaimer:
      "यह वेबसाइट सामान्य शैक्षणिक स्वास्थ्य जानकारी देती है, चिकित्सा निदान नहीं। योग्य स्वास्थ्य विशेषज्ञ से सलाह लें। जानलेवा आपात स्थिति में तुरंत चिकित्सा सहायता लें।",
    footer: "हर समुदाय तक स्वास्थ्य जानकारी पहुँचाने का प्रयास।"
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    if (translations[currentLanguage][key]) {
      element.innerHTML = translations[currentLanguage][key];
    }
  });

  document.documentElement.lang = currentLanguage;
  languageButton.textContent =
    currentLanguage === "en" ? "हिंदी" : "English";

  languageButton.setAttribute(
    "aria-label",
    currentLanguage === "en"
      ? "Switch to Hindi"
      : "Switch to English"
  );
}

// --------------------------------------------
// 2. Language toggle
// --------------------------------------------

languageButton.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "hi" : "en";

  applyTranslations();

  // Refresh the currently open service in the selected language.
  if (!modalRoot.hidden && currentView) {
    openService(currentView);
  }

  showToast(
    currentLanguage === "hi"
      ? "भाषा हिंदी में बदल गई।"
      : "Language changed to English."
  );
});

// --------------------------------------------
// 3. Toast notification
// --------------------------------------------

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// --------------------------------------------
// 4. Modal controls
// --------------------------------------------

function openModal() {
  modalRoot.hidden = false;
  document.body.classList.add("modal-open");

  const modal = modalRoot.querySelector(".modal");

  if (modal) {
    modal.setAttribute("tabindex", "-1");
    modal.focus();
  }
}

function closeModal() {
  modalRoot.hidden = true;
  document.body.classList.remove("modal-open");
  currentView = null;

  if (recognition) {
    try {
      recognition.stop();
    } catch (error) {
      // Recognition may already be stopped.
    }
  }
}

closeModalButton.addEventListener("click", closeModal);

modalRoot.addEventListener("click", (event) => {
  if (event.target.dataset.close === "true") {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalRoot.hidden) {
    closeModal();
  }
});

// --------------------------------------------
// 5. Reusable modal heading
// --------------------------------------------

function modalHeader(title, subtitle = "") {
  return `
    <div class="modal-heading">
      <span class="modal-eyebrow">RURALHEALTH CONNECT AI</span>
      <h2 id="modalTitle">${escapeHTML(title)}</h2>
      ${
        subtitle
          ? `<p>${escapeHTML(subtitle)}</p>`
          : ""
      }
    </div>
  `;
}

// --------------------------------------------
// 6. AI Health Assistant interface
// --------------------------------------------

function renderAssistant() {
  const isHindi = currentLanguage === "hi";

  modalContent.innerHTML = `
    ${modalHeader(
      isHindi ? "AI स्वास्थ्य सहायक" : "AI Health Assistant",
      isHindi
        ? "सामान्य स्वास्थ्य प्रश्न पूछें।"
        : "Ask a general health question in simple language."
    )}

    <div class="assistant-notice">
      <span>🩺</span>
      <p>
        ${
          isHindi
            ? "यह सामान्य स्वास्थ्य जानकारी है, चिकित्सा निदान नहीं। आपातकाल में 112 पर कॉल करें।"
            : "General health information only, not a medical diagnosis. In an emergency in India, call 112."
        }
      </p>
    </div>

    <div
      id="chatMessages"
      class="chat-messages"
      role="log"
      aria-live="polite"
      aria-label="${isHindi ? "बातचीत" : "Conversation"}"
    >
      <div class="chat-message assistant-message">
        <div class="chat-avatar">💚</div>
        <div class="chat-bubble">
          ${
            isHindi
              ? "नमस्ते! मैं आपकी सामान्य स्वास्थ्य जानकारी में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?"
              : "Hello! I can help with general health information. What would you like to know?"
          }
        </div>
      </div>
    </div>

    <div class="quick-prompts">
      <button type="button" class="quick-prompt" data-question="How can I prevent dehydration?">
        💧 ${isHindi ? "पानी की कमी से बचाव" : "Prevent dehydration"}
      </button>

      <button type="button" class="quick-prompt" data-question="What should I do for a mild fever?">
        🌡️ ${isHindi ? "हल्का बुखार" : "Mild fever"}
      </button>

      <button type="button" class="quick-prompt" data-question="What should I do for a minor burn?">
        🩹 ${isHindi ? "हल्की जलन" : "Minor burn"}
      </button>
    </div>

    <form id="assistantForm" class="assistant-form">
      <label class="sr-only" for="questionInput">
        ${isHindi ? "अपना स्वास्थ्य प्रश्न लिखें" : "Enter your health question"}
      </label>

      <textarea
        id="questionInput"
        name="question"
        rows="2"
        maxlength="1000"
        required
        placeholder="${
          isHindi
            ? "अपना प्रश्न यहाँ लिखें..."
            : "Type your health question..."
        }"
      ></textarea>

      <div class="assistant-form-actions">
        <button type="button" id="voiceButton" class="btn btn-light">
          🎙️ ${isHindi ? "बोलें" : "Speak"}
        </button>

        <button type="submit" id="sendButton" class="btn btn-primary">
          ${isHindi ? "पूछें ↑" : "Ask ↑"}
        </button>
      </div>
    </form>

    <p class="assistant-footnote">
      ${
        isHindi
          ? "AI की जानकारी गलत या अधूरी हो सकती है। गंभीर लक्षणों में डॉक्टर से संपर्क करें।"
          : "AI information may be incomplete or incorrect. Consult a healthcare professional for medical concerns."
      }
    </p>
  `;

  const form = document.getElementById("assistantForm");
  const questionInput = document.getElementById("questionInput");
  const voiceButton = document.getElementById("voiceButton");

  form.addEventListener("submit", handleAssistantSubmit);

  modalContent.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => {
      questionInput.value = button.dataset.question;
      questionInput.focus();
    });
  });

  voiceButton.addEventListener("click", startVoiceInput);

  setTimeout(() => questionInput.focus(), 50);
}

// Add a message to the conversation.
function addChatMessage(message, sender) {
  const chatMessages = document.getElementById("chatMessages");

  if (!chatMessages) return null;

  const messageElement = document.createElement("div");
  messageElement.className =
    sender === "user"
      ? "chat-message user-message"
      : "chat-message assistant-message";

  const avatar = document.createElement("div");
  avatar.className = "chat-avatar";
  avatar.textContent = sender === "user" ? "🙂" : "💚";

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";

  // textContent prevents model responses from being interpreted as HTML.
  bubble.textContent = message;

  messageElement.append(avatar, bubble);
  chatMessages.appendChild(messageElement);

  chatMessages.scrollTop = chatMessages.scrollHeight;

  return messageElement;
}

// Send the question to the existing Express backend.
async function handleAssistantSubmit(event) {
  event.preventDefault();

  const questionInput = document.getElementById("questionInput");
  const sendButton = document.getElementById("sendButton");

  if (!questionInput || !sendButton) return;

  const question = questionInput.value.trim();

  if (!question) {
    showToast(
      currentLanguage === "hi"
        ? "कृपया अपना प्रश्न लिखें।"
        : "Please enter your question."
    );
    return;
  }

  if (question.length > 1000) {
    showToast(
      currentLanguage === "hi"
        ? "प्रश्न 1000 अक्षरों से छोटा रखें।"
        : "Please keep your question under 1000 characters."
    );
    return;
  }

  addChatMessage(question, "user");

  questionInput.value = "";
  questionInput.disabled = true;
  sendButton.disabled = true;

  const loadingMessage = addChatMessage(
    currentLanguage === "hi"
      ? "आपके प्रश्न का उत्तर तैयार हो रहा है..."
      : "Preparing your answer...",
    "assistant"
  );

  if (loadingMessage) {
    loadingMessage.classList.add("loading-message");
  }

  try {
    const response = await fetch("/api/ai-health-assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: question,
        language: currentLanguage
      })
    });

    const data = await response.json();

    if (loadingMessage) {
      loadingMessage.remove();
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          (currentLanguage === "hi"
            ? "उत्तर प्राप्त नहीं हो सका।"
            : "The assistant could not answer your question.")
      );
    }

    addChatMessage(data.answer, "assistant");

    if (data.emergency) {
      showToast(
        currentLanguage === "hi"
          ? "आपातकालीन सहायता लें।"
          : "Please seek emergency assistance."
      );
    }
  } catch (error) {
    console.error("Health assistant request failed:", error);

    if (loadingMessage) {
      loadingMessage.remove();
    }

    addChatMessage(
      currentLanguage === "hi"
        ? `माफ़ कीजिए, उत्तर प्राप्त नहीं हो सका। ${error.message || "कृपया सर्वर जाँचें और दोबारा कोशिश करें।"}`
        : `Sorry, the answer could not be retrieved. ${error.message || "Please check the server and try again."}`,
      "assistant"
    );
  } finally {
    const updatedInput = document.getElementById("questionInput");
    const updatedButton = document.getElementById("sendButton");

    if (updatedInput) {
      updatedInput.disabled = false;
      updatedInput.focus();
    }

    if (updatedButton) {
      updatedButton.disabled = false;
    }
  }
}

// --------------------------------------------
// 7. Voice input
// --------------------------------------------

function startVoiceInput() {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    showToast(
      currentLanguage === "hi"
        ? "आपका ब्राउज़र वॉइस इनपुट को सपोर्ट नहीं करता। कृपया टाइप करें।"
        : "Voice input is not supported in this browser. Please type your question."
    );
    return;
  }

  if (recognition) {
    try {
      recognition.stop();
    } catch (error) {
      // Continue creating a new recognition instance.
    }
  }

  recognition = new SpeechRecognition();
  recognition.lang = currentLanguage === "hi" ? "hi-IN" : "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  const voiceButton = document.getElementById("voiceButton");

  if (voiceButton) {
    voiceButton.disabled = true;
    voiceButton.textContent =
      currentLanguage === "hi"
        ? "🎙️ सुन रहा हूँ..."
        : "🎙️ Listening...";
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const questionInput = document.getElementById("questionInput");

    if (questionInput) {
      questionInput.value = transcript;
      questionInput.focus();
    }
  };

  recognition.onerror = (event) => {
    console.error("Voice input error:", event.error);

    showToast(
      currentLanguage === "hi"
        ? "आवाज़ पहचानने में समस्या हुई। कृपया टाइप करें।"
        : "Could not recognize your voice. Please type your question."
    );
  };

  recognition.onend = () => {
    if (voiceButton) {
      voiceButton.disabled = false;
      voiceButton.textContent =
        currentLanguage === "hi" ? "🎙️ बोलें" : "🎙️ Speak";
    }
  };

  try {
    recognition.start();
  } catch (error) {
    console.error("Could not start voice recognition:", error);
    showToast(
      currentLanguage === "hi"
        ? "वॉइस इनपुट शुरू नहीं हो सका।"
        : "Could not start voice input."
    );

    if (voiceButton) {
      voiceButton.disabled = false;
    }
  }
}

// --------------------------------------------
// 8. First Aid Guide
// --------------------------------------------

function renderFirstAid() {
  const isHindi = currentLanguage === "hi";

  modalContent.innerHTML = `
    ${modalHeader(
      isHindi ? "प्राथमिक उपचार गाइड" : "First Aid Guide",
      isHindi
        ? "सामान्य स्थितियों में बुनियादी प्राथमिक सहायता।"
        : "Basic first-aid guidance for common situations."
    )}

    <div class="info-list">

      <article class="info-card">
        <h3>🌡️ ${isHindi ? "बुखार" : "Fever"}</h3>
        <p>${
          isHindi
            ? "आराम करें, पानी पिएँ और तापमान पर नज़र रखें। बुखार लगातार बना रहे या हालत बिगड़े तो स्वास्थ्य विशेषज्ञ से संपर्क करें।"
            : "Rest, drink fluids and monitor your temperature. Seek medical advice if the fever persists or your condition worsens."
        }</p>
      </article>

      <article class="info-card">
        <h3>🩹 ${isHindi ? "हल्की जलन" : "Minor burn"}</h3>
        <p>${
          isHindi
            ? "जले हुए हिस्से को 20 मिनट तक ठंडे बहते पानी के नीचे रखें। बर्फ, टूथपेस्ट या मक्खन न लगाएँ। गंभीर जलन में तुरंत चिकित्सा सहायता लें।"
            : "Cool the burn under cool running water for 20 minutes. Do not use ice, toothpaste or butter. Seek medical help for serious burns."
        }</p>
      </article>

      <article class="info-card">
        <h3>💧 ${isHindi ? "पानी की कमी" : "Dehydration"}</h3>
        <p>${
          isHindi
            ? "थोड़ा-थोड़ा पानी पिएँ। उल्टी या दस्त में ORS मदद कर सकता है। बेहोशी, भ्रम या पानी न पी पाने पर तुरंत चिकित्सा सहायता लें।"
            : "Drink small, frequent amounts of fluid. ORS may help with vomiting or diarrhea. Seek urgent care for fainting, confusion or inability to drink."
        }</p>
      </article>

      <article class="info-card">
        <h3>🩸 ${isHindi ? "खून बहना" : "Bleeding"}</h3>
        <p>${
          isHindi
            ? "घाव पर साफ कपड़े से लगातार सीधा दबाव दें। बहुत अधिक रक्तस्राव होने पर आपातकालीन सहायता लें।"
            : "Apply firm, continuous pressure with a clean cloth. Seek emergency assistance for severe bleeding."
        }</p>
      </article>

      <article class="info-card emergency-info">
        <h3>🚨 ${isHindi ? "आपातकाल" : "Emergency"}</h3>
        <p>${
          isHindi
            ? "साँस लेने में कठिनाई, बेहोशी या गंभीर सीने के दर्द में ऑनलाइन जवाब का इंतज़ार न करें। भारत में 112 पर कॉल करें।"
            : "For difficulty breathing, unconsciousness or severe chest pain, do not wait for an online response. Call 112 in India."
        }</p>
      </article>

    </div>

    <p class="assistant-footnote">
      ${
        isHindi
          ? "यह सामान्य जानकारी है और पेशेवर चिकित्सा सहायता का विकल्प नहीं है।"
          : "This is general information and is not a substitute for professional medical care."
      }
    </p>
  `;
}

// --------------------------------------------
// 9. Nearby hospitals
// --------------------------------------------

function renderHospitals() {
  const isHindi = currentLanguage === "hi";

  modalContent.innerHTML = `
    ${modalHeader(
      isHindi ? "नज़दीकी अस्पताल खोजें" : "Find Nearby Hospitals",
      isHindi
        ? "अपने आसपास अस्पताल और क्लिनिक खोजें।"
        : "Search for hospitals and clinics near you."
    )}

    <div class="info-card">
      <h3>📍 ${isHindi ? "अपना स्थान उपयोग करें" : "Use your location"}</h3>

      <p>${
        isHindi
          ? "आपकी अनुमति मिलने पर आपका ब्राउज़र स्थान खोजने में मदद कर सकता है। स्थान साझा करना वैकल्पिक है।"
          : "With your permission, your browser can help find your location. Sharing your location is optional."
      }</p>

      <button id="locationSearchButton" class="btn btn-primary">
        ${
          isHindi
            ? "📍 नज़दीकी अस्पताल खोजें"
            : "📍 Find hospitals near me"
        }
      </button>

      <p id="locationStatus" role="status"></p>
    </div>

    <div class="info-card">
      <h3>🔎 ${isHindi ? "स्थान या शहर से खोजें" : "Search by town or city"}</h3>

      <form id="hospitalSearchForm">
        <label for="hospitalLocation">
          ${isHindi ? "शहर या स्थान" : "City or location"}
        </label>

        <input
          id="hospitalLocation"
          type="text"
          maxlength="100"
          required
          placeholder="${
            isHindi
              ? "उदाहरण: ग्वालियर"
              : "Example: Gwalior"
          }"
        >

        <button type="submit" class="btn btn-primary">
          ${isHindi ? "खोजें" : "Search"}
        </button>
      </form>
    </div>

    <p class="assistant-footnote">
      ${
        isHindi
          ? "यह खोज बाहरी मैप सेवा खोलेगी। आपातकाल में 112 पर कॉल करें।"
          : "Search opens an external maps service. For emergencies in India, call 112."
      }
    </p>
  `;

  document
    .getElementById("hospitalSearchForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const location = document
        .getElementById("hospitalLocation")
        .value.trim();

      if (location) {
        openHospitalSearch(location);
      }
    });

  document
    .getElementById("locationSearchButton")
    .addEventListener("click", searchNearbyHospitals);
}

function openHospitalSearch(location) {
  const query = encodeURIComponent(`hospitals near ${location}`);

  window.open(
    `https://www.google.com/maps/search/?api=1&query=${query}`,
    "_blank",
    "noopener,noreferrer"
  );
}

function searchNearbyHospitals() {
  const status = document.getElementById("locationStatus");

  if (!navigator.geolocation) {
    status.textContent =
      currentLanguage === "hi"
        ? "आपका ब्राउज़र स्थान सुविधा को सपोर्ट नहीं करता। शहर का नाम डालकर खोजें।"
        : "Your browser does not support location. Search by entering a city instead.";

    return;
  }

  status.textContent =
    currentLanguage === "hi"
      ? "स्थान प्राप्त किया जा रहा है..."
      : "Getting your location...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const query = encodeURIComponent(
        `hospitals near ${latitude},${longitude}`
      );

      window.open(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
        "_blank",
        "noopener,noreferrer"
      );

      status.textContent =
        currentLanguage === "hi"
          ? "मैप में नज़दीकी अस्पताल खोले गए।"
          : "Nearby hospitals opened in Maps.";
    },
    (error) => {
      console.error("Location error:", error);

      status.textContent =
        currentLanguage === "hi"
          ? "स्थान प्राप्त नहीं हो सका। कृपया शहर का नाम डालकर खोजें।"
          : "Could not get your location. Please search by city instead.";
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

// --------------------------------------------
// 10. Emergency help
// --------------------------------------------

function renderEmergency() {
  const isHindi = currentLanguage === "hi";

  modalContent.innerHTML = `
    ${modalHeader(
      isHindi ? "आपातकालीन सहायता" : "Emergency Help",
      isHindi
        ? "गंभीर लक्षणों में तुरंत सहायता लें।"
        : "Seek immediate assistance for serious symptoms."
    )}

    <div class="emergency-panel">
      <div class="emergency-symbol">🚨</div>

      <h3>
        ${isHindi ? "भारत की आपातकालीन सेवा" : "Emergency services in India"}
      </h3>

      <p>
        ${
          isHindi
            ? "साँस लेने में कठिनाई, बेहोशी, गंभीर रक्तस्राव या सीने में तेज दर्द होने पर ऑनलाइन जवाब का इंतज़ार न करें।"
            : "For difficulty breathing, unconsciousness, severe bleeding or serious chest pain, do not wait for an online response."
        }
      </p>

      <a class="btn btn-primary emergency-call" href="tel:112">
        📞 ${isHindi ? "112 पर कॉल करें" : "Call 112"}
      </a>

      <p class="assistant-footnote">
        ${
          isHindi
            ? "यदि कॉल नहीं हो पा रही है, तो नज़दीकी आपातकालीन विभाग में तुरंत जाएँ या आसपास के व्यक्ति से मदद लें।"
            : "If you cannot place a call, go to the nearest emergency department or ask someone nearby for help."
        }
      </p>
    </div>
  `;
}

// --------------------------------------------
// 11. Health knowledge library
// --------------------------------------------

function renderLibrary() {
  const isHindi = currentLanguage === "hi";

  const topics = isHindi
    ? [
        {
          icon: "🧼",
          title: "स्वच्छता",
          text: "खाने से पहले और शौचालय के बाद साबुन से हाथ धोएँ। साफ पानी और सुरक्षित भोजन का उपयोग करें।"
        },
        {
          icon: "🥗",
          title: "पोषण",
          text: "संतुलित आहार में सब्जियाँ, फल, अनाज, दालें और उपलब्ध प्रोटीन स्रोत शामिल करें।"
        },
        {
          icon: "💧",
          title: "सुरक्षित पानी",
          text: "सुरक्षित पेयजल का उपयोग करें और पानी को साफ-सुथरे, ढके हुए बर्तन में रखें।"
        },
        {
          icon: "💉",
          title: "रोकथाम और टीकाकरण",
          text: "योग्य स्वास्थ्यकर्मी से अपने और अपने परिवार के लिए उपयुक्त टीकाकरण तथा नियमित जाँच के बारे में पूछें।"
        }
      ]
    : [
        {
          icon: "🧼",
          title: "Hygiene",
          text: "Wash your hands with soap before eating and after using the toilet. Use safe water and handle food hygienically."
        },
        {
          icon: "🥗",
          title: "Nutrition",
          text: "Aim for a balanced diet that includes vegetables, fruits, grains, pulses and available sources of protein."
        },
        {
          icon: "💧",
          title: "Safe Water",
          text: "Use safe drinking water and store it in a clean, covered container."
        },
        {
          icon: "💉",
          title: "Prevention and Vaccination",
          text: "Ask a qualified healthcare worker about recommended vaccinations and routine health checks for your family."
        }
      ];

  modalContent.innerHTML = `
    ${modalHeader(
      isHindi ? "स्वास्थ्य ज्ञान" : "Health Knowledge",
      isHindi
        ? "रोज़मर्रा की सेहत के लिए उपयोगी सुझाव।"
        : "Practical tips for everyday health."
    )}

    <div class="info-list">
      ${topics
        .map(
          (topic) => `
            <article class="info-card">
              <h3>${topic.icon} ${escapeHTML(topic.title)}</h3>
              <p>${escapeHTML(topic.text)}</p>
            </article>
          `
        )
        .join("")}
    </div>

    <p class="assistant-footnote">
      ${
        isHindi
          ? "ये सामान्य स्वास्थ्य सुझाव हैं। अपनी व्यक्तिगत स्वास्थ्य स्थिति के लिए विशेषज्ञ से सलाह लें।"
          : "These are general health tips. Consult a professional about your individual health needs."
      }
    </p>
  `;
}

// --------------------------------------------
// 12. Voice assistance screen
// --------------------------------------------

function renderVoice() {
  const isHindi = currentLanguage === "hi";

  modalContent.innerHTML = `
    ${modalHeader(
      isHindi ? "आवाज़ से सहायता" : "Voice Assistance",
      isHindi
        ? "बोलकर अपना सामान्य स्वास्थ्य प्रश्न पूछें।"
        : "Ask a general health question using your voice."
    )}

    <div class="info-card voice-panel">
      <div class="voice-icon">🎙️</div>

      <h3>
        ${
          isHindi
            ? "अपनी आवाज़ में प्रश्न पूछें"
            : "Ask in your own voice"
        }
      </h3>

      <p>
        ${
          isHindi
            ? "माइक्रोफ़ोन बटन दबाएँ और अपने प्रश्न बोलें। इसके लिए ब्राउज़र की अनुमति ज़रूरी हो सकती है।"
            : "Press the microphone button and speak your question. Your browser may ask for microphone permission."
        }
      </p>

      <button id="openVoiceAssistant" class="btn btn-primary">
        🎙️ ${
          isHindi
            ? "वॉइस सहायक खोलें"
            : "Open Voice Assistant"
        }
      </button>
    </div>

    <p class="assistant-footnote">
      ${
        isHindi
          ? "वॉइस इनपुट की उपलब्धता आपके ब्राउज़र और डिवाइस पर निर्भर करती है।"
          : "Voice input availability depends on your browser and device."
      }
    </p>
  `;

  document
    .getElementById("openVoiceAssistant")
    .addEventListener("click", () => {
      openService("assistant");
      setTimeout(startVoiceInput, 200);
    });
}

// --------------------------------------------
// 13. Open a selected service
// --------------------------------------------

function openService(service) {
  currentView = service;
  openModal();

  switch (service) {
    case "assistant":
      renderAssistant();
      break;

    case "firstaid":
      renderFirstAid();
      break;

    case "hospital":
      renderHospitals();
      break;

    case "emergency":
      renderEmergency();
      break;

    case "library":
      renderLibrary();
      break;

    case "voice":
      renderVoice();
      break;

    default:
      modalContent.innerHTML = modalHeader(
        "RuralHealth Connect AI",
        "Please select one of the available services."
      );
  }
}

// --------------------------------------------
// 14. Connect all buttons with data-open
// --------------------------------------------

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    openService(button.dataset.open);
  });
});

// --------------------------------------------
// 15. Initial setup
// --------------------------------------------

applyTranslations();

console.log("RuralHealth Connect AI frontend loaded.");