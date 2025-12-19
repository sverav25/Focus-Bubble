// =========================================================================================================
// Pomodoro Timer Functionality 
// =========================================================================================================

let focusTime = 25 * 60;
let breakTime = 5 * 60;
let longBreakTime = 35 * 60;

let timeLeft = focusTime;
let currentSessionDuration = focusTime;
let isRunning = false;
let isFocusSession = true;
let timerInterval;
let focusCount = 0;

const timerDisplay = document.getElementById("timer");
const sessionLabel = document.getElementById("sessionLabel");
const halfCircle = document.querySelector(".half-circle");
const sessionBoxes = document.querySelectorAll(".session-box");


const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

// =========================================================================================================
// HELPER: Format Time
// =========================================================================================================
function formatTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
}

// =========================================================================================================
// UPDATE TIMER DISPLAY AND BOXES
// =========================================================================================================
function updateTimer() {
    timerDisplay.textContent = formatTime(timeLeft);

    let total = currentSessionDuration;
    if (!total || total <= 0) total = 1;
    let percent = 1 - (timeLeft / total);
    let degrees = percent * 180;

    halfCircle.style.setProperty("--progress", degrees + "deg");
}


function updateSessionTracker() {
    sessionBoxes.forEach((box, index) => {
        if (index < focusCount) {
            box.classList.add("filled");
        } else {
            box.classList.remove("filled");
        }
    });
}
// =========================================================================================================
// START TIMER
// =========================================================================================================
function startTimer() {
    if (isRunning) return;
    isRunning = true;

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;

            if (isFocusSession) {

                focusCount++;
                updateSessionTracker();

                if (focusCount >= 4) {
                    // long break
                    currentSessionDuration = longBreakTime;
                    timeLeft = longBreakTime;
                    sessionLabel.textContent = "Long Break Session";

                    focusCount = 0;
                } else {
                    // short break
                    currentSessionDuration = breakTime;
                    timeLeft = breakTime;
                    sessionLabel.textContent = "Short Break Session";
                }

                resetFog();
                isFocusSession = false;

            } else {

                if (currentSessionDuration === longBreakTime) {
                    updateSessionTracker();
                }

                isFocusSession = true;
                currentSessionDuration = focusTime;
                timeLeft = focusTime;
                sessionLabel.textContent = "Focus Session";

            }

            halfCircle.style.transition = "none";
            halfCircle.style.setProperty("--progress", "0deg");
            void halfCircle.offsetWidth;
            halfCircle.style.transition = "transform 1s linear, background 0.2s";

            updateTimer();
            startTimer();
        }
    }, 1000);
}

// =========================================================================================================
// PAUSE TIMER
// =========================================================================================================
function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
}



// =========================================================================================================
// RESET TIMER
// =========================================================================================================
function resetTimer() {
    pauseTimer();
    isFocusSession = true;
    sessionLabel.textContent = "Focus Session";
    focusCount = 0;
    updateSessionTracker();
    currentSessionDuration = focusTime;
    timeLeft = focusTime;
    resetFog();

    halfCircle.style.setProperty("--progress", "0deg");
    void halfCircle.offsetWidth;

    updateTimer();
}

// Button Listeners
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

// =========================================================================================================
// SPACEBAR START/PAUSE/RESTART TOGGLE ✅
// =========================================================================================================
window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault();

        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    } else if (event.code === "KeyR" || event.code === "Enter") {
        event.preventDefault();
        resetTimer();
    }
});

updateTimer();




// ===========================================================================================================
// SETTINGS MODAL FUNCTIONALITY ✅
// =========================================================================================================

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const saveSettings = document.getElementById("saveSettings");

const focusInput = document.getElementById("focusInput");
const shortBreakInput = document.getElementById("shortBreakInput");
const longBreakInput = document.getElementById("longBreakInput");
const fogIncreaseInput = document.getElementById("fogIncreaseSelect");
const fogDecreaseInput = document.getElementById("fogDecreaseSelect");


settingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
});


closeSettings.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
});



saveSettings.addEventListener("click", () => {
    let focusval = Math.max(1, Number(focusInput.value));
    let sbreakval = Math.max(1, Number(shortBreakInput.value));
    let lbreakval = Math.max(1, Number(longBreakInput.value));
    focusTime = focusval * 60;
    breakTime = sbreakval * 60;
    longBreakTime = lbreakval * 60;
    focusInput.value = focusval;
    shortBreakInput.value = sbreakval;
    longBreakInput.value = lbreakval;

    FOG_INCREASE_INTERVAL = Number(fogIncreaseInput.value) * 60;
    FOG_DECREASE_INTERVAL = Number(fogDecreaseInput.value) * 60;

    pauseTimer();
    isFocusSession = true;
    currentSessionDuration = focusTime;
    timeLeft = focusTime;

    halfCircle.style.setProperty("--progress", "0deg");
    void halfCircle.offsetWidth;

    updateTimer();

    settingsModal.classList.add("hidden");
});


