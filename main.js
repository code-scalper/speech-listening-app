// DOM
const checkButton = document.querySelector(".check-button");
const saveButton = document.querySelector(".save-button");
const typeButton = document.querySelector(".type-button");
const startButton = document.querySelector(".start-button");
const answerInput = document.querySelector(".answer-input");
const wordInput = document.querySelector(".word-input");
const resultText = document.querySelector(".result-text");
const stateText = document.querySelector(".state-text");
const studyInfoTotal = document.querySelector(".total");
const studyInfoCorrect = document.querySelector(".correct");
const historyContainer = document.querySelector(".result");
const historyList = document.querySelector(".result > ul");

// Variables
import { phrases, VOICE_TYPE } from "./phrases.js";
const synth = window.speechSynthesis;
let score = 0;
let isPlaying = false;
let voices = [];
let gamePhrases = [];
let currentPhrase = "";
let voiceType = "native";

// functions
function init() {
  stateText.innerText = `Ready with ${phrases.length} phrases`;
  gamePhrases = [...phrases];
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoiceList;
  }
}

function playGame() {
  if (gamePhrases.length === 0) {
    gameOver();
    return;
  }
  currentPhrase = gamePhrases[0];
  gamePhrases.shift();
  speak(currentPhrase.eng);
}

function gameOver() {
  resultText.innerText = "Press Start!";
  setIcon("bi-pause-fill", "bi-play-fill", "remove", "error");
  isPlaying = false;
  gamePhrases = [...phrases];
}

function setVoices(type) {
  return voices.filter((sound) => VOICE_TYPE[type].includes(sound.lang));
}

function populateVoiceList() {
  voices = synth.getVoices().sort(function (a, b) {
    const aname = a.name.toUpperCase(),
      bname = b.name.toUpperCase();
    return aname < bname ? 1 : -1;
  });
  voices = setVoices(voiceType);
}

function genRandomVoiceIndex() {
  const index = Math.floor(Math.random() * voices.length);
  return index;
}

function speak(text) {
  resultText.innerText = "Listening...";
  const selectedVoice = voices[genRandomVoiceIndex()];

  if (synth.speaking) {
    console.error("speechSynthesis.speaking");
    return;
  }
  if (text !== "") {
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.onend = function (event) {
      resultText.innerText = "Type...";
      answerInput.focus();
    };
    utterThis.onerror = function (event) {
      console.error("SpeechSynthesisUtterance.onerror");
    };
    utterThis.voice = selectedVoice;
    utterThis.pitch = 1;
    utterThis.rate = 1;
    synth.speak(utterThis);
  }
}

function setIcon(oldClass, newClass, order = null, additionalClass = null) {
  const target = document.querySelector(`.${oldClass}`);
  if (!target) return;
  target.classList.add(newClass);
  target.classList.remove(oldClass);
  if (order) {
    target.classList[order](additionalClass);
  }
}
function checkAnswer() {
  const currWord = currentPhrase.eng;
  const ansWord = answerInput.value;
  const currWordUpper = currWord.toUpperCase();
  const ansWordUpper = ansWord.toUpperCase();
  let i = 0;
  const targetLength =
    currWordUpper.length > ansWordUpper.length
      ? currWordUpper.length
      : ansWordUpper.length;
  let aSpan = currentPhrase.eng;
  let bSpan = "";
  while (i < targetLength) {
    let letter = currWord.charAt(i);
    if (currWordUpper.charAt(i) !== ansWordUpper.charAt(i)) {
      letter = `<span class='error'>${ansWord.charAt(i)}</span>`;
    } else {
    }
    bSpan = bSpan + letter;
    i++;
  }
  const contents = `<span>${aSpan}</span><span>${bSpan}</span>`;
  if (currWordUpper === ansWordUpper) {
    resultText.classList.add("success");
    resultText.classList.remove("error");
    resultText.innerText = "Correct!";
  } else {
    resultText.classList.remove("success");
    resultText.classList.add("error");
    resultText.innerText = "Wrong!";
  }
  const li = document.createElement("li");
  li.innerHTML = contents;
  historyList.appendChild(li);
  historyContainer.scroll({
    top: historyContainer.scrollHeight,
    behavior: "smooth",
  });
  answerInput.value = "";
  playGame();
}
// event listeners
checkButton.addEventListener("click", () => checkAnswer());
answerInput.addEventListener("keypress", (e) => {
  if (e.keyCode !== 13) return;
  checkAnswer();
});
typeButton.addEventListener("click", () => {
  voiceType = voiceType === "native" ? "esl" : "native";
  typeButton.innerText = voiceType.toUpperCase();
  populateVoiceList();
});
startButton.addEventListener("click", () => {
  if (isPlaying) {
    setIcon("bi-pause-fill", "bi-play-fill", "remove", "error");
    isPlaying = false;
  } else {
    setIcon("bi-play-fill", "bi-pause-fill", "add", "error");
    isPlaying = true;
    playGame();
  }
});

// initial call
init();
