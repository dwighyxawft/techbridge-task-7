/* ==========================================================
   TechBridge Intern Dashboard (Task 7: connected to the API)
   Plain JavaScript: no frameworks.

   What changed since Task 6:
   Task 6 kept the 8 tasks inside this file.
   Task 7 asks the BACKEND for them using fetch():

       Dashboard  ->  fetch()  ->  REST API  ->  Node + Express  ->  tasks.json

   The flow for every action:
   1. loadTasks()     GET  /api/tasks        draw the dashboard
   2. viewTask()      GET  /api/tasks/:id    show one task in the dialog
   3. changeStatus()  PUT  /api/tasks/:id    mark completed / undo, then reload
   4. resetProgress() POST /api/reset        back to the starting statuses
   5. checkBackend()  GET  /api/health       the "Backend Status" light

   Every request can be slow or fail, so the page has three states:
   "loading" (spinner), "ready" (tasks), "error" (message + Try again).
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   1. SETTINGS AND DATA
   ---------------------------------------------------------- */

/* Where is the API?
   - Open http://localhost:3000/dashboard.html (served by Express)  -> same address, so "".
   - Open the frontend with Live Server or by double-clicking the file -> call http://localhost:3000.
   - On a real website the API lives on the same address too -> "".
   If you deploy the backend somewhere else, put its address here instead. */
const isLocalDev = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
const API_BASE = "https://techbridge-task-7-backend-production.up.railway.app";

// The sample intern shown in the welcome section.
const INTERN = { name: "Alex", track: "Web Development" };

// Details of the Challenge Hub (Task 5). Keep these in step with challenges.js.
const CHALLENGE_SUMMARY = { total: 10, data: 5, web: 5 };

// The API sends statuses like "in-progress". This turns them into words for the page.
const STATUS_LABELS = {
  "completed": "Completed",
  "in-progress": "In Progress",
  "not-started": "Not Started"
};

// Difficulty label -> number of filled bars (1, 2 or 3)
const DIFFICULTY_LEVEL = {
  "Beginner": 1,
  "Beginner \u2192 Intermediate": 2,
  "Intermediate": 3
};

// Content for the Technology Explorer. One object per button.
const TECHNOLOGIES = {
  nextjs: {
    name: "Next.js",
    tagline: "A React framework for building full web applications",
    about: "Next.js is a React framework for building full-stack web applications. You write the interface with React components, and Next.js adds routing, server-side rendering, data fetching and build tools, so one project can show pages and also handle some server work.",
    usedFor: [
      "Business and marketing websites that need to load quickly and be easy to find on search engines",
      "E-commerce stores and content-heavy sites",
      "Dashboards and full web apps that need both a frontend and some server logic"
    ],
    facts: [
      ["Built on", "React"],
      ["Maintained by", "Vercel"],
      ["Good to know first", "JavaScript and React basics"]
    ],
    url: "https://nextjs.org",
    linkText: "Learn more about Next.js"
  },
  vue: {
    name: "Vue.js",
    tagline: "A friendly JavaScript framework for building interfaces",
    about: "Vue.js is a progressive JavaScript framework for building user interfaces. You describe what the page should look like for the current data, and Vue keeps the page in sync as that data changes. You can add it to one part of a page or build a complete single-page application.",
    usedFor: [
      "Interactive interfaces such as dashboards, forms and admin panels",
      "Single-page applications",
      "Adding interactivity to an existing website one piece at a time"
    ],
    facts: [
      ["Created by", "Evan You"],
      ["Language", "JavaScript (TypeScript is supported)"],
      ["Known for", "A gentle learning curve"]
    ],
    url: "https://vuejs.org",
    linkText: "Learn more about Vue.js"
  },
  angular: {
    name: "Angular",
    tagline: "A complete framework for large web applications",
    about: "Angular is a full-featured framework, built by Google, for creating web applications with TypeScript. Routing, forms, tools for talking to servers and testing support all come built in, so teams follow one consistent way of building an app.",
    usedFor: [
      "Large business and enterprise applications",
      "Complex internal tools and dashboards",
      "Projects with big teams that benefit from a strict, consistent structure"
    ],
    facts: [
      ["Maintained by", "Google"],
      ["Language", "TypeScript"],
      ["Known for", "Structure and a lot built in"]
    ],
    url: "https://angular.dev",
    linkText: "Learn more about Angular"
  },
  backend: {
    name: "Backend Development",
    tagline: "The part of a website that runs on a server",
    about: "Backend development is the work that happens on a server, out of the visitor's sight. The backend stores data in a database, applies business rules, handles logins and security, and sends information to the frontend through an API. The frontend is what the visitor sees and clicks in the browser: it asks the backend for data, then displays the answer.",
    flow: ["Frontend (browser)", "Backend (server)", "Database"],
    technologies: [
      ["Node.js", "Runs JavaScript on a server, so one language can power both frontend and backend."],
      ["Express.js", "A small, popular web framework for Node.js, often used to build APIs."],
      ["Django", "A Python framework with many tools included, such as an admin area and user accounts."],
      ["Flask", "A lightweight Python framework that gives you the basics and lets you choose the rest."],
      ["Laravel", "A PHP framework known for clear syntax and built-in features for web applications."],
      [".NET", "Microsoft's platform for building web apps and APIs, usually with C#."]
    ],
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps",
    linkText: "Learn more about the backend"
  }
};

