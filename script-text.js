document.addEventListener("DOMContentLoaded", function () {
  const manualText = document.getElementById("manualText");
  const targetLanguage = document.getElementById("targetLanguage");
  const translateButton = document.getElementById("translateButton");
  const translatedText = document.getElementById("translatedText");
  const speechToTextButton = document.getElementById("speechToTextButton");
  const speakButton = document.getElementById("speakTranslatedTextButton");
  const inputLanguage = document.getElementById("inputLanguage");

  // Load available voices once
  let voices = [];
  speechSynthesis.onvoiceschanged = () => {
    voices = speechSynthesis.getVoices();
  };

  // Function to translate text using MyMemory API
  async function translateText(text, sourceLang, targetLang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.responseData.translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return "Translation failed.";
    }
  }

  // Translate button handler
  translateButton.addEventListener("click", async function () {
    const text = manualText.value.trim();
    const sourceLang = inputLanguage.value.split("-")[0]; // e.g., "hi-IN" → "hi"
    const targetLang = targetLanguage.value;

    if (text) {
      const translated = await translateText(text, sourceLang, targetLang);
      translatedText.textContent = translated;
    } else {
      translatedText.textContent = "Please enter text to translate.";
    }
  });

  // Speech-to-text button
  speechToTextButton.addEventListener("click", function () {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = inputLanguage.value || "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      manualText.value = spokenText;
    };

    recognition.onerror = (event) => {
      alert("Speech recognition error: " + event.error);
    };

    recognition.start();
  });

  // Speak translated text
  speakButton.addEventListener("click", () => {
      const text = translatedText.textContent.trim();
      const langCode = targetLanguage.value;
    
      if (!text || text === "Translated text will appear here...") {
        alert("No translated text to speak!");
        return;
      }
    
      const utterance = new SpeechSynthesisUtterance(text);
    
      // Get all voices
      const allVoices = window.speechSynthesis.getVoices();
    
      // Priority voice selection: exact match > regional match > fallback
      const exactVoice = allVoices.find(v => v.lang === langCode || v.lang.startsWith(langCode + "-"));
      const fallbackVoice = allVoices.find(v => v.lang.startsWith(langCode));
      const defaultVoice = allVoices.find(v => v.default) || allVoices[0];
    
      utterance.voice = exactVoice || fallbackVoice || defaultVoice;
      utterance.lang = utterance.voice.lang;
    
      window.speechSynthesis.cancel(); // Stop any current speech
      window.speechSynthesis.speak(utterance);
    });
    
});
