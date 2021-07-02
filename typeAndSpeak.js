// DOM
const speakButton = document.querySelector(".speak-button");
const wordInput = document.querySelector(".word-input");
const voiceSelect = document.querySelector(".voice-select");
const resultText = document.querySelector(".result-text");

// Speech API
const speechContent = window.speechSynthesis;

// Variable
let voices = [];

function init() {
  speechContent.onvoiceschanged = setVoices;
}

function setVoices() {
  voices = speechContent.getVoices().sort((a, b) => {
    return a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1;
  });

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.textContent = voice.name;
    voiceSelect.appendChild(option);
  });
}

function makeSpeaking() {
  console.log("clicked!");
  speechContent.cancel();
  const selectedVoice = voices[voiceSelect.selectedIndex];
  const text = wordInput.value;
  if (!text || text.trim().length < 1) return;

  const speech = new SpeechSynthesisUtterance(text);

  // speech callback
  speech.onstart = function (event) {
    console.log(event, "start!");
  };
  speech.onend = function (event) {
    addResult(text);
    wordInput.value = "";
    console.log(event, "end!");
  };
  speech.onerror = function (event) {
    console.log(event, "error!");
  };

  // speech setting
  speech.voice = selectedVoice;
  speech.pitch = 1;
  speech.rate = 1;
  speechContent.speak(speech);
}

function addResult(text) {
  const p = document.createElement("p");
  p.textContent = text;
  resultText.appendChild(p);
  resultText.scroll({ top: resultText.scrollHeight, behavior: "smooth" });
}

// Event
speakButton.addEventListener("click", () => makeSpeaking());
wordInput.addEventListener("keypress", (e) => {
  if (e.keyCode === 13) {
    makeSpeaking();
  }
});

init();
