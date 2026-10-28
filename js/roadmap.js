/* ==========================================================
   TechBridge Internship Roadmap (Task 4)
   Plain JavaScript: no frameworks.

   How it works, in one line:
   the task information lives in arrays of objects (section 1);
   when a visitor picks a track, renderTrack() looks up that
   track's data and rebuilds the page content (section 4).

   JavaScript concepts used, and where to find them:
   - Variables ........ const / let in sections 1 and 2
   - Arrays ........... the task lists in section 1
   - Objects .......... every task, and the TRACKS lookup, in section 1
   - Functions ........ section 3 and 4
   - Event listeners .. section 5
   - Conditionals ..... getTrack(), getStatus(), buildTaskCard()
   - DOM manipulation . renderTrack() and the tab updates
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   1. DATA
   Each task is an OBJECT. Each track's tasks are an ARRAY of
   those objects. To change a task, edit it here and nothing else.
   ---------------------------------------------------------- */

// First day of the current cohort. Month numbers start at 0, so 9 = October.
// Change this for a new cohort.
const COHORT_START = new Date(2026, 9, 1);

// Difficulty label -> how many bars to fill (1, 2 or 3)
const DIFFICULTY_LEVEL = {
  "Beginner": 1,
  "Beginner \u2192 Intermediate": 2,
  "Intermediate": 3
};

const webDevelopmentTasks = [
  {
    number: 1,
    day: 1,
    title: "Build the TechBridge Homepage",
    description: "Create the first version of the TechBridge website using HTML and CSS.",
    difficulty: "Beginner",
    build: [
      "A homepage that introduces TechBridge, its programs and its 30-day internship",
      "Clear navigation, a community call-to-action, contact details and a footer",
      "A layout that works on desktop, tablet and mobile"
    ],
    connects: null
  },
  {
    number: 2,
    day: 4,
    title: "Build the TechBridge Programs Experience",
    description: "Create a Programs experience presenting TechBridge's available learning programs.",
    difficulty: "Beginner",
    build: [
      "A dedicated Programs page or experience for Data Analytics and Web Development",
      "Clear information on what each program is about and the skills it develops",
      "A clear next step for visitors"
    ],
    connects: "The website you built in Task 1."
  },
  {
    number: 3,
    day: 8,
    title: "Build the Internship Tasks Experience",
    description: "Create an interface that presents the TechBridge internship tasks and helps users understand the internship journey.",
    difficulty: "Beginner \u2192 Intermediate",
    build: [
      "An introduction to the structured 30-day internship",
      "All 8 tasks, each with its number, title, day and a brief description",
      "A clear sense of the sequence and the increasing difficulty",
      "Built with HTML5 and CSS3, and responsive on desktop, tablet and mobile"
    ],
    connects: "The Home and Programs pages from Tasks 1 and 2."
  },
  {
    number: 4,
    day: 11,
    title: "Build an Interactive Internship Roadmap",
    description: "Use JavaScript to allow visitors to switch between the Data Analytics and Web Development internship tracks.",
    difficulty: "Beginner \u2192 Intermediate",
    build: [
      "A way for visitors to select the Data Analytics or Web Development track",
      "Task content that switches between the two tracks without a page refresh",
      "Built with HTML5, CSS3 and JavaScript, with no frameworks"
    ],
    connects: "The task experience from Task 3."
  },
  {
    number: 5,
    day: 15,
    title: "Build the TechBridge Challenge Hub",
    description: "Create an interactive Challenge Hub where visitors can browse, filter and explore challenges from the two TechBridge tracks.",
    difficulty: "Beginner \u2192 Intermediate",
    build: [
      "A Challenge Hub page where visitors can browse challenges from both tracks",
      "Filters for track and difficulty",
      "Challenge details that appear without a page refresh"
    ],
    connects: "The Home, Programs and roadmap pages from earlier tasks."
  },
  {
    number: 6,
    day: 19,
    title: "Build the TechBridge Intern Dashboard",
    description: "Create an interactive intern dashboard where an intern can see their progress, track their tasks and explore the Challenge Hub.",
    difficulty: "Intermediate",
    build: [
      "A welcome section, plus a progress bar and percentage that update as tasks are completed",
      "A task tracker with filters and task details",
      "A link to the Challenge Hub and a Modern Web Technologies explorer"
    ],
    connects: "The Challenge Hub from Task 5."
  },
  {
    number: 7,
    day: 22,
    title: "Build the Task Submission System",
    description: "Create an interface through which interns can prepare and submit their task work.",
    difficulty: "Intermediate",
    build: [
      "An interface where interns can prepare their task work",
      "A way for interns to submit that work"
    ],
    connects: null
  },
  {
    number: 8,
    day: 26,
    title: "Build the Complete TechBridge Internship Platform",
    description: "Combine the different components created during the internship into a complete TechBridge platform.",
    difficulty: "Intermediate",
    build: [
      "The components from the earlier tasks, combined",
      "A complete TechBridge internship platform"
    ],
    connects: "The components created across the internship."
  }
];