window.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add("hidden");
    }
});

settingsModal.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        saveSettings.click();
    } else if (e.key === "Escape") {
        settingsModal.classList.add("hidden");
    }
});






// =========================================================================================================
// FOG SYSTEM (focus session only)
// =========================================================================================================


const fogLayer = document.getElementById("fog-layer");

let fogLevel = 0;
const FOG_STEP = 0.2;
let FOG_INCREASE_INTERVAL = 1 * 60;
let FOG_DECREASE_INTERVAL = 4 * 60;
let awayAccumulatedSeconds = 0;

let awayCounterInterval = null;
let insideCounterInterval = null;


function updateFogDisplay() {
    fogLayer.style.opacity = fogLevel;
    fogLayer.classList.toggle("hidden", fogLevel <= 0);
}

function resetFog() {
    fogLevel = 0;
    awayAccumulatedSeconds = 0;
    updateFogDisplay();
}



document.addEventListener("visibilitychange", () => {

    if (!isFocusSession || !isRunning) return;

    if (document.hidden) {

        clearInterval(insideCounterInterval);
        insideCounterInterval = null;

        let leaveTimestamp = Date.now();

        awayCounterInterval = setInterval(() => {
            if (!isFocusSession || !isRunning) return;

            const now = Date.now();
            const secondsOut = Math.floor((now - leaveTimestamp) / 1000);
            leaveTimestamp = now;

            awayAccumulatedSeconds += secondsOut;

            while (awayAccumulatedSeconds >= FOG_INCREASE_INTERVAL) {
                fogLevel = Math.min(1, fogLevel + FOG_STEP);
                awayAccumulatedSeconds -= FOG_INCREASE_INTERVAL;
                updateFogDisplay();
            }

        }, 1000);

    } else {

        clearInterval(awayCounterInterval);
        awayCounterInterval = null;

        if (fogLevel <= 0) return;

        let insideSeconds = 0;

        insideCounterInterval = setInterval(() => {
            if (!isFocusSession || !isRunning) return;

            insideSeconds++;

            if (insideSeconds >= FOG_DECREASE_INTERVAL) {
                fogLevel = Math.max(0, fogLevel - FOG_STEP);
                updateFogDisplay();

                insideSeconds = 0;

                if (fogLevel <= 0) {
                    clearInterval(insideCounterInterval);
                    insideCounterInterval = null;
                }
            }

        }, 1000);
    }
});



// =========================================================================================================
// CONTROL BAR
// =========================================================================================================


const scrollBar = document.getElementById("scrollControlBar");
const scrollStartBtn = document.getElementById("scrollStartBtn");
const scrollPauseBtn = document.getElementById("scrollPauseBtn");
const scrollResetBtn = document.getElementById("scrollResetBtn");
const scrollTimer = document.getElementById("scrollTimer");

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
}

let lastScrollTop = 0;
window.addEventListener("scroll", () => {
    const st = window.scrollY;
    if (st > 350) {
        scrollBar.classList.remove("hidden");
    } else {
        scrollBar.classList.add("hidden");
    }
    lastScrollTop = st <= 0 ? 0 : st;
});


function updateScrollTimerDisplay() {
    scrollTimer.textContent = formatTime(timeLeft);
}

setInterval(updateScrollTimerDisplay, 1000);

scrollStartBtn.addEventListener("click", () => {
    startTimer(); // Call your main timer function
});

scrollPauseBtn.addEventListener("click", () => {
    pauseTimer(); // Call your main pause function
});

scrollResetBtn.addEventListener("click", () => {
    resetTimer(); // Call your main reset function
});



// =========================================================================================================
// TASK LIST
// =========================================================================================================


const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");


function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const li = document.createElement("li");
    li.className = "task-item";

    li.innerHTML = `
        <label>
            <input type="checkbox" class="task-check">
            <span class="task-text">${text}</span>
        </label>
        <button class="task-delete">✕</button>
    `;

    taskList.appendChild(li);
    taskInput.value = "";

    li.querySelector(".task-delete").addEventListener("click", () => {
        li.remove();
    });
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
});