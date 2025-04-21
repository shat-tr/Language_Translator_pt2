// script-file.js

document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("fileInput");
  const targetLanguage = document.getElementById("targetLanguage");
  const translateButton = document.getElementById("translateManualTextButton");
  const speakButton = document.getElementById("speakFileTextButton");
  const translatedOutput = document.querySelector("pre");
  speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
    };
    
  // Function to translate text using MyMemory API
  async function translateText(text, language) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${language}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.responseData.translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return "Translation failed.";
    }
  }

  // Event listener for translate button
  translateButton.addEventListener("click", function () {
    const file = fileInput.files[0];
    if (!file) {
      translatedOutput.textContent = "Please upload an image file.";
      return;
    }

    translatedOutput.textContent = "Processing image...";

    Tesseract.recognize(
      file,
      "eng",
      {
        logger: (m) => console.log(m),
      }
    )
      .then(async ({ data: { text } }) => {
        if (!text.trim()) {
          translatedOutput.textContent = "No text detected in image.";
          return;
        }
        const translated = await translateText(text.trim(), targetLanguage.value);
        translatedOutput.textContent = translated;
      })
      .catch((error) => {
        console.error("OCR error:", error);
        translatedOutput.textContent = "Error in text detection.";
      });
  });

  // Event listener for speak button
speakButton.addEventListener("click", () => {
  const text = translatedOutput.textContent.trim();
  const langCode = targetLanguage.value;

  if (!text || text === "Image translation will appear here..." || text === "Please upload an image file.") {
    alert("No translated text to speak!");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  const allVoices = window.speechSynthesis.getVoices();
  const exactVoice = allVoices.find(v => v.lang === langCode || v.lang.startsWith(langCode + "-"));
  const fallbackVoice = allVoices.find(v => v.lang.startsWith(langCode));
  const defaultVoice = allVoices.find(v => v.default) || allVoices[0];

  utterance.voice = exactVoice || fallbackVoice || defaultVoice;
  utterance.lang = utterance.voice.lang;

  window.speechSynthesis.cancel(); // Stop current speech
  window.speechSynthesis.speak(utterance);
});      
});