/* DATA ANALYTICS TRACK
   The official Data Analytics task list has not been added yet.
   The days below are the shared internship days (1, 4, 8, 11, 15, 19, 22, 26).
   TODO: replace each placeholder's title, description and difficulty with the
   official text, and remove "pending: true" from that task.
   Difficulty must be exactly one of: "Beginner",
   "Beginner \u2192 Intermediate" or "Intermediate". */
const dataAnalyticsTasks = [
  { number: 1, day: 1,  title: "Data Analytics Task 1", description: "", difficulty: null, build: [], connects: null, pending: true },
  { number: 2, day: 4,  title: "Data Analytics Task 2", description: "", difficulty: null, build: [], connects: null, pending: true },
  { number: 3, day: 8,  title: "Data Analytics Task 3", description: "", difficulty: null, build: [], connects: null, pending: true },
  { number: 4, day: 11, title: "Data Analytics Task 4", description: "", difficulty: null, build: [], connects: null, pending: true },
  { number: 5, day: 15, title: "Data Analytics Task 5", description: "", difficulty: null, build: [], connects: null, pending: true },
  { number: 6, day: 19, title: "Data Analytics Task 6", description: "", difficulty: null, build: [], connects: null, pending: true },
  { number: 7, day: 22, title: "Data Analytics Task 7", description: "", difficulty: null, build: [], connects: null, pending: true },
  { number: 8, day: 26, title: "Data Analytics Task 8", description: "", difficulty: null, build: [], connects: null, pending: true }
];

// One object that holds both tracks, so a track can be found by its key.
const TRACKS = {
  data: {
    key: "data",
    slug: "data-analytics",
    name: "Data Analytics",
    icon: "i-chart",
    intro: "Data Analytics introduces learners to practical data analysis: spreadsheet analysis, data cleaning, SQL, data visualization and business-focused analysis.",
    tasks: dataAnalyticsTasks
  },
  web: {
    key: "web",
    slug: "web-development",
    name: "Web Development",
    icon: "i-code",
    intro: "Web Development introduces learners to practical website development: HTML, CSS, JavaScript, Git/GitHub and building web projects.",
    tasks: webDevelopmentTasks
  }
};

/* ----------------------------------------------------------
   2. STATE AND PAGE ELEMENTS
   ---------------------------------------------------------- */

// The track being shown right now. Web Development is the default.
let currentTrack = "web";

const tabs = document.querySelectorAll(".tab");
const panel = document.getElementById("track-panel");
const headBox = document.getElementById("track-head");
const timelineBox = document.getElementById("timeline");
const listBox = document.getElementById("task-list");
const difficultyBox = document.getElementById("difficulty");
const liveStatus = document.getElementById("live-status");

/* ----------------------------------------------------------
   3. SMALL HELPER FUNCTIONS (they use conditional logic)
   ---------------------------------------------------------- */

// Find a track's data from its key. Anything unknown falls back to Web Development.
function getTrack(key) {
  if (key === "data") {
    return TRACKS.data;
  } else {
    return TRACKS.web;
  }
}

// Which day of the cohort is it today? (Day 1 = COHORT_START)
function getCohortDay() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((today - COHORT_START) / msPerDay) + 1;
}

// A task is "available" once its day has been reached, otherwise "upcoming".
function getStatus(taskDay) {
  if (getCohortDay() >= taskDay) {
    return "available";
  } else {
    return "upcoming";
  }
}

// Difficulty label -> number of filled bars (0 when the label is unknown).
function getLevel(difficulty) {
  if (difficulty in DIFFICULTY_LEVEL) {
    return DIFFICULTY_LEVEL[difficulty];
  } else {
    return 0;
  }
}

// The three little difficulty bars.
function buildPips(level) {
  let bars = "";
  for (let i = 0; i < 3; i++) {
    bars += "<i></i>";
  }
  return '<span class="level" data-level="' + level + '" aria-hidden="true">' + bars + "</span>";
}