/* ----------------------------------------------------------
   2. STATE AND PAGE ELEMENTS
   ---------------------------------------------------------- */

let tasks = [];                 // filled by the API (starts empty)
let loadState = "loading";      // "loading", "ready" or "error"
let errorMessage = "";          // what went wrong, shown in the error box
let currentFilter = "all";      // "all", "completed", "in-progress" or "not-started"
let currentTech = "nextjs";     // the technology shown in the explorer
let lastTaskId = null;          // the task whose dialog was opened, so focus can return to it
let backendOnline = null;       // true, false, or null while still checking
let toastTimer = null;

const taskList = document.getElementById("task-list");
const taskState = document.getElementById("task-state");
const noTasks = document.getElementById("no-tasks");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".seg-btn");
const dialog = document.getElementById("task-dialog");
const dialogContent = document.getElementById("task-dialog-content");
const dialogActions = document.getElementById("task-dialog-actions");
const toast = document.getElementById("toast");
const techTabs = document.querySelectorAll(".tech-tabs .tab");
const techPanel = document.getElementById("tech-panel");

/* ----------------------------------------------------------
   3. TALKING TO THE API
   ---------------------------------------------------------- */

/* One small function for every request.
   It returns the JSON from the server, or throws an Error with a readable message. */
async function apiRequest(path, options) {
  const settings = options || {};
  if (settings.body) {
    settings.headers = { "Content-Type": "application/json" };   // we are sending JSON
  }

  let response;
  try {
    response = await fetch(API_BASE + path, settings);
  } catch (error) {
    // fetch() only fails like this when the server cannot be reached at all
    throw new Error("Could not reach the backend. Is the server running?");
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    /* the response had no JSON body */
  }

  if (!response.ok) {
    // the server answered, but with an error (404, 400, ...)
    throw new Error((data && data.error) || "The server returned an error (" + response.status + ").");
  }
  return data;
}

// Show "Connected" or "Offline" in the welcome section.
function setBackend(isOnline) {
  backendOnline = isOnline;
  const box = document.getElementById("backend-status");
  box.dataset.state = isOnline ? "online" : "offline";
  document.getElementById("backend-status-text").textContent = isOnline ? "Connected" : "Offline";
  // If tasks are already on screen and the backend disappears, say so.
  document.getElementById("offline-banner").hidden = isOnline || loadState !== "ready";
}

// Ask the server "are you there?" every few seconds.
async function checkBackend() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 3000);
    const response = await fetch(API_BASE + "/api/health", { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) {
      throw new Error("not ok");
    }
    const wasOffline = backendOnline === false;
    setBackend(true);
    // The server came back: load the tasks again by itself.
    if (loadState === "error") {
      loadTasks();
    } else if (wasOffline) {
      loadTasks(true);
    }
  } catch (error) {
    setBackend(false);
  }
}

/* GET /api/tasks
   silent = true refreshes the list without flashing the loading message. */
async function loadTasks(silent) {
  if (!silent) {
    loadState = "loading";
    renderAll();
  }
  try {
    tasks = await apiRequest("/api/tasks");
    loadState = "ready";
    setBackend(true);
  } catch (error) {
    setBackend(false);
    if (silent && tasks.length > 0) {
      showToast("Could not refresh the tasks. " + error.message);
      return;
    }
    loadState = "error";
    errorMessage = error.message;
  }
  renderAll();
}

