let texts = { paragraphs: [], sentences: [] };
let currentMode = "paragraphs";
let testText = "";
let timer;
let timeLeft;
let totalTime;
let isRunning = false;
let startTime;
let previousAccuracy = 0;

const displayText = document.getElementById("displayText");
const inputArea = document.getElementById("inputArea");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const timeDisplay = document.getElementById("time");
const stopBtn = document.getElementById("stopBtn");

// Load text data
fetch("data/texts.json")
  .then((res) => res.json())
  .then((data) => {
    texts = data;
  });

function getRandomText() {
  const list = texts[currentMode];
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

function startTest(duration) {
  clearInterval(timer);
  isRunning = true;
  totalTime = timeLeft = duration;
  startTime = Date.now();

  testText = getRandomText();
  displayText.textContent = testText;
  inputArea.value = "";
  inputArea.disabled = false;
  inputArea.focus();
  stopBtn.classList.remove("hidden");
  updateTimeDisplay();

  timer = setInterval(updateTimer, 1000);
}

function startCustomTest() {
  const input = document.getElementById("customTimeInput");
  let customTime = parseInt(input.value);
  if (!customTime || customTime < 5 || customTime > 300) {
    alert("Please enter a valid time between 5 and 300 seconds.");
    return;
  }
  startTest(customTime);
}

function updateTimer() {
  timeLeft--;
  updateTimeDisplay();

  if (timeLeft <= 0) {
    clearInterval(timer);
    finishTest();
  }
}

function updateTimeDisplay() {
  timeDisplay.textContent = timeLeft;
}

function finishTest() {
  clearInterval(timer);
  updateTimeDisplay();
  inputArea.disabled = true;
  isRunning = false;
  stopBtn.classList.add("hidden");
  calculateResults();
}

function calculateResults() {
  const enteredText = inputArea.value.trim();
  const words = enteredText.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const timeTaken = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const wpm = Math.round((wordCount / timeTaken) * 60);

  const originalWords = testText.split(/\s+/);
  let correctWords = 0;
  for (let i = 0; i < words.length; i++) {
    if (words[i] === originalWords[i]) {
      correctWords++;
    }
  }
  const accuracy = Math.round((correctWords / originalWords.length) * 100);

  wpmDisplay.textContent = wpm;
  accuracyDisplay.textContent = `${accuracy}%`;

  const emoji = document.getElementById("emoji");
  if (emoji) {
    updateEmoji(accuracy, emoji);
  }

  const result = {
    wpm,
    accuracy,
    totalWords: wordCount,
    correctWords,
    timeTaken,
    totalTime,
    timeLeft: totalTime - timeTaken,
    mode: currentMode   // ✅ added for result.html
  };
  localStorage.setItem("keysonic_result", JSON.stringify(result));
  window.location.href = "results/result.html";
}

function handleModeChange(e) {
  currentMode = e.target.value;
}

function stopTest() {
  if (!isRunning) return;
  clearInterval(timer);
  finishTest();
}

function updateEmoji(accuracy, emoji) {
  if (accuracy > previousAccuracy) {
    emoji.classList.add("bounce");
    setTimeout(() => emoji.classList.remove("bounce"), 600);
  }

  if (accuracy < 40) {
    emoji.textContent = "😣";
  } else if (accuracy < 60) {
    emoji.textContent = "😐";
  } else if (accuracy < 75) {
    emoji.textContent = "🙂";
  } else if (accuracy < 90) {
    emoji.textContent = "😄";
  } else if (accuracy < 100) {
    emoji.textContent = "🤩";
  } else {
    emoji.textContent = "🧠";
  }

  previousAccuracy = accuracy;
}

// Real-time emoji + accuracy while typing
inputArea.addEventListener("input", () => {
  if (!isRunning) return;

  const enteredText = inputArea.value.trim();
  const words = enteredText.split(/\s+/).filter(word => word.length > 0);
  const originalWords = testText.split(/\s+/);
  let correctWords = 0;

  for (let i = 0; i < words.length; i++) {
    if (words[i] === originalWords[i]) {
      correctWords++;
    }
  }

  const accuracy = Math.round((correctWords / originalWords.length) * 100);
  accuracyDisplay.textContent = `${accuracy}%`;

  const emoji = document.getElementById("emoji");
  if (emoji) {
    updateEmoji(accuracy, emoji);
  }
});

// Init
window.onload = () => {
  document.getElementById("modeSelect").addEventListener("change", handleModeChange);
  stopBtn.addEventListener("click", stopTest);
};

// === Starfield Background Animation ===
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
let stars = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createStars(count) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      d: Math.random() * 0.5 + 0.3,
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00ffe0";
  stars.forEach((star) => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function animateStars() {
  stars.forEach((star) => {
    star.y += star.d;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });
  drawStars();
  requestAnimationFrame(animateStars);
}

createStars(100);
animateStars();
