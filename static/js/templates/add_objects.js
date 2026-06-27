// Add the Objects Template (Math Subject)

import { BaseTemplate } from "./base.js";

const EMOJI_CATEGORIES = [
  // Fruits
  ["🍎", "🍌", "🍇", "🍊", "🍓", "🍉", "🍍", "🍒", "🍐", "🍋"],
  // Animals
  ["🐶", "🐱", "🦁", "🐻", "🐸", "🦊", "🐼", "🐨", "🐷", "🐮"],
  // Vehicles & Toys
  ["🚗", "✈️", "🚀", "⛵️", "🚲", "🚂", "🎈", "⭐️", "🌙", "🎁"],
  // Colors & Shapes
  ["🔴", "🔵", "🟢", "🟡", "🟠", "🟣", "⬛️", "⬜️", "🔶", "🔷"]
];

export class AddObjectsTemplate extends BaseTemplate {
  constructor() {
    super("add_objects", "Add the Objects", {
      challenges_count: 4,
      max_count: 10,
      orientation: "portrait"
    });
  }

  generateState(resolvedConfig) {
    const count = resolvedConfig.challenges_count;
    const maxVal = Math.min(10, Math.max(1, parseInt(resolvedConfig.max_count) || 10));
    const items = [];

    for (let c = 0; c < count; c++) {
      // Pick random category and emoji
      const cat = EMOJI_CATEGORIES[Math.floor(Math.random() * EMOJI_CATEGORIES.length)];
      const emojiA = cat[Math.floor(Math.random() * cat.length)];
      const emojiB = cat[Math.floor(Math.random() * cat.length)];

      const countA = Math.floor(Math.random() * maxVal) + 1;
      const countB = Math.floor(Math.random() * maxVal) + 1;
      const expectedSum = countA + countB;

      items.push({
        id: c,
        emojiA,
        countA,
        emojiB,
        countB,
        expectedSum
      });
    }

    return { items };
  }

  renderOptions(container, customConfig, onChange) {
    const config = this.resolveConfig(customConfig);

    container.innerHTML = `
      <div class="options-grid">
        <div class="form-group">
          <label>Orientation</label>
          <select id="add-opt-orientation" class="form-select">
            <option value="portrait" ${config.orientation === "portrait" ? "selected" : ""}>Portrait</option>
            <option value="landscape" ${config.orientation === "landscape" ? "selected" : ""}>Landscape</option>
          </select>
        </div>

        <div class="form-group">
          <label>Problems Count: <span id="val-add-count" class="option-slider-val">${config.challenges_count}</span></label>
          <input type="range" id="add-opt-count" min="2" max="8" step="2" value="${config.challenges_count}" class="form-input">
        </div>

        <div class="form-group">
          <label>Max Count Per Group</label>
          <select id="add-opt-maxcount" class="form-select">
            <option value="5" ${config.max_count === 5 ? "selected" : ""}>Up to 5</option>
            <option value="10" ${config.max_count === 10 ? "selected" : ""}>Up to 10</option>
          </select>
        </div>
      </div>
    `;

    const getNewConfig = () => {
      return {
        orientation: container.querySelector("#add-opt-orientation").value,
        challenges_count: parseInt(container.querySelector("#add-opt-count").value),
        max_count: parseInt(container.querySelector("#add-opt-maxcount").value)
      };
    };

    container.querySelector("#add-opt-count").addEventListener("input", (e) => {
      container.querySelector("#val-add-count").textContent = e.target.value;
      onChange(getNewConfig());
    });
    container.querySelector("#add-opt-orientation").addEventListener("change", () => onChange(getNewConfig()));
    container.querySelector("#add-opt-maxcount").addEventListener("change", () => onChange(getNewConfig()));
  }

  render(container, state, resolvedConfig, options = { interactive: false }) {
    const headerHtml = this.renderHeader(
      "Add the Objects",
      "Count the emojis in each set, add them together, and write down the total number!",
      resolvedConfig.orientation
    );

    let cardsHtml = "";
    state.items.forEach((item, idx) => {
      let groupAHtml = "";
      for (let a = 0; a < item.countA; a++) {
        groupAHtml += `<span class="add-emoji-item">${item.emojiA}</span>`;
      }

      let groupBHtml = "";
      for (let b = 0; b < item.countB; b++) {
        groupBHtml += `<span class="add-emoji-item">${item.emojiB}</span>`;
      }

      const inputHtml = options.interactive
        ? `<input type="number" class="add-ans-input" data-idx="${idx}" min="0" max="30" placeholder="?">`
        : `<div class="add-blank-box"></div>`;

      cardsHtml += `
        <div class="add-item-card" data-idx="${idx}">
          <div class="add-card-header">Problem #${idx + 1}</div>
          <div class="add-equation-row">
            <div class="add-group-box">${groupAHtml}</div>
            <div class="add-operator">+</div>
            <div class="add-group-box">${groupBHtml}</div>
            <div class="add-operator">=</div>
            <div class="add-answer-wrapper">
              ${inputHtml}
              <span class="correct-hint hidden">${item.expectedSum}</span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      ${headerHtml}
      <div class="sheet-body">
        <div class="add-workspace-list">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  validateAnswers(container, state, resolvedConfig) {
    let correct = 0;
    const total = state.items.length;

    container.querySelectorAll(".add-ans-input").forEach(input => {
      const idx = parseInt(input.dataset.idx);
      const val = parseInt(input.value);
      const expected = state.items[idx].expectedSum;
      const card = input.closest(".add-item-card");
      const hint = card.querySelector(".correct-hint");

      if (!isNaN(val) && val === expected) {
        correct++;
        input.classList.remove("wrong");
        input.classList.add("correct");
        if (hint) hint.classList.add("hidden");
      } else {
        input.classList.remove("correct");
        input.classList.add("wrong");
        if (hint) hint.classList.remove("hidden");
      }
    });

    return { correct, total };
  }
}
