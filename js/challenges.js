/* ==========================================================
   TechBridge Challenge Hub (Task 5)
   Plain JavaScript: no frameworks.

   How it works, in one line:
   every challenge is an object in the CHALLENGES array; the page
   keeps the visitor's choices in one "filters" object, and
   renderChallenges() redraws the cards that match those choices.

   What this file does:
   1. Track filter ........ All / Data Analytics / Web Development
   2. Difficulty filter ... All / Beginner / Intermediate / Advanced
   3. Challenge details ... "View Challenge" opens a dialog (no page refresh)
   Extras: search, live result count, filter counts, reset, and a
   "no results" message.
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   1. DATA
   To add or edit a challenge, change this list and nothing else.
   track must be "data" or "web".
   difficulty must be "Beginner", "Intermediate" or "Advanced".
   ---------------------------------------------------------- */

const TRACK_INFO = {
  data: { name: "Data Analytics", icon: "i-chart", hash: "data-analytics" },
  web:  { name: "Web Development", icon: "i-code",  hash: "web-development" }
};

const DIFFICULTY_LEVEL = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };

const CHALLENGES = [
  /* ---------- DATA ANALYTICS ---------- */
  {
    id: "monthly-sales-analysis",
    name: "Monthly Sales Analysis",
    track: "data",
    difficulty: "Beginner",
    summary: "Explore a small sales dataset, clean it up and find out which products and months perform best.",
    outcome: "A one-page summary of monthly sales with simple charts and three clear findings.",
    objective: "Use a spreadsheet to organise, clean and summarise sales data, then explain what the numbers say about the business.",
    skills: ["Spreadsheet formulas", "Sorting and filtering", "Basic data cleaning", "Simple charts"],
    tools: ["Excel or Google Sheets"],
    produce: [
      "A cleaned sales spreadsheet",
      "Monthly totals and a best-sellers table",
      "Two or three charts",
      "A short written summary of your findings"
    ],
    time: "2\u20133 hours",
    result: "A clear sales summary that a manager could read in two minutes."
  },
  {
    id: "expense-analysis",
    name: "Expense Analysis",
    track: "data",
    difficulty: "Beginner",
    summary: "Sort a list of expenses into categories and show where the money goes each month.",
    outcome: "A categorised expense sheet with a chart of spending by category and one clear recommendation.",
    objective: "Group expenses into categories, calculate totals and percentages, and spot the biggest areas of spending.",
    skills: ["Spreadsheet formulas", "Categorising data", "Percentages", "Data visualization"],
    tools: ["Excel or Google Sheets"],
    produce: [
      "A categorised expense table",
      "Totals and the percentage of spend for each category",
      "A bar or pie chart",
      "One written recommendation"
    ],
    time: "About 2 hours",
    result: "A simple expense report that shows at a glance where the money is going."
  },
  {
    id: "customer-analysis",
    name: "Customer Analysis",
    track: "data",
    difficulty: "Intermediate",
    summary: "Use SQL and a spreadsheet to understand who the customers are and how they buy.",
    outcome: "A short report that groups customers by behaviour and suggests one action for each group.",
    objective: "Query customer and order tables, group customers by how often and how much they buy, and describe each group.",
    skills: ["SQL (SELECT, WHERE, GROUP BY, JOIN)", "Data cleaning", "Summarising data", "Business-focused analysis"],
    tools: ["SQL (any database)", "Excel or Google Sheets"],
    produce: [
      "The SQL queries you wrote",
      "A table of customer groups",
      "A one-page summary with recommendations"
    ],
    time: "3\u20134 hours",
    result: "A customer report that tells the business who its best customers are and how to keep them."
  },
  {
    id: "business-dashboard",
    name: "Business Performance Dashboard",
    track: "data",
    difficulty: "Intermediate",
    summary: "Turn a year of monthly business figures into a dashboard that tells a clear story.",
    outcome: "A single-page dashboard with key figures and charts that a manager can read at a glance.",
    objective: "Choose the most important measures for a small business and present them in a clear, well-organised dashboard.",
    skills: ["Data visualization", "Choosing the right chart", "Summarising data", "Business-focused analysis"],
    tools: ["Excel or Google Sheets", "A charting tool of your choice"],
    produce: [
      "A cleaned data sheet",
      "A dashboard with three to five key figures",
      "At least three charts",
      "A short note explaining what the dashboard shows"
    ],
    time: "3\u20134 hours",
    result: "A dashboard that answers \u201chow is the business doing?\u201d in one page."
  },
  {
    id: "customer-churn-analysis",
    name: "Customer Churn Analysis",
    track: "data",
    difficulty: "Advanced",
    summary: "Find out why customers leave and which customers are most at risk of leaving next.",
    outcome: "A report showing the churn rate, the main factors linked to customers leaving, and recommended actions.",
    objective: "Combine SQL and spreadsheet analysis to measure churn, compare customers who stayed with those who left, and recommend how to keep more of them.",
    skills: ["Advanced SQL (joins, grouping, filtering)", "Data cleaning", "Comparing groups", "Data visualization", "Business-focused analysis"],
    tools: ["SQL (any database)", "Excel or Google Sheets"],
    produce: [
      "The SQL queries behind your numbers",
      "The churn rate by month or customer group",
      "Charts comparing customers who stayed and customers who left",
      "A summary of recommendations"
    ],
    time: "4\u20136 hours",
    result: "A churn report with evidence-based suggestions for keeping customers."
  },

  /* ---------- WEB DEVELOPMENT ---------- */
  {
    id: "responsive-landing-page",
    name: "Responsive Landing Page",
    track: "web",
    difficulty: "Beginner",
    summary: "Build a one-page website for a small business that looks good on any screen.",
    outcome: "A responsive landing page with a hero section, a services section and a clear call-to-action, saved on GitHub.",
    objective: "Practise HTML structure and CSS layout by building a clean, mobile-friendly landing page.",
    skills: ["HTML structure", "CSS layout (Flexbox)", "Responsive design", "Git and GitHub basics"],
    tools: ["HTML and CSS", "A code editor", "Git and GitHub"],
    produce: [
      "An index.html file and a style.css file",
      "A page that works on both phone and desktop",
      "A GitHub repository with your code"
    ],
    time: "2\u20133 hours",
    result: "A polished one-page site that you could show to a small business owner."
  },
  {
    id: "contact-form",
    name: "Contact Form",
    track: "web",
    difficulty: "Beginner",
    summary: "Design an accessible contact form with clear labels and friendly feedback messages.",
    outcome: "A styled contact form that checks the required fields and tells the visitor what to fix.",
    objective: "Build a form using the right HTML input types, style it clearly and add basic JavaScript checks.",
    skills: ["HTML forms", "CSS styling", "Basic JavaScript validation", "Accessibility basics"],
    tools: ["HTML, CSS and JavaScript", "A code editor"],
    produce: [
      "A form with name, email and message fields",
      "Styling for focus, error and success states",
      "A short JavaScript file that checks the fields"
    ],
    time: "2\u20133 hours",
    result: "A form that is easy to fill in and gives helpful feedback."
  },
  {
    id: "portfolio-website",
    name: "Portfolio Website",
    track: "web",
    difficulty: "Intermediate",
    summary: "Create a multi-section personal portfolio that presents your work to visitors.",
    outcome: "A responsive portfolio with About, Projects and Contact sections, published online.",
    objective: "Plan and build a small multi-section website with a consistent design, then publish it.",
    skills: ["HTML and CSS", "Responsive design", "Design consistency", "Git and GitHub"],
    tools: ["HTML and CSS", "Git and GitHub", "A free hosting service"],
    produce: [
      "A multi-section portfolio website",
      "At least two project cards",
      "A live link and a GitHub repository"
    ],
    time: "4\u20135 hours",
    result: "A live portfolio you can share with employers and clients."
  },
  {
    id: "product-page",
    name: "Product Page",
    track: "web",
    difficulty: "Intermediate",
    summary: "Build a product page with an image gallery, product details and an add-to-cart button that responds.",
    outcome: "A product page where thumbnails change the main image and the cart count updates when the button is clicked.",
    objective: "Combine layout, styling and JavaScript to build a realistic product page.",
    skills: ["HTML and CSS layout", "JavaScript events", "DOM manipulation", "Responsive design"],
    tools: ["HTML, CSS and JavaScript", "A code editor"],
    produce: [
      "A responsive product page",
      "A gallery that changes the main image",
      "A cart count that updates when the button is clicked"
    ],
    time: "3\u20134 hours",
    result: "A product page that looks professional and reacts to what the visitor does."
  },
  {
    id: "interactive-task-manager",
    name: "Interactive Task Manager",
    track: "web",
    difficulty: "Advanced",
    summary: "Build a small to-do app that adds, completes and removes tasks, and remembers them.",
    outcome: "A working task manager that saves tasks in the browser, so they are still there after a refresh.",
    objective: "Use JavaScript to manage data, update the page and store information in the browser.",
    skills: ["JavaScript arrays and objects", "DOM manipulation", "Event handling", "Browser storage", "Git and GitHub"],
    tools: ["HTML, CSS and JavaScript", "Git and GitHub"],
    produce: [
      "A responsive task manager interface",
      "Add, complete and delete features",
      "Tasks saved with localStorage",
      "A GitHub repository with a clear README"
    ],
    time: "4\u20136 hours",
    result: "A small app that feels like a real product and keeps your data."
  }
];

