// Papyro SPA Controller

import { API } from "./api.js";
import { MathGridTemplate } from "./templates/math.js";
import { WordSearchTemplate } from "./templates/search.js";
import { ConnectDotsTemplate } from "./templates/maze.js";
import { FillBlanksTemplate } from "./templates/blanks.js";
import { CountObjectsTemplate } from "./templates/count.js";
import { EmojiPatternTemplate } from "./templates/pattern.js";
import { NumberLearningTemplate } from "./templates/number.js";

// Initialize Template Registry
const TEMPLATE_REGISTRY = {
  math_grid: new MathGridTemplate(),
  word_search: new WordSearchTemplate(),
  connect_dots: new ConnectDotsTemplate(),
  fill_blanks: new FillBlanksTemplate(),
  count_objects: new CountObjectsTemplate(),
  emoji_pattern: new EmojiPatternTemplate(),
  number_learning: new NumberLearningTemplate()
};

// Global App State
let activeTemplate = null;
let customConfig = {};
let generatedState = null;
let isInteractive = false;
let isLoadedFromSaved = false; // If true, we lock state and only allow printing/interactive play
let activeSavedId = null;

// UI Elements
const selectSubject = document.getElementById("select-subject");
const templateListContainer = document.getElementById("template-list-container");
const dynamicOptionsContainer = document.getElementById("dynamic-options-container");
const btnGenerate = document.getElementById("btn-generate");
const btnSave = document.getElementById("btn-save");
const btnPrint = document.getElementById("btn-print");
const selectScale = document.getElementById("select-scale");
const chkInteractive = document.getElementById("chk-interactive");
const scoreBar = document.getElementById("score-bar");
const scoreText = document.getElementById("score-text");
const btnCheckAnswers = document.getElementById("btn-check-answers");
const btnResetInteractive = document.getElementById("btn-reset-interactive");
const btnToggleTheme = document.getElementById("btn-toggle-theme");

// Drawers & Modals
const btnShowBookmarks = document.getElementById("btn-show-bookmarks");
const bookmarksDrawer = document.getElementById("bookmarks-drawer");
const btnCloseDrawer = document.getElementById("btn-close-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const bookmarksList = document.getElementById("bookmarks-list");

const saveModal = document.getElementById("save-modal");
const inputSaveTitle = document.getElementById("input-save-title");
const btnSaveConfirm = document.getElementById("btn-save-confirm");
const btnSaveCancel = document.getElementById("btn-save-cancel");

const paperElement = document.getElementById("worksheet-paper");
const contentElement = document.getElementById("worksheet-content");
const viewportContainer = document.getElementById("worksheet-viewport");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  setupEventListeners();
  
  // Load templates from Registry and filter by default subject (math)
  filterTemplatesBySubject("math");
  
  // Select first template by default
  selectTemplate("math_grid");

  // Initial scaling fit
  handleScaling();
});

