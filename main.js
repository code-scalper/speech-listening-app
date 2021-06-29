// modules
import { phrases, VOICE_TYPE } from "./phrases.js";

// DOM
// buttons
const checkButton = document.querySelector(".check-button");
const typeButton = document.querySelector(".type-button");
const startButton = document.querySelector(".start-button");
const modeButton = document.querySelector(".mode-button");

// input
const wordInput = document.querySelector(".input-box input");

// text
const displayText = document.querySelector(".display-text");
const stateText = document.querySelector(".state-text");

// wrapper
const resultList = document.querySelector(".result");

// speech APIs
const {
  speechSynthesis,
  SpeechRecognition,
  webkitSpeechRecognition,
  SpeechGrammarList,
  webkitSpeechGrammarList,
  SpeechRecognitionEvent,
  webkitSpeechRecognitionEvent,
} = window;
const speechRecognition = SpeechRecognition || webkitSpeechRecognition;
const speechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
const speechRecognitionEvent =
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
const speechContent = speechSynthesis;

// variables
let score = 0;
let isPlaying = false;
let voices = [];
let gamePhrases = [];
let currentPhrase = "";
let voiceType = "native";
let mode = "listening";
let isPaused = false;

// functions
function init() {
  stateText.innerText = `Ready with ${phrases.length} phrases`;
  gamePhrases = [...phrases];
  const voicesCaller = speechContent.getVoices();
  speechContent.onvoiceschanged = populateVoiceList;
  speechContent.cancel();
}

function playGame() {
  if (gamePhrases.length === 0) {
    gameOver();
    return;
  }
  if (isPlaying) {
    displayText.innerText = "Paused!";
    speechContent.pause();
    isPlaying = false;
    return;
  }
  if (speechContent.speaking) {
    displayText.innerText = "Listening...";
    speechContent.resume();
    isPlaying = true;
    return;
  }

  currentPhrase = gamePhrases[0];
  speak(currentPhrase.eng);
  gamePhrases.shift();
}

function gameOver() {
  resultText.innerText = "Press Start!";

  isPlaying = false;
  gamePhrases = [...phrases];
}

function populateVoiceList() {
  voices = speechContent.getVoices().sort(function (a, b) {
    const aname = a.name.toUpperCase(),
      bname = b.name.toUpperCase();
    return aname < bname ? 1 : -1;
  });
  voices = voices.filter((sound) => VOICE_TYPE[voiceType].includes(sound.lang));
  typeButton.innerText = voiceType.toUpperCase();
  voiceType = voiceType === "native" ? "esl" : "native";
}

function genRandomIndex(target) {
  const index = Math.floor(Math.random() * target.length);
  return index;
}

function toggleStartButton() {
  startButton.classList.toggle("waiting");
  startButton.classList.toggle("speaking");
}

function speak(text) {
  // random voice
  const selectedVoice = voices[genRandomIndex(voices)];
  const speech = new SpeechSynthesisUtterance(text);

  // speech setting
  speech.onstart = function (event) {
    isPlaying = true;
    toggleStartButton();
  };
  speech.onpause = function (event) {
    toggleStartButton();
  };
  speech.onend = function (event) {
    isPlaying = false;
    displayText.innerText = "Type...";
    wordInput.focus();
    toggleStartButton();
  };
  speech.onerror = function (event) {
    console.error(event);
  };
  speech.voice = selectedVoice;
  speech.pitch = 1;
  speech.rate = 1;
  speech.lang = selectedVoice.lang;

  speechContent.speak(speech);
}

function checkAnswer() {
  const currWord = currentPhrase.eng;
  const typedWord = wordInput.value;
  const targetLength =
    currWord.length > typedWord.length ? currWord.length : typedWord.length;
  let resultWord = "";
  let i = 0;
  while (i < targetLength) {
    let letter = currWord.charAt(i);
    if (
      currWord.charAt(i).toUpperCase() !== typedWord.charAt(i).toUpperCase()
    ) {
      letter = `<span class='error'>${
        typedWord.charAt(i) || currWord.charAt(i)
      }</span>`;
    } else {
    }
    resultWord = resultWord + letter;
    i++;
  }

  const li = document.createElement("li");
  li.innerHTML = `<span>${currWord}</span><span>${resultWord}</span>`;
  resultList.appendChild(li);
  resultList.scroll({
    top: resultList.scrollHeight,
    behavior: "smooth",
  });
  wordInput.value = "";
  playGame();
}

// event listeners
checkButton.addEventListener("click", () => checkAnswer());
wordInput.addEventListener("keypress", (e) => {
  if (e.keyCode !== 13) return;
  checkAnswer();
});
typeButton.addEventListener("click", () => populateVoiceList());
startButton.addEventListener("click", () => playGame());
modeButton.addEventListener("click", () => {});

// initial call
init();