/* ----------------------------------------------------------
   2. STATE AND PAGE ELEMENTS
   ---------------------------------------------------------- */

// The visitor's current choices. Everything on the page follows this object.
const filters = {
  track: "all",        // "all", "data" or "web"
  difficulty: "all",   // "all", "Beginner", "Intermediate" or "Advanced"
  query: ""            // text typed into the search box
};

// The button that opened the dialog, so focus can go back to it when it closes.
let lastTrigger = null;

const grid = document.getElementById("challenge-grid");
const resultCount = document.getElementById("result-count");
const noResults = document.getElementById("no-results");
const searchInput = document.getElementById("search");
const filterButtons = document.querySelectorAll(".seg-btn");
const resetButtons = document.querySelectorAll("[data-reset]");
const dialog = document.getElementById("challenge-dialog");
const dialogContent = document.getElementById("dialog-content");

/* ----------------------------------------------------------
   3. FILTER LOGIC
   ---------------------------------------------------------- */

// Does one challenge pass a set of filters? (true = show it)
function matches(challenge, f) {
  if (f.track !== "all" && challenge.track !== f.track) {
    return false;
  }
  if (f.difficulty !== "all" && challenge.difficulty !== f.difficulty) {
    return false;
  }
  if (f.query !== "") {
    const text = [
      challenge.name,
      challenge.summary,
      challenge.skills.join(" "),
      challenge.tools.join(" ")
    ].join(" ").toLowerCase();
    if (!text.includes(f.query.toLowerCase())) {
      return false;
    }
  }
  return true;
}

