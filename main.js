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
const voiceSelect = document.querySelector(".voice-select");

// text
const displayText = document.querySelector(".display-text");
const stateText = document.querySelector(".state-text");

// wrapper
const content = document.querySelector(".contents");
const resultList = document.querySelector(".result");

// speech APIs
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
const speechContent = speechSynthesis;

// variables
const MODES = ["listening", "speech", "typing"];
let score = 0;
let isPlaying = false;
let voices = [];
let gamePhrases = [];
let currentPhrase = "";
let voiceType = "native";
let modeIndex = 0;
let isPaused = false;

// functions
function init() {
  gamePhrases = [...phrases];
  const voicesCaller = speechContent.getVoices();
  speechContent.onvoiceschanged = populateVoiceList;
  speechContent.cancel();
}

function playGame() {
  switch (MODES[modeIndex]) {
    case "listening":
      game1();
      break;
    case "speech":
      game2();
      break;
    case "typing":
      game3();
      break;
    default:
      game1();
  }
}

function game1() {
  stateText.innerText = `You have ${gamePhrases.length} phrases left!`;
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

function game2() {
  stateText.innerText = `0%`;
  const phrase = genRandomIndex(phrases);
  const engPhrase = phrase.eng.toLowerCase();
  displayText.innerText = phrase.eng;
  displayText.innerText = phrase.eng;
  const grammar = "#JSGF V1.0; grammar phrase; public <phrase> = " + "go" + ";";
  const recognition = new SpeechRecognition();
  const speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  recognition.onresult = function (event) {
    console.log(event, "event");
    const { transcript, confidence } = event.results[0][0];
    const speechResult = transcript.toLowerCase();
    generateLi(phrase.eng, speechResult);

    const matched = phrase.eng.split("").reduce((acc, cur, index) => {
      if (cur.toLowerCase() === speechResult.charAt(index).toLowerCase()) {
        return acc + 1;
      }
    }, 0);
    console.log(matched);

    console.log("Confidence: " + confidence);
  };

  recognition.onspeechend = function () {
    recognition.stop();
  };

  recognition.onerror = function (event) {
    console.log(event.error);
  };
}

function game3() {
  if (wordInput.value.trim() === "") wordInput.value = "텍스트를 입력하세요!";
  speak(wordInput.value, false);
  const li = document.createElement("li");
  li.innerHTML = `<span><span class='ready'>${wordInput.value}</span> (${
    getSelectedVoice().name
  })</span>`;
  resultList.appendChild(li);
  resultList.scroll({
    top: resultList.scrollHeight,
    behavior: "smooth",
  });
  wordInput.value = "";
}

function gameOver() {
  displayText.innerText = "Press Start!";
  gamePhrases = [...phrases];
}

function populateVoiceList() {
  voices = speechContent.getVoices().sort(function (a, b) {
    const aname = a.name.toUpperCase(),
      bname = b.name.toUpperCase();
    return aname < bname ? 1 : -1;
  });
  voices = voices.filter((sound) => VOICE_TYPE[voiceType].includes(sound.lang));

  const selectedIndex =
    voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = "";
  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.textContent = voice.name;
    option.setAttribute("data-lang", voice.lang);
    option.setAttribute("data-name", voice.name);
    voiceSelect.appendChild(option);
  });
  voiceSelect.selectedIndex = selectedIndex;

  typeButton.innerText = voiceType.toUpperCase();
  voiceType = voiceType === "native" ? "esl" : "native";
}

function genRandomIndex(target) {
  const index = Math.floor(Math.random() * target.length);
  return target[index];
}

function toggleStartButton() {
  startButton.classList.toggle("waiting");
  startButton.classList.toggle("speaking");
}
function getSelectedVoice() {
  console.log(voices[voiceSelect.selectedIndex]);
  return voices[voiceSelect.selectedIndex || 0];
}

function speak(text, random = true) {
  // random voice
  const selectedVoice = random ? genRandomIndex(voices) : getSelectedVoice();
  const speech = new SpeechSynthesisUtterance(text);

  // speech setting
  speech.onstart = function (event) {
    displayText.innerText = "Listening...";
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

function generateLi(currWord, typedWord = null) {
  if (!typedWord) typedWord = wordInput.value;
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
}

function checkAnswer(e) {
  if (MODES[modeIndex] === "typing") {
    if (e && e.keyCode !== 13) return;
    game3();
    return;
  }
  if (
    speechContent.speaking ||
    (e && e.keyCode !== 13) ||
    wordInput.value.trim() === "" ||
    !currentPhrase.eng
  ) {
    wordInput.focus();
    return;
  }
  generateLi(currentPhrase.eng);

  playGame();
}

function changeMode() {
  const currentMode = MODES[modeIndex++];
  if (modeIndex === MODES.length) modeIndex = 0;
  const mode = MODES[modeIndex];
  content.classList.remove(currentMode);
  content.classList.add(mode);
  modeButton.innerText = `${mode} Mode`;
  resultList.innerHTML = "";
  wordInput.value = "";
  if (mode === "typing") {
    voiceSelect.style.display = "block";
  } else {
    voiceSelect.style.display = "none";
  }
}

// event listeners
checkButton.addEventListener("click", () => checkAnswer());
wordInput.addEventListener("keypress", (e) => checkAnswer(e));
typeButton.addEventListener("click", () => populateVoiceList());
startButton.addEventListener("click", () => playGame());
modeButton.addEventListener("click", () => changeMode());
voiceSelect.addEventListener("change", () => {
  console.log(voices[voiceSelect.selectedIndex], voiceSelect.selectedIndex);
});
// initial call
init();