/* PUT /api/tasks/:id  then GET /api/tasks again.
   status is "completed", "in-progress" or "not-started". */
async function changeStatus(id, status) {
  setButtonsBusy(id, true);
  try {
    await apiRequest("/api/tasks/" + id, {
      method: "PUT",
      body: JSON.stringify({ status: status })
    });
    await loadTasks(true);          // ask the backend for the fresh list
    renderAll(false, status === "completed" ? id : null);

    const left = tasks.length - countByStatus("completed");
    if (status === "completed") {
      showToast(left === 0
        ? "All " + tasks.length + " tasks completed. Well done!"
        : "Task " + id + " marked as completed. " + left + " to go.");
    } else {
      showToast("Task " + id + " moved back to your list.");
    }
  } catch (error) {
    setBackend(false);
    renderAll();
    showToast("Could not update the task. " + error.message);
  }
}

// POST /api/reset
async function resetProgress() {
  try {
    await apiRequest("/api/reset", { method: "POST" });
    currentFilter = "all";
    await loadTasks(true);
    renderAll(true);
    showToast("Progress reset to the starting point.");
  } catch (error) {
    showToast("Could not reset. " + error.message);
  }
}

// While a request is on its way, stop double clicks.
function setButtonsBusy(id, busy) {
  document.querySelectorAll('[data-action][data-number="' + id + '"]').forEach(function (button) {
    button.disabled = busy;
    if (busy && button.dataset.action === "complete") {
      button.textContent = "Saving...";
    }
  });
}

/* ----------------------------------------------------------
   4. SMALL HELPER FUNCTIONS
   ---------------------------------------------------------- */

function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
}

function getLevel(difficulty) {
  return DIFFICULTY_LEVEL[difficulty] || 0;
}

function buildPips(difficulty) {
  return `<span class="level" data-level="${getLevel(difficulty)}" aria-hidden="true"><i></i><i></i><i></i></span>`;
}

function countByStatus(status) {
  return tasks.filter(function (task) { return task.status === status; }).length;
}

// 3 of 8 -> 37.5, 4 of 8 -> 50, 8 of 8 -> 100
function getPercent() {
  if (tasks.length === 0) {
    return 0;
  }
  return Math.round((countByStatus("completed") / tasks.length) * 1000) / 10;
}

// The overall status for the welcome section (conditional logic).
function getInternStatus() {
  const done = countByStatus("completed");
  if (done === tasks.length) {
    return "completed";
  } else if (done === 0 && countByStatus("in-progress") === 0) {
    return "not-started";
  } else {
    return "in-progress";
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 3500);
}

function focusTaskButton(id) {
  const button = document.querySelector(`#task-${id} [data-action="view"]`);
  if (button) {
    button.focus();
  }
}

/* ----------------------------------------------------------
   5. SHOWING THE DASHBOARD
   ---------------------------------------------------------- */

function renderWelcome() {
  document.getElementById("intern-name").textContent = INTERN.name;
  document.getElementById("intern-track").textContent = INTERN.track;
  document.getElementById("avatar").textContent = INTERN.name.charAt(0).toUpperCase();

  const badge = document.getElementById("intern-status");
  if (loadState === "ready") {
    const status = getInternStatus();
    badge.textContent = STATUS_LABELS[status];
    badge.dataset.state = status;
  } else {
    badge.textContent = loadState === "loading" ? "Loading..." : "Unavailable";
    badge.dataset.state = "not-started";
  }
}