// --- Theme Management ---
function initTheme() {
  const savedTheme = localStorage.getItem("papyro-theme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
}

btnToggleTheme.addEventListener("click", () => {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", newTheme);
  localStorage.setItem("papyro-theme", newTheme);
});

// --- Template Filter ---
function filterTemplatesBySubject(subject) {
  templateListContainer.innerHTML = "";
  
  Object.values(TEMPLATE_REGISTRY).forEach(t => {
    // Basic categorization mappings
    const isMath = subject === "math" && (t.id === "math_grid" || t.id === "count_objects" || t.id === "number_learning");
    const isLogic = subject === "logic" && (t.id === "word_search" || t.id === "connect_dots");
    const isLanguage = subject === "language" && t.id === "fill_blanks";
    const isPatterns = subject === "patterns" && t.id === "emoji_pattern";
    
    if (isMath || isLogic || isLanguage || isPatterns) {
      const card = document.createElement("div");
      card.className = `template-card ${activeTemplate && activeTemplate.id === t.id ? "active" : ""}`;
      card.dataset.id = t.id;
      card.innerHTML = `
        <h4>${t.name}</h4>
        <p>${t.description}</p>
      `;
      card.addEventListener("click", () => selectTemplate(t.id));
      templateListContainer.appendChild(card);
    }
  });
}

selectSubject.addEventListener("change", (e) => {
  filterTemplatesBySubject(e.target.value);
  
  // Auto-select first in category
  const firstCard = templateListContainer.querySelector(".template-card");
  if (firstCard) {
    selectTemplate(firstCard.dataset.id);
  }
});

// --- Selection & Render Engine ---
function selectTemplate(templateId) {
  // Update UI Card highlight
  templateListContainer.querySelectorAll(".template-card").forEach(card => {
    if (card.dataset.id === templateId) card.classList.add("active");
    else card.classList.remove("active");
  });

  activeTemplate = TEMPLATE_REGISTRY[templateId];
  customConfig = {}; // Clear overrides for new template selection
  isLoadedFromSaved = false;
  activeSavedId = null;
  
  // Reset interactive check checkbox and visual checked class
  chkInteractive.checked = false;
  isInteractive = false;
  paperElement.classList.remove("checked");
  scoreBar.classList.add("hidden");

  // Render Left Options UI
  activeTemplate.renderOptions(dynamicOptionsContainer, customConfig, handleOptionChange);

  // Generate & Render main canvas
  generateAndRender();
}

function handleOptionChange(newConfig) {
  if (isLoadedFromSaved) return; // Prevent config shifts for saved, locked instances
  customConfig = newConfig;
  generateAndRender();
}

function generateAndRender() {
  const resolved = activeTemplate.resolveConfig(customConfig);
  
  // Set orientation attribute on physical paper for landscape sizing
  paperElement.setAttribute("data-orientation", resolved.orientation || "portrait");

  // Generate values only if we are NOT viewing a saved, locked version
  if (!isLoadedFromSaved) {
    generatedState = activeTemplate.generateState(resolved);
  }

  // Draw to A4 sheet preview
  activeTemplate.render(contentElement, generatedState, resolved, { interactive: isInteractive });

  // Recalculate scaling to fit screens
  handleScaling();
}

// Re-generate fresh numbers on clicking Generate
btnGenerate.addEventListener("click", () => {
  isLoadedFromSaved = false;
  activeSavedId = null;
  generateAndRender();
});

// --- Dynamic Scaling Engine ---
function handleScaling() {
  const scaleMode = selectScale.value;
  
  if (scaleMode === "auto") {
    const frameWidth = viewportContainer.parentElement.clientWidth;
    const isLandscape = paperElement.getAttribute("data-orientation") === "landscape";
    
    // Physical dimensions converted to pixels (A4 portrait: 210x297mm -> approx 793px wide at standard DPI scale)
    const targetWidth = isLandscape ? 297 * 3.7795 : 210 * 3.7795;
    
    if (frameWidth < targetWidth + 40) {
      // Shrink to fit viewport nicely
      const factor = (frameWidth - 40) / targetWidth;
      applyScaleFactor(factor);
    } else {
      applyScaleFactor(1.0); // Natural fit
    }
  } else {
    applyScaleFactor(parseFloat(scaleMode));
  }
}

function applyScaleFactor(factor) {
  paperElement.style.transform = `scale(${factor})`;
  paperElement.style.transformOrigin = "top center";
  
  // Calculate scaled height to prevent clipping or empty spacing underneath
  const baseHeight = paperElement.offsetHeight;
  viewportContainer.style.height = `${baseHeight * factor}px`;
}

selectScale.addEventListener("change", handleScaling);
window.addEventListener("resize", handleScaling);

// --- Interactive Mode & Grading ---
chkInteractive.addEventListener("change", (e) => {
  isInteractive = e.target.checked;
  paperElement.classList.remove("checked"); // Reset graded colors
  
  if (isInteractive) {
    scoreBar.classList.remove("hidden");
    scoreText.textContent = "Worksheet is live! Fill in the blanks or trace dots.";
  } else {
    scoreBar.classList.add("hidden");
  }

  // Rerender sheet with input controls
  generateAndRender();
});

// Listen for dynamic updates from sub-components (like word search found word events)
contentElement.addEventListener("worksheet-updated", () => {
  if (activeTemplate.id === "word_search") {
    const list = activeTemplate.foundWordsInSession;
    const total = generatedState.wordList.length;
    scoreText.textContent = `Progress: Found ${list.size} of ${total} words!`;
    if (list.size === total) {
      scoreText.textContent = `🎉 Congratulations! Found all ${total} words!`;
    }
  } else if (activeTemplate.id === "connect_dots") {
    scoreText.textContent = `🎉 Awesome! You connected all the dots!`;
  }
});

btnCheckAnswers.addEventListener("click", () => {
  paperElement.classList.add("checked");
  const result = activeTemplate.validateAnswers(contentElement, generatedState, activeTemplate.resolveConfig(customConfig));
  
  if (result) {
    scoreText.textContent = `Scored: ${result.correct} / ${result.total} correct!`;
  }
});

btnResetInteractive.addEventListener("click", () => {
  paperElement.classList.remove("checked");
  generateAndRender();
});

// --- Print Engine Trigger ---
btnPrint.addEventListener("click", () => {
  window.print();
});

// --- Save & Bookmark Drawer Operations ---
btnSave.addEventListener("click", () => {
  saveModal.classList.add("open");
  inputSaveTitle.value = `${activeTemplate.name} ${new Date().toLocaleDateString()}`;
  inputSaveTitle.focus();
});

btnSaveCancel.addEventListener("click", () => {
  saveModal.classList.remove("open");
});

btnSaveConfirm.addEventListener("click", async () => {
  const title = inputSaveTitle.value.trim();
  if (!title) return alert("Please enter a worksheet title.");

  try {
    const saved = await API.saveWorksheet(
      title,
      activeTemplate.id,
      customConfig,
      generatedState
    );
    saveModal.classList.remove("open");
    alert(`"${saved.title}" bookmarked successfully!`);
  } catch (err) {
    alert("Error saving worksheet: " + err.message);
  }
});

// Bookmark drawer opening
btnShowBookmarks.addEventListener("click", async () => {
  bookmarksDrawer.classList.add("open");
  loadBookmarks();
});

btnCloseDrawer.addEventListener("click", () => {
  bookmarksDrawer.classList.remove("open");
});
drawerOverlay.addEventListener("click", () => {
  bookmarksDrawer.classList.remove("open");
});

async function loadBookmarks() {
  bookmarksList.innerHTML = `<p class="placeholder-text">Loading saved bookmarks...</p>`;
  const savedList = await API.getSavedWorksheets();
  
  if (savedList.length === 0) {
    bookmarksList.innerHTML = `<p class="placeholder-text">No saved worksheets found.</p>`;
    return;
  }

  bookmarksList.innerHTML = "";
  savedList.forEach(ws => {
    const card = document.createElement("div");
    card.className = "bookmark-card";
    card.innerHTML = `
      <div class="bookmark-info">
        <h4>${ws.title}</h4>
        <div class="bookmark-meta">
          <span class="bookmark-tag">${ws.template_name}</span>
          <span class="bookmark-date">${new Date(ws.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="bookmark-actions">
        <button class="btn btn-secondary btn-sm load-btn" data-id="${ws.id}">Load/Print</button>
        <button class="btn btn-secondary btn-sm delete-btn" data-id="${ws.id}" style="color: var(--error);">Delete</button>
      </div>
    `;

    // Hook load click
    card.querySelector(".load-btn").addEventListener("click", () => {
      loadSavedWorksheetInstance(ws);
      bookmarksDrawer.classList.remove("open");
    });

    // Hook delete click
    card.querySelector(".delete-btn").addEventListener("click", async (e) => {
      if (confirm(`Are you sure you want to delete "${ws.title}"?`)) {
        await API.deleteWorksheet(ws.id);
        loadBookmarks(); // reload list
      }
    });

    bookmarksList.appendChild(card);
  });
}

function loadSavedWorksheetInstance(ws) {
  activeTemplate = TEMPLATE_REGISTRY[ws.template_id];
  customConfig = ws.custom_config;
  generatedState = ws.generated_state;
  isLoadedFromSaved = true;
  activeSavedId = ws.id;

  // Set subject filter in select dropdown
  let subject = "logic";
  if (ws.template_id === "math_grid" || ws.template_id === "count_objects" || ws.template_id === "number_learning") subject = "math";
  else if (ws.template_id === "fill_blanks") subject = "language";
  else if (ws.template_id === "emoji_pattern") subject = "patterns";
  
  selectSubject.value = subject;
  filterTemplatesBySubject(selectSubject.value);

  // Update card activation state
  templateListContainer.querySelectorAll(".template-card").forEach(card => {
    if (card.dataset.id === ws.template_id) card.classList.add("active");
    else card.classList.remove("active");
  });

  // Render left sidebar options container with options disabled or locked representation
  activeTemplate.renderOptions(dynamicOptionsContainer, customConfig, handleOptionChange);
  
  // Add a lock message overlay to dynamic options container
  const lockAlert = document.createElement("div");
  lockAlert.className = "placeholder-text";
  lockAlert.style.color = "var(--accent)";
  lockAlert.style.fontWeight = "bold";
  lockAlert.innerHTML = `🔒 Loaded Saved Worksheet<br><span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">Options are locked. Click "Generate" to customize a new sheet.</span>`;
  dynamicOptionsContainer.prepend(lockAlert);

  // Rerender sheet preview
  generateAndRender();
}