// How many challenges would show if one filter were changed?
// Used for the little numbers on the filter buttons.
function countFor(filterName, value) {
  const test = { track: filters.track, difficulty: filters.difficulty, query: filters.query };
  test[filterName] = value;
  return CHALLENGES.filter(function (challenge) { return matches(challenge, test); }).length;
}

function filtersAreActive() {
  return filters.track !== "all" || filters.difficulty !== "all" || filters.query !== "";
}

/* ----------------------------------------------------------
   4. BUILDING THE CARDS
   ---------------------------------------------------------- */

function icon(name) {
  return '<svg class="icon" aria-hidden="true"><use href="#' + name + '"/></svg>';
}

// The three little difficulty bars (1, 2 or 3 filled).
function buildPips(difficulty) {
  const level = DIFFICULTY_LEVEL[difficulty];
  return '<span class="level" data-level="' + level + '" aria-hidden="true"><i></i><i></i><i></i></span>';
}

function buildCard(challenge, index) {
  const track = TRACK_INFO[challenge.track];

  return (
    '<li class="challenge" data-track="' + challenge.track + '" style="--i:' + index + '">' +
      '<article class="challenge-card">' +
        '<div class="challenge-top">' +
          '<span class="track-badge track-' + challenge.track + '">' + icon(track.icon) + track.name + "</span>" +
          '<span class="difficulty">' + buildPips(challenge.difficulty) + "<span>" + challenge.difficulty + "</span></span>" +
        "</div>" +
        "<h3>" + challenge.name + "</h3>" +
        '<p class="challenge-summary">' + challenge.summary + "</p>" +
        '<div class="challenge-outcome">' +
          '<p class="outcome-label">Expected outcome</p>' +
          "<p>" + challenge.outcome + "</p>" +
        "</div>" +
        '<div class="challenge-foot">' +
          '<span class="time-chip">' + icon("i-clock") + challenge.time + "</span>" +
          '<button type="button" class="btn btn-primary btn-sm view-btn" data-id="' + challenge.id + '" aria-haspopup="dialog" aria-label="View Challenge: ' + challenge.name + '">' +
            "View Challenge" + icon("i-arrow-right") +
          "</button>" +
        "</div>" +
      "</article>" +
    "</li>"
  );
}

// Show the challenges that match the filters.
// animate = false while typing in the search box, so cards don't flicker.
function renderChallenges(animate) {
  const visible = CHALLENGES.filter(function (challenge) { return matches(challenge, filters); });

  // 1. the cards
  let html = "";
  visible.forEach(function (challenge, index) {
    html += buildCard(challenge, index);
  });
  grid.innerHTML = html;
  grid.classList.toggle("is-animated", animate !== false);

  // 2. the "Showing x of y" message and the "no results" box
  const word = visible.length === 1 ? "challenge" : "challenges";
  resultCount.textContent = "Showing " + visible.length + " of " + CHALLENGES.length + " " + word;
  noResults.hidden = visible.length !== 0;

  // 3. the filter buttons (pressed state and counts)
  filterButtons.forEach(function (button) {
    const name = button.dataset.filter;
    const value = button.dataset.value;
    button.setAttribute("aria-pressed", filters[name] === value ? "true" : "false");
    button.querySelector(".count").textContent = countFor(name, value);
  });

  // 4. the reset button only works when something is filtered
  document.getElementById("reset-filters").disabled = !filtersAreActive();
}

