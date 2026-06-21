// Fill in the Blanks Template (Language Subject)

import { BaseTemplate } from "./base.js";

const EMOJI_DICTIONARY = [
  { emoji: "🐶", name: "DOG" },
  { emoji: "🐱", name: "CAT" },
  { emoji: "🐷", name: "PIG" },
  { emoji: "🐮", name: "COW" },
  { emoji: "🦊", name: "FOX" },
  { emoji: "🐸", name: "FROG" },
  { emoji: "🦁", name: "LION" },
  { emoji: "🐻", name: "BEAR" },
  { emoji: "🐟", name: "FISH" },
  { emoji: "🦆", name: "DUCK" },
  { emoji: "🍎", name: "APPLE" },
  { emoji: "🍐", name: "PEAR" },
  { emoji: "🍋", name: "LEMON" },
  { emoji: "🍇", name: "GRAPE" },
  { emoji: "🍊", name: "ORANGE" },
  { emoji: "🍌", name: "BANANA" },
  { emoji: "🌹", name: "ROSE" },
  { emoji: "⭐️", name: "STAR" },
  { emoji: "🌙", name: "MOON" },
  { emoji: "🔴", name: "RED" },
  { emoji: "🔵", name: "BLUE" },
  { emoji: "🟢", name: "GREEN" },
  { emoji: "🦀", name: "CRAB" },
  { emoji: "🦉", name: "OWL" },
  { emoji: "🌲", name: "TREE" },
  { emoji: "🚗", name: "CAR" },
  { emoji: "🚌", name: "BUS" },
  { emoji: "🎂", name: "CAKE" },
  { emoji: "🥛", name: "MILK" },
  { emoji: "🥚", name: "EGG" }
];

export class FillBlanksTemplate extends BaseTemplate {
  constructor() {
    super("fill_blanks", "Fill in the Blanks", {
      columns: 3,
      rows: 4,
      difficulty: "medium", // "easy" (1 letter hidden), "medium" (half letters hidden), "hard" (all except 1 hidden)
      orientation: "portrait"
    });
  }

  generateState(resolvedConfig) {
    const count = resolvedConfig.columns * resolvedConfig.rows;
    
    // Shuffle dictionary
    const shuffled = [...EMOJI_DICTIONARY].sort(() => Math.random() - 0.5);
    const chosenItems = shuffled.slice(0, Math.min(count, shuffled.length));

    const items = chosenItems.map((item, itemIdx) => {
      const name = item.name;
      const len = name.length;
      const hiddenIndices = [];

      if (resolvedConfig.difficulty === "easy") {
        // Hide exactly 1 letter
        const hideIdx = Math.floor(Math.random() * len);
        hiddenIndices.push(hideIdx);
      } else if (resolvedConfig.difficulty === "hard") {
        // Hide all except 1 letter
        const keepIdx = Math.floor(Math.random() * len);
        for (let i = 0; i < len; i++) {
          if (i !== keepIdx) hiddenIndices.push(i);
        }
      } else {
        // Medium: Hide roughly half the letters
        const hideCount = Math.max(1, Math.ceil(len / 2));
        const indices = Array.from({ length: len }, (_, i) => i).sort(() => Math.random() - 0.5);
        for (let i = 0; i < hideCount; i++) {
          hiddenIndices.push(indices[i]);
        }
      }

      return {
        emoji: item.emoji,
        name: name,
        hiddenIndices: hiddenIndices.sort((a, b) => a - b)
      };
    });

    return { items };
  }