function icon(name) {
  return '<svg class="icon" aria-hidden="true"><use href="#' + name + '"/></svg>';
}

/* Group neighbouring tasks that share a difficulty, e.g.
   [Beginner x2, Beginner -> Intermediate x2, Intermediate x4]. */
function groupByDifficulty(tasks) {
  const groups = [];
  tasks.forEach(function (task) {
    const label = task.difficulty ? task.difficulty : "To be confirmed";
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.tasks.push(task);
    } else {
      groups.push({ label: label, tasks: [task] });
    }
  });
  return groups;
}

/* ----------------------------------------------------------
   4. BUILDING AND SHOWING A TRACK
   Each build...() function returns a piece of HTML as text.
   renderTrack() puts those pieces into the page.
   ---------------------------------------------------------- */

function buildHead(track) {
  const lastTask = track.tasks[track.tasks.length - 1];
  const hasPending = track.tasks.some(function (task) { return task.pending; });
  const note = hasPending
    ? '<p class="pending-note">The official ' + track.name + " task details are still being added to this page.</p>"
    : "";

  return (
    '<div class="track-head-main">' +
      '<span class="icon-chip icon-chip-lg">' + icon(track.icon) + "</span>" +
      "<div>" +
        '<p class="viewing-label">Currently viewing</p>' +
        '<h2 class="viewing-name">' + track.name + "</h2>" +
      "</div>" +
    "</div>" +
    '<div class="track-head-side">' +
      '<p class="track-intro">' + track.intro + "</p>" +
      '<ul class="track-facts">' +
        "<li>30-Day Practical Internship</li>" +
        "<li>" + track.tasks.length + " tasks</li>" +
        "<li>Day 1 to Day " + lastTask.day + "</li>" +
      "</ul>" +
      note +
    "</div>"
  );
}

// The 30-day line: one circle per task, placed at its day.
function buildTimeline(tasks) {
  let html = "";
  tasks.forEach(function (task, index) {
    html +=
      '<li class="pin" data-status="' + getStatus(task.day) + '" style="--d:' + task.day + "; --i:" + index + '">' +
        '<a href="#task-' + task.number + '" aria-label="Task ' + task.number + ", Day " + task.day + ": " + task.title + '">' +
          '<span class="pin-dot">' + task.number + "</span>" +
          '<span class="pin-day"><span class="long">Day ' + task.day + '</span><span class="short">D' + task.day + "</span></span>" +
        "</a>" +
      "</li>";
  });
  // the finish flag at Day 30
  html +=
    '<li class="pin pin-end" style="--d:30; --i:' + tasks.length + '">' +
      '<span class="pin-dot">' + icon("i-flag") + "</span>" +
      '<span class="pin-day"><span class="long">Day 30</span><span class="short">D30</span></span>' +
    "</li>";
  return html;
}

function buildTaskCard(task, index) {
  const status = getStatus(task.day);
  const statusLabel = status === "available" ? "Available" : "Upcoming";
  const difficultyLabel = task.difficulty ? task.difficulty : "To be confirmed";

  // Choose what goes at the bottom of the card.
  let more = "";
  if (task.pending) {
    more = '<p class="soon">Full task details are coming soon.</p>';
  } else {
    let items = "";
    task.build.forEach(function (item) {
      items += "<li>" + icon("i-check") + item + "</li>";
    });
    const connects = task.connects
      ? '<p class="connects"><strong>Connects to:</strong> ' + task.connects + "</p>"
      : "";
    more =
      '<details class="more">' +
        "<summary>What you'll build " + icon("i-chevron") + "</summary>" +
        '<div class="more-body">' +
          "<h4>You'll be expected to create:</h4>" +
          '<ul class="fit-list">' + items + "</ul>" +
          connects +
        "</div>" +
      "</details>";
  }

  const description = task.description
    ? '<p class="stop-desc">' + task.description + "</p>"
    : '<p class="stop-desc stop-desc-empty">Description to be added.</p>';

  return (
    '<li class="stop" id="task-' + task.number + '" data-status="' + status + '" style="--i:' + index + '">' +
      '<div class="stop-rail" aria-hidden="true">' +
        '<span class="stop-node">' + task.number + "</span>" +
        '<span class="stop-line"></span>' +
      "</div>" +
      '<article class="stop-card">' +
        '<div class="stop-meta">' +
          '<p class="stop-day"><span class="stop-day-word">Day</span><span class="stop-day-num">' + task.day + "</span></p>" +
          '<p class="status status-' + status + '"><span class="status-dot"></span>' + statusLabel + "</p>" +
          '<div class="level-wrap">' + buildPips(getLevel(task.difficulty)) + '<span class="level-text">' + difficultyLabel + "</span></div>" +
        "</div>" +
        '<div class="stop-main">' +
          '<p class="task-tag">Task ' + task.number + "</p>" +
          "<h3>" + task.title + "</h3>" +
          description +
          more +
        "</div>" +
      "</article>" +
    "</li>"
  );
}

