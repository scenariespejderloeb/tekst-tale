const textInput = document.querySelector("#textInput");
const readButton = document.querySelector("#readButton");
const pauseButton = document.querySelector("#pauseButton");
const stopButton = document.querySelector("#stopButton");
const rateInput = document.querySelector("#rateInput");
const rateText = document.querySelector("#rateText");
const currentLine = document.querySelector("#currentLine");
const spellingBox = document.querySelector("#spellingBox");
const checkSpellingButton = document.querySelector("#checkSpellingButton");
const applySpellingButton = document.querySelector("#applySpellingButton");

let voices = [];
let linesToRead = [];
let lineIndex = 0;
let isPaused = false;

// Ikke-AI stavehjælp.
// Udvid listen her, hvis version 0.5 havde flere kendte rettelser.
const spellingCorrections = {
  "jag": "jeg",
  "ja": "jeg",
  "mæj": "mig",
  "maj": "mig",
  "dæj": "dig",
  "dej": "dig",
  "ik": "ikke",
  "ikk": "ikke",
  "os": "også",
  "ogso": "også",
  "fordi": "fordi",
  "fårdi": "fordi",
  "fodi": "fordi",
  "matematig": "matematik",
  "mattematik": "matematik",
  "skole": "skole",
  "skolle": "skole",
  "venner": "venner",
  "vener": "venner",
  "lære": "lærer",
  "lærer": "lærer",
  "hved": "hvad",
  "vad": "hvad",
  "vor": "hvor",
  "hvor dan": "hvordan",
  "når": "når",
  "nogen": "nogle",
  "meget": "meget",
  "mget": "meget",
  "sårn": "sådan",
  "sån": "sådan",
  "imorgen": "i morgen",
  "idag": "i dag",
  "igår": "i går"
};

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
}

loadVoices();
window.speechSynthesis.onvoiceschanged = loadVoices;

function getSelectedVoice() {
  const selectedType = document.querySelector("input[name='voiceType']:checked").value;
  const danishVoices = voices.filter(voice => voice.lang.toLowerCase().startsWith("da"));

  const femaleHints = ["female", "kvinde", "woman", "sara", "nora", "ida", "emma", "trine"];
  const maleHints = ["male", "mand", "man", "mads", "magnus", "christian", "daniel"];
  const hints = selectedType === "female" ? femaleHints : maleHints;

  const preferredVoice = danishVoices.find(voice =>
    hints.some(hint => voice.name.toLowerCase().includes(hint))
  );

  return preferredVoice || danishVoices[0] || voices[0] || null;
}

function getCleanLines() {
  return textInput.value
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

function speakSingleLine(line) {
  const cleanLine = line.trim();

  if (cleanLine.length === 0) {
    return;
  }

  isPaused = false;
  window.speechSynthesis.cancel();
  currentLine.textContent = cleanLine;

  const utterance = new SpeechSynthesisUtterance(cleanLine);
  utterance.lang = "da-DK";
  utterance.rate = Number(rateInput.value);

  const voice = getSelectedVoice();
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

function readLineWhenEnterIsPressed(event) {
  if (event.key !== "Enter" || event.shiftKey) {
    return;
  }

  const cursorPosition = textInput.selectionStart;
  const textBeforeCursor = textInput.value.slice(0, cursorPosition);
  const lineJustWritten = textBeforeCursor.split(/\n/).pop();

  speakSingleLine(lineJustWritten);
}

function speakCurrentLine() {
  if (lineIndex >= linesToRead.length) {
    currentLine.textContent = "Oplæsningen er færdig.";
    return;
  }

  const line = linesToRead[lineIndex];
  currentLine.textContent = line;

  const utterance = new SpeechSynthesisUtterance(line);
  utterance.lang = "da-DK";
  utterance.rate = Number(rateInput.value);

  const voice = getSelectedVoice();
  if (voice) utterance.voice = voice;

  utterance.onend = () => {
    if (!isPaused) {
      lineIndex += 1;
      speakCurrentLine();
    }
  };

  window.speechSynthesis.speak(utterance);
}

function startReading() {
  window.speechSynthesis.cancel();
  isPaused = false;
  linesToRead = getCleanLines();
  lineIndex = 0;

  if (linesToRead.length === 0) {
    currentLine.textContent = "Skriv en tekst først.";
    return;
  }

  speakCurrentLine();
}

function pauseOrResume() {
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    isPaused = true;
    window.speechSynthesis.pause();
    currentLine.textContent = "Oplæsningen er sat på pause.";
    return;
  }

  if (window.speechSynthesis.paused) {
    isPaused = false;
    window.speechSynthesis.resume();
  }
}

function stopReading() {
  isPaused = false;
  window.speechSynthesis.cancel();
  currentLine.textContent = "Oplæsningen er stoppet.";
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function findSpellingSuggestions(text) {
  const suggestions = [];

  for (const [wrong, correct] of Object.entries(spellingCorrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");
    if (regex.test(text)) {
      suggestions.push({ wrong, correct });
    }
  }

  return suggestions;
}

function showSpellingSuggestions() {
  const suggestions = findSpellingSuggestions(textInput.value);

  if (suggestions.length === 0) {
    spellingBox.innerHTML = `
      <strong>Stavehjælp:</strong>
      <p>Der blev ikke fundet kendte fejl. Browserens egen stavekontrol kan stadig vise forslag direkte i tekstfeltet.</p>
    `;
    return;
  }

  const items = suggestions
    .map(item => `<li><strong>${escapeHtml(item.wrong)}</strong> → ${escapeHtml(item.correct)}</li>`)
    .join("");

  spellingBox.innerHTML = `
    <strong>Stavehjælp:</strong>
    <p>Appen fandt disse mulige rettelser:</p>
    <ul>${items}</ul>
  `;
}

function applyKnownCorrections() {
  let text = textInput.value;

  for (const [wrong, correct] of Object.entries(spellingCorrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");
    text = text.replace(regex, correct);
  }

  textInput.value = text;
  showSpellingSuggestions();
}

rateInput.addEventListener("input", () => {
  rateText.textContent = `Hastighed: ${rateInput.value}`;
});

readButton.addEventListener("click", startReading);
pauseButton.addEventListener("click", pauseOrResume);
stopButton.addEventListener("click", stopReading);
checkSpellingButton.addEventListener("click", showSpellingSuggestions);
applySpellingButton.addEventListener("click", applyKnownCorrections);
textInput.addEventListener("keydown", readLineWhenEnterIsPressed);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      // Appen virker stadig, selv om service worker ikke kan registreres lokalt.
    });
  });
}