function renderProgress() {
  const ready = loadState === "ready";
  const total = tasks.length;
  const done = countByStatus("completed");
  const percent = getPercent();
  const dash = "\u2013";

  document.getElementById("done-count").textContent = ready ? done : dash;
  document.getElementById("total-count").textContent = ready ? total : dash;
  document.getElementById("percent").textContent = ready ? percent + "%" : dash;
  document.getElementById("stat-total").textContent = ready ? total : dash;
  document.getElementById("stat-done").textContent = ready ? done : dash;
  document.getElementById("stat-left").textContent = ready ? total - done : dash;

  // the bar
  document.getElementById("bar-fill").style.width = ready ? percent + "%" : "0%";
  const bar = document.getElementById("bar");
  bar.setAttribute("aria-valuenow", ready ? percent : 0);
  bar.setAttribute("aria-valuetext", ready
    ? percent + " percent complete, " + done + " of " + total + " tasks"
    : "Progress not available yet");

  // one little numbered dot per task
  let dots = "";
  if (ready) {
    tasks.forEach(function (task) {
      dots += `<li class="dot dot-${task.status}" title="Task ${task.id}: ${STATUS_LABELS[task.status]}">${task.id}</li>`;
    });
  }
  document.getElementById("task-dots").innerHTML = dots;

  // the "current task" box
  const currentBox = document.getElementById("current-task");
  const current = tasks.find(function (task) { return task.status === "in-progress"; });
  if (ready && current) {
    currentBox.innerHTML = `
      <div>
        <p class="current-label">Current task</p>
        <p class="current-title">Task ${current.id} &middot; ${current.title}</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm" data-action="view" data-number="${current.id}">Continue Task ${icon("i-arrow-right")}</button>`;
  } else {
    currentBox.innerHTML = `
      <div>
        <p class="current-label">Current task</p>
        <p class="current-title">${ready ? "No task in progress" : "Waiting for your tasks..."}</p>
      </div>`;
  }

  // the celebration message
  document.getElementById("celebrate").hidden = !(ready && total > 0 && done === total);
}

function renderFilters() {
  filterButtons.forEach(function (button) {
    const filter = button.dataset.filter;
    const count = filter === "all" ? tasks.length : countByStatus(filter);
    button.setAttribute("aria-pressed", filter === currentFilter ? "true" : "false");
    button.querySelector(".count").textContent = loadState === "ready" ? count : "";
  });
}

function buildTaskCard(task, index, changedId) {
  const isDone = task.status === "completed";
  const justDone = task.id === changedId ? " just-completed" : "";
  const label = STATUS_LABELS[task.status];

  const mainButton = isDone
    ? `<button type="button" class="btn-text" data-action="undo" data-number="${task.id}">Undo</button>`
    : `<button type="button" class="btn btn-primary btn-sm" data-action="complete" data-number="${task.id}">Mark as Completed</button>`;

  return `
    <li class="task" id="task-${task.id}" data-status="${task.status}" style="--i:${index}">
      <article class="task-card${justDone}">
        <div class="task-head">
          <span class="task-num">TASK ${task.id}</span>
          <span class="pill pill-${task.status}"><span class="pill-icon">${isDone ? icon("i-check") : ""}</span><span class="sr-only">Status: </span>${label}</span>
        </div>
        <h3>${task.title}</h3>
        <p class="task-desc">${task.description}</p>
        <p class="task-meta"><span>Day ${task.day}</span>${buildPips(task.difficulty)}<span>${task.difficulty}</span></p>
        <div class="task-actions">
          <button type="button" class="btn btn-outline btn-sm" data-action="view" data-number="${task.id}" aria-haspopup="dialog" aria-label="View Task ${task.id}: ${task.title}">View Task</button>
          ${mainButton}
        </div>
      </article>
    </li>`;
}

// Loading message, error message, or nothing (when the tasks are ready).
function renderTrackerState() {
  if (loadState === "loading") {
    taskState.hidden = false;
    taskState.innerHTML = `
      <div class="state-box state-loading" role="status">
        <span class="spinner" aria-hidden="true"></span>
        <p>Loading tasks...</p>
      </div>`;
  } else if (loadState === "error") {
    taskState.hidden = false;
    taskState.innerHTML = `
      <div class="state-box state-error" role="alert">
        <h3>Unable to load tasks.</h3>
        <p>Please check your connection or try again.</p>
        <p class="state-hint">${errorMessage}</p>
        <button type="button" class="btn btn-primary" data-retry>Try again</button>
      </div>`;
  } else {
    taskState.hidden = true;
    taskState.innerHTML = "";
  }
}

// Draw the task cards that match the current filter.
function renderTasks(animate, changedId) {
  renderTrackerState();

  if (loadState !== "ready") {
    taskList.innerHTML = "";
    noTasks.hidden = true;
    taskCount.textContent = "";
    return;
  }

  const visible = tasks.filter(function (task) {
    return currentFilter === "all" || task.status === currentFilter;
  });

  let html = "";
  visible.forEach(function (task, index) {
    html += buildTaskCard(task, index, changedId);
  });
  taskList.innerHTML = html;
  taskList.classList.toggle("is-animated", animate === true);

  noTasks.hidden = visible.length !== 0;
  taskCount.textContent = "Showing " + visible.length + " of " + tasks.length + " tasks";
}