  renderOptions(container, customConfig, onChange) {
    const config = this.resolveConfig(customConfig);

    container.innerHTML = `
      <div class="options-grid">
        <div class="form-group">
          <label>Orientation</label>
          <select id="blanks-opt-orientation" class="form-select">
            <option value="portrait" ${config.orientation === "portrait" ? "selected" : ""}>Portrait</option>
            <option value="landscape" ${config.orientation === "landscape" ? "selected" : ""}>Landscape</option>
          </select>
        </div>

        <div class="form-group">
          <label>Columns: <span id="val-blanks-cols" class="option-slider-val">${config.columns}</span></label>
          <input type="range" id="blanks-opt-cols" min="2" max="4" value="${config.columns}" class="form-input">
        </div>

        <div class="form-group">
          <label>Rows: <span id="val-blanks-rows" class="option-slider-val">${config.rows}</span></label>
          <input type="range" id="blanks-opt-rows" min="2" max="6" value="${config.rows}" class="form-input">
        </div>

        <div class="form-group">
          <label>Difficulty</label>
          <select id="blanks-opt-diff" class="form-select">
            <option value="easy" ${config.difficulty === "easy" ? "selected" : ""}>Easy (Hide 1 letter)</option>
            <option value="medium" ${config.difficulty === "medium" ? "selected" : ""}>Medium (Hide half)</option>
            <option value="hard" ${config.difficulty === "hard" ? "selected" : ""}>Hard (Hide almost all)</option>
          </select>
        </div>
      </div>
    `;

    const getNewConfig = () => {
      return {
        orientation: container.querySelector("#blanks-opt-orientation").value,
        columns: parseInt(container.querySelector("#blanks-opt-cols").value),
        rows: parseInt(container.querySelector("#blanks-opt-rows").value),
        difficulty: container.querySelector("#blanks-opt-diff").value
      };
    };

    const triggers = [
      container.querySelector("#blanks-opt-orientation"),
      container.querySelector("#blanks-opt-cols"),
      container.querySelector("#blanks-opt-rows"),
      container.querySelector("#blanks-opt-diff")
    ];

    triggers.forEach(el => {
      el.addEventListener("input", (e) => {
        if (e.target.id === "blanks-opt-cols") {
          container.querySelector("#val-blanks-cols").textContent = e.target.value;
        }
        if (e.target.id === "blanks-opt-rows") {
          container.querySelector("#val-blanks-rows").textContent = e.target.value;
        }
        onChange(getNewConfig());
      });
    });
  }

  render(container, state, resolvedConfig, options = { interactive: false }) {
    const headerHtml = this.renderHeader(
      "Fill in the Blanks",
      "Look at the picture and spell the word by filling in the missing letters!",
      resolvedConfig.orientation
    );

    let itemsHtml = "";
    state.items.forEach((item, itemIdx) => {
      let wordHtml = "";
      
      for (let i = 0; i < item.name.length; i++) {
        const letter = item.name[i];
        const isHidden = item.hiddenIndices.includes(i);
        
        if (isHidden) {
          if (options.interactive) {
            wordHtml += `
              <div class="blank-letter-container">
                <input type="text" maxlength="1" class="blank-input-letter" data-item-idx="${itemIdx}" data-letter-idx="${i}" autocomplete="off">
                <span class="correct-blank-hint">${letter}</span>
              </div>
            `;
          } else {
            wordHtml += `<span class="print-blank-letter">_</span>`;
          }
        } else {
          wordHtml += `<span class="revealed-letter">${letter}</span>`;
        }
      }

      itemsHtml += `
        <div class="blank-item-card">
          <div class="blank-item-emoji">${item.emoji}</div>
          <div class="blank-item-word">${wordHtml}</div>
        </div>
      `;
    });

    container.innerHTML = `
      ${headerHtml}
      <div class="sheet-body">
        <div class="blanks-grid" style="grid-template-columns: repeat(${resolvedConfig.columns}, 1fr);">
          ${itemsHtml}
        </div>
      </div>
    `;

    if (options.interactive) {
      this.setupFocusAdvancement(container);
    }
  }

  setupFocusAdvancement(container) {
    const inputs = Array.from(container.querySelectorAll(".blank-input-letter"));
    inputs.forEach((input, idx) => {
      input.addEventListener("input", (e) => {
        // Auto capitalise input
        input.value = input.value.toUpperCase();
        
        // Advance focus to next input box automatically for keyboard ease
        if (input.value.length === 1 && idx < inputs.length - 1) {
          inputs[idx + 1].focus();
        }
      });

      // Handle backspace back-focusing
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value.length === 0 && idx > 0) {
          inputs[idx - 1].focus();
        }
      });
    });
  }

  validateAnswers(container, state, resolvedConfig) {
    const inputs = container.querySelectorAll(".blank-input-letter");
    let correctCount = 0;
    let totalCount = 0;

    inputs.forEach(input => {
      totalCount++;
      const itemIdx = parseInt(input.dataset.itemIdx);
      const letterIdx = parseInt(input.dataset.letterIdx);
      const studentLetter = input.value.trim().toUpperCase();
      const correctLetter = state.items[itemIdx].name[letterIdx];

      if (studentLetter === correctLetter) {
        input.classList.remove("incorrect");
        input.classList.add("correct");
        correctCount++;
      } else {
        input.classList.remove("correct");
        input.classList.add("incorrect");
      }
    });

    return {
      correct: correctCount,
      total: totalCount
    };
  }
}