/* ----------------------------------------------------------
   5. CHALLENGE DETAILS (the dialog)
   ---------------------------------------------------------- */

function buildChips(list) {
  let html = "";
  list.forEach(function (item) {
    html += "<li>" + item + "</li>";
  });
  return '<ul class="chips">' + html + "</ul>";
}

function buildDetails(challenge) {
  const track = TRACK_INFO[challenge.track];

  let produce = "";
  challenge.produce.forEach(function (item) {
    produce += "<li>" + icon("i-check") + item + "</li>";
  });

  return (
    '<div class="dialog-badges">' +
      '<span class="track-badge track-' + challenge.track + '">' + icon(track.icon) + track.name + "</span>" +
      '<span class="difficulty">' + buildPips(challenge.difficulty) + "<span>" + challenge.difficulty + "</span></span>" +
    "</div>" +
    '<h2 id="dialog-title">' + challenge.name + "</h2>" +
    '<p class="dialog-lead">' + challenge.summary + "</p>" +

    '<h3 class="dialog-h">Objective</h3>' +
    "<p>" + challenge.objective + "</p>" +

    '<div class="dialog-columns">' +
      "<div>" +
        '<h3 class="dialog-h">Skills required</h3>' + buildChips(challenge.skills) +
      "</div>" +
      "<div>" +
        '<h3 class="dialog-h">Tools that may be used</h3>' + buildChips(challenge.tools) +
      "</div>" +
    "</div>" +

    '<h3 class="dialog-h">What you need to produce</h3>' +
    '<ul class="fit-list">' + produce + "</ul>" +

    '<div class="dialog-facts">' +
      '<div class="dialog-fact"><p class="outcome-label">Estimated time</p><p>' + challenge.time + "</p></div>" +
      '<div class="dialog-fact"><p class="outcome-label">Expected result</p><p>' + challenge.result + "</p></div>" +
    "</div>"
  );
}

function openChallenge(id, trigger) {
  const challenge = CHALLENGES.find(function (item) { return item.id === id; });
  if (!challenge) {
    return;
  }

  lastTrigger = trigger;
  dialogContent.innerHTML = buildDetails(challenge);
  dialogContent.scrollTop = 0;
  document.documentElement.classList.add("modal-open");   // stops the page scrolling behind the dialog

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");                      // very old browsers
  }
}

function closeChallenge() {
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
    afterClose();
  }
}

function afterClose() {
  document.documentElement.classList.remove("modal-open");
  if (lastTrigger) {
    lastTrigger.focus();     // put the keyboard back where the visitor was
  }
}

/* ----------------------------------------------------------
   6. EVENT LISTENERS
   ---------------------------------------------------------- */

// Track and difficulty buttons (one listener for all of them).
document.querySelector(".filters").addEventListener("click", function (event) {
  const button = event.target.closest(".seg-btn");
  if (!button) {
    return;
  }
  filters[button.dataset.filter] = button.dataset.value;
  renderChallenges(true);
});

// Search box: update as the visitor types.
searchInput.addEventListener("input", function () {
  filters.query = searchInput.value.trim();
  renderChallenges(false);
});

// Both "Reset filters" buttons.
resetButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filters.track = "all";
    filters.difficulty = "all";
    filters.query = "";
    searchInput.value = "";
    renderChallenges(true);
  });
});

// "View Challenge" buttons (the cards are redrawn often, so listen on the grid).
grid.addEventListener("click", function (event) {
  const button = event.target.closest(".view-btn");
  if (button) {
    openChallenge(button.dataset.id, button);
  }
});

// Close buttons, and a click on the dark area behind the dialog.
dialog.addEventListener("click", function (event) {
  if (event.target === dialog || event.target.closest("[data-close]")) {
    closeChallenge();
  }
});

// Runs when the dialog closes by any route (buttons, backdrop or the Esc key).
dialog.addEventListener("close", afterClose);

// A link like challenges.html#data-analytics picks that track.
function trackFromAddress() {
  const hash = window.location.hash;
  if (hash === "#data-analytics") {
    return "data";
  } else if (hash === "#web-development") {
    return "web";
  } else {
    return null;
  }
}

window.addEventListener("hashchange", function () {
  const track = trackFromAddress();
  if (track) {
    filters.track = track;
    renderChallenges(true);
  }
});

/* ----------------------------------------------------------
   7. START
   ---------------------------------------------------------- */
const startTrack = trackFromAddress();
if (startTrack) {
  filters.track = startTrack;
}
renderChallenges(false);