// Redraw everything that depends on the tasks.
function renderAll(animate, changedId) {
  renderWelcome();
  renderProgress();
  renderFilters();
  renderTasks(animate, changedId);
}

/* ----------------------------------------------------------
   6. TASK DETAILS (the dialog, filled from GET /api/tasks/:id)
   ---------------------------------------------------------- */

function buildTaskDetails(task) {
  let items = "";
  task.build.forEach(function (item) {
    items += `<li>${icon("i-check")}${item}</li>`;
  });
  const connects = task.connects
    ? `<p class="connects"><strong>Connects to:</strong> ${task.connects}</p>`
    : "";

  dialogContent.innerHTML = `
    <div class="dialog-badges">
      <span class="task-num">TASK ${task.id}</span>
      <span class="pill pill-${task.status}">${STATUS_LABELS[task.status]}</span>
    </div>
    <h2 id="task-dialog-title">${task.title}</h2>
    <p class="dialog-lead">${task.description}</p>
    <p class="task-meta"><span>Day ${task.day}</span>${buildPips(task.difficulty)}<span>${task.difficulty}</span></p>
    <h3 class="dialog-h">What you're expected to create</h3>
    <ul class="fit-list">${items}</ul>
    ${connects}
    <p class="api-note">Loaded from <code>GET /api/tasks/${task.id}</code></p>`;

  const mainButton = task.status === "completed"
    ? `<button type="button" class="btn btn-outline" data-action="undo" data-number="${task.id}">Undo completion</button>`
    : `<button type="button" class="btn btn-primary" data-action="complete" data-number="${task.id}">Mark as Completed</button>`;
  dialogActions.innerHTML = `${mainButton}<button type="button" class="btn btn-outline" data-close>Close</button>`;
}

function openDialog() {
  document.documentElement.classList.add("modal-open");
  if (!dialog.open) {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }
}

// Open the dialog straight away with a loading message, then ask the API for the task.
async function viewTask(id) {
  lastTaskId = id;
  dialogContent.innerHTML = `
    <h2 id="task-dialog-title" class="sr-only">Task details</h2>
    <div class="state-box state-loading" role="status">
      <span class="spinner" aria-hidden="true"></span>
      <p>Loading task...</p>
    </div>`;
  dialogActions.innerHTML = `<button type="button" class="btn btn-outline" data-close>Close</button>`;
  dialogContent.scrollTop = 0;
  openDialog();

  try {
    const task = await apiRequest("/api/tasks/" + id);   // GET /api/tasks/3
    setBackend(true);
    buildTaskDetails(task);
  } catch (error) {
    setBackend(false);
    dialogContent.innerHTML = `
      <h2 id="task-dialog-title">Unable to load this task.</h2>
      <p class="dialog-lead">Please check your connection or try again.</p>
      <p class="state-hint">${error.message}</p>`;
  }
}

function closeTask() {
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
    afterClose();
  }
}

function afterClose() {
  document.documentElement.classList.remove("modal-open");
  if (lastTaskId !== null) {
    focusTaskButton(lastTaskId);   // put the keyboard back on that task
  }
}

/* ----------------------------------------------------------
   7. TECHNOLOGY EXPLORER
   ---------------------------------------------------------- */

function buildTechnology(tech) {
  let body = "";

  if (tech.technologies) {
    // The backend panel: a simple flow, then the technologies.
    let flow = "";
    tech.flow.forEach(function (step, index) {
      flow += `<li class="flow-step">${step}</li>`;
      if (index < tech.flow.length - 1) {
        flow += `<li class="flow-arrow" aria-hidden="true">${icon("i-arrow-right")}</li>`;
      }
    });

    let cards = "";
    tech.technologies.forEach(function (item) {
      cards += `<li class="tech-card"><h4>${item[0]}</h4><p>${item[1]}</p></li>`;
    });

    body = `
      <div class="tech-main">
        <p class="tech-about">${tech.about}</p>
        <h3 class="tech-h">How the frontend and backend connect</h3>
        <ol class="flow" aria-label="Request flow">${flow}</ol>
        <p class="flow-note">The frontend sends a request, the backend reads or saves data in the database, and the answer travels back to the page.</p>
      </div>
      <div class="tech-wide">
        <h3 class="tech-h">Backend technologies</h3>
        <ul class="tech-cards">${cards}</ul>
      </div>`;
  } else {
    let used = "";
    tech.usedFor.forEach(function (item) {
      used += `<li>${icon("i-check")}${item}</li>`;
    });
    let facts = "";
    tech.facts.forEach(function (fact) {
      facts += `<div class="tech-fact"><dt>${fact[0]}</dt><dd>${fact[1]}</dd></div>`;
    });
    body = `
      <div class="tech-main">
        <p class="tech-about">${tech.about}</p>
        <h3 class="tech-h">Commonly used for</h3>
        <ul class="fit-list">${used}</ul>
      </div>
      <dl class="tech-facts">${facts}</dl>`;
  }

  return `
    <div class="tech-body">
      <h3 class="tech-title">${tech.name}</h3>
      <p class="tech-tagline">${tech.tagline}</p>
      <div class="tech-columns">${body}</div>
      <a class="btn btn-primary" href="${tech.url}" target="_blank" rel="noopener noreferrer">${tech.linkText} ${icon("i-external")}</a>
    </div>`;
}

