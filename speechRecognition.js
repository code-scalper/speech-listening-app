const checkButton = document.querySelector(".check-button");
const saveButton = document.querySelector(".save-button");
const typeButton = document.querySelector(".type-button");
const startButton = document.querySelector(".start-button");
const answerInput = document.querySelector(".answer-input");
const wordInput = document.querySelector(".word-input");
const resultText = document.querySelector(".result-text");
const displayText = document.querySelector(".display-text");
const stateText = document.querySelector(".state-text");
const studyInfoTotal = document.querySelector(".total");
const studyInfoCorrect = document.querySelector(".correct");
const historyContainer = document.querySelector(".result");
const historyList = document.querySelector(".result > ul");

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent =
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

import { phrases } from "./phrases.js";

function randomPhrase() {
  var number = Math.floor(Math.random() * phrases.length);
  return number;
}

function testSpeech() {
  const phrase = phrases[randomPhrase()];
  const engPhrase = phrase.eng.toLowerCase();
  displayText.innerText = phrase.eng;

  const grammar =
    "#JSGF V1.0; grammar phrase; public <phrase> = " + engPhrase + ";";
  const recognition = new SpeechRecognition();
  const speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function (event) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at position 0.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object
    var speechResult = event.results[0][0].transcript.toLowerCase();
    console.log(speechResult);
    if (speechResult === phrase) {
      console.log("I heard the correct phrase!");
    } else {
      console.log("That didn't sound right.");
    }

    console.log("Confidence: " + event.results[0][0].confidence);
  };

  recognition.onspeechend = function () {
    recognition.stop();
  };

  recognition.onerror = function (event) {
    console.log(event.error);
  };

  recognition.onaudiostart = function (event) {
    //Fired when the user agent has started to capture audio.
    console.log("SpeechRecognition.onaudiostart");
  };

  recognition.onaudioend = function (event) {
    //Fired when the user agent has finished capturing audio.
    console.log("SpeechRecognition.onaudioend");
  };

  recognition.onend = function (event) {
    //Fired when the speech recognition service has disconnected.
    console.log("SpeechRecognition.onend");
  };

  recognition.onnomatch = function (event) {
    //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    console.log("SpeechRecognition.onnomatch");
  };

  recognition.onsoundstart = function (event) {
    //Fired when any sound — recognisable speech or not — has been detected.
    console.log("SpeechRecognition.onsoundstart");
  };

  recognition.onsoundend = function (event) {
    //Fired when any sound — recognisable speech or not — has stopped being detected.
    console.log("SpeechRecognition.onsoundend");
  };

  recognition.onspeechstart = function (event) {
    //Fired when sound that is recognised by the speech recognition service as speech has been detected.
    console.log("SpeechRecognition.onspeechstart");
  };
  recognition.onstart = function (event) {
    //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
    console.log("SpeechRecognition.onstart");
  };
}

startButton.addEventListener("click", testSpeech);
