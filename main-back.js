const synth = window.speechSynthesis;

let voices = [];
let selectedVoice = "KR";

const textInput = document.querySelector(".text-input");
const voiceSelect = document.querySelector("#select");

function populateVoiceList() {
  console.log(synth.getVoices());
  voices = synth.getVoices().sort(function (a, b) {
    const aname = a.name.toUpperCase(),
      bname = b.name.toUpperCase();
    return aname < bname ? -1 : 1;
  });
  const selectedIndex =
    voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = "";
  voices.forEach((voice) => {
    const { name, lang } = voice;
    const option = document.createElement("option");

    const arr = name.split(" ").shift();
    const label = name.split(" ").pop();
    option.textContent = label;
    option.setAttribute("data-lang", lang);
    option.setAttribute("data-name", label);
    voiceSelect.appendChild(option);
  });
  voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();
if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = populateVoiceList;
}
function speak() {
  if (synth.speaking) {
    console.error("speechSynthesis.speaking");
    return;
  }
  if (textInput.value !== "") {
    const utterThis = new SpeechSynthesisUtterance(textInput.value);
    console.log(utterThis, "utterThis");
    utterThis.onend = function (event) {
      console.log("SpeechSynthesisUtterance.onend");
    };
    utterThis.onerror = function (event) {
      console.error("SpeechSynthesisUtterance.onerror");
    };
    console.log(selectedVoice);
    utterThis.voice = selectedVoice;
    utterThis.pitch = 1;
    utterThis.rate = 1;
    synth.speak(utterThis);
  }
  textInput.value = "";
}

voiceSelect.addEventListener("change", (e) => {
  selectedVoice = voices[voiceSelect.selectedIndex];
});

textInput.addEventListener("keypress", (e) => {
  if (e.keyCode !== 13) return;
  if (textInput.value.trim().length > 30) {
    textInput.value = "";
    return;
  }
  speak();
});

// .onsubmit = function (event) {
//   event.preventDefault();

//   speak();

//   inputTxt.blur();
// };