function renderTech(key) {
  currentTech = key;
  techTabs.forEach(function (tab) {
    const selected = tab.dataset.tech === key;
    tab.setAttribute("aria-selected", selected ? "true" : "false");
    tab.tabIndex = selected ? 0 : -1;
  });
  techPanel.setAttribute("aria-labelledby", "tech-tab-" + key);
  techPanel.innerHTML = buildTechnology(TECHNOLOGIES[key]);
}

/* ----------------------------------------------------------
   8. EVENT LISTENERS
   ---------------------------------------------------------- */

// Buttons inside the page (task cards, the current-task box and "Try again").
document.addEventListener("click", function (event) {
  if (event.target.closest("[data-retry]")) {
    loadTasks();
    return;
  }

  if (event.target.closest("[data-recheck]")) {
    checkBackend();
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button || dialog.contains(button)) {
    return;
  }
  const id = Number(button.dataset.number);

  if (button.dataset.action === "view") {
    viewTask(id);
  } else if (button.dataset.action === "complete") {
    changeStatus(id, "completed");
  } else if (button.dataset.action === "undo") {
    changeStatus(id, "not-started");
  }
});

// Buttons inside the dialog, and a click on the dark area behind it.
dialog.addEventListener("click", function (event) {
  const action = event.target.closest("[data-action]");
  if (action) {
    const id = Number(action.dataset.number);
    closeTask();
    changeStatus(id, action.dataset.action === "complete" ? "completed" : "not-started");
    return;
  }
  if (event.target === dialog || event.target.closest("[data-close]")) {
    closeTask();
  }
});

// Runs when the dialog closes by any route (buttons, backdrop or the Esc key).
dialog.addEventListener("close", afterClose);

// Filters.
document.querySelector(".tracker-bar .seg").addEventListener("click", function (event) {
  const button = event.target.closest(".seg-btn");
  if (!button) {
    return;
  }
  currentFilter = button.dataset.filter;
  renderFilters();
  renderTasks(true);
});

document.getElementById("show-all").addEventListener("click", function () {
  currentFilter = "all";
  renderFilters();
  renderTasks(true);
});

document.getElementById("reset-progress").addEventListener("click", resetProgress);

// Technology explorer: click a button, or use the arrow keys.
techTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    renderTech(tab.dataset.tech);
  });
});

document.querySelector(".tech-tabs").addEventListener("keydown", function (event) {
  const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(event.key)) {
    return;
  }
  event.preventDefault();

  const list = Array.from(techTabs);
  const position = list.findIndex(function (tab) { return tab.dataset.tech === currentTech; });
  let next;
  if (event.key === "ArrowRight") {
    next = (position + 1) % list.length;
  } else if (event.key === "ArrowLeft") {
    next = (position - 1 + list.length) % list.length;
  } else if (event.key === "Home") {
    next = 0;
  } else {
    next = list.length - 1;
  }
  renderTech(list[next].dataset.tech);
  list[next].focus();
});

/* ----------------------------------------------------------
   9. START
   ---------------------------------------------------------- */

document.getElementById("challenge-total").textContent = CHALLENGE_SUMMARY.total;
document.getElementById("challenge-data").textContent = CHALLENGE_SUMMARY.data;
document.getElementById("challenge-web").textContent = CHALLENGE_SUMMARY.web;

renderTech(currentTech);
renderAll(false);          // shows the loading message straight away
loadTasks();               // asks the API for the tasks
checkBackend();            // lights up "Backend Status"
setInterval(checkBackend, 5000);