// The "staircase": one step per difficulty group.
function buildDifficulty(tasks) {
  const stepClass = { 0: "step-1", 1: "step-1", 2: "step-2", 3: "step-4" };
  let html = "";
  groupByDifficulty(tasks).forEach(function (group) {
    const level = getLevel(group.label);
    const first = group.tasks[0].number;
    const last = group.tasks[group.tasks.length - 1].number;
    const range = group.tasks.length === 1 ? "Task " + first : "Tasks " + first + "\u2013" + last;

    let links = "";
    group.tasks.forEach(function (task) {
      links += '<li><a href="#task-' + task.number + '">Task ' + task.number + " \u00b7 Day " + task.day + "</a></li>";
    });

    html +=
      '<li class="step ' + stepClass[level] + '">' +
        buildPips(level) +
        "<h3>" + group.label + "</h3>" +
        '<p class="step-range">' + range + "</p>" +
        '<ul class="step-links">' + links + "</ul>" +
      "</li>";
  });
  return html;
}

// Mark the selected tab. Only the selected tab can be reached with the Tab key.
function updateTabs(key) {
  tabs.forEach(function (tab) {
    const isSelected = tab.dataset.track === key;
    tab.setAttribute("aria-selected", isSelected ? "true" : "false");
    tab.tabIndex = isSelected ? 0 : -1;
  });
  panel.setAttribute("aria-labelledby", "tab-" + key);
}

// The main function: show the track the visitor chose.
function renderTrack(key) {
  currentTrack = key;                 // remember the choice
  const track = getTrack(key);        // look up that track's data

  updateTabs(key);

  // DOM manipulation: replace the content of each box on the page
  headBox.innerHTML = buildHead(track);
  timelineBox.innerHTML = buildTimeline(track.tasks);

  let cards = "";
  track.tasks.forEach(function (task, index) {
    cards += buildTaskCard(task, index);
  });
  listBox.innerHTML = cards;

  difficultyBox.innerHTML = buildDifficulty(track.tasks);

  // Tell screen readers what changed (a short message, not the whole page)
  liveStatus.textContent = "Now viewing the " + track.name + " track: " + track.tasks.length + " tasks.";

  // Keep the address bar in step with the choice, without reloading the page
  history.replaceState(null, "", "#" + track.slug);
}

/* ----------------------------------------------------------
   5. EVENT LISTENERS
   ---------------------------------------------------------- */

// Clicking a tab shows that track.
tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    renderTrack(tab.dataset.track);
  });
});

// Arrow keys, Home and End move between tabs (keyboard users).
document.querySelector(".tabs").addEventListener("keydown", function (event) {
  const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(event.key)) {
    return;
  }
  event.preventDefault();

  const list = Array.from(tabs);
  const position = list.findIndex(function (tab) { return tab.dataset.track === currentTrack; });
  let next = position;

  if (event.key === "ArrowRight") {
    next = (position + 1) % list.length;
  } else if (event.key === "ArrowLeft") {
    next = (position - 1 + list.length) % list.length;
  } else if (event.key === "Home") {
    next = 0;
  } else {
    next = list.length - 1;
  }

  renderTrack(list[next].dataset.track);
  list[next].focus();
});

// If the address changes (back button, or a link like roadmap.html#data-analytics),
// switch to the matching track. Other hashes, such as #task-3, change nothing.
window.addEventListener("hashchange", function () {
  const key = trackFromAddress();
  if (key !== currentTrack) {
    renderTrack(key);
  }
});

/* ----------------------------------------------------------
   6. START
   Open the track named in the address (#data-analytics or
   #web-development), otherwise show the default track.
   ---------------------------------------------------------- */
function trackFromAddress() {
  const hash = window.location.hash;
  if (hash === "#data-analytics") {
    return "data";
  } else if (hash === "#web-development") {
    return "web";
  } else {
    return currentTrack;
  }
}

renderTrack(trackFromAddress());
