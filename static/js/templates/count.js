// Count the Objects Template (Math Subject)

import { BaseTemplate } from "./base.js";

const COUNT_EMOJIS = [
  "🍎", "🍌", "🍒", "🍇", "🍉", "🍓", "🍊", "🍋", "🍍", "🍐",
  "🐶", "🐱", "🦁", "🐯", "🐼", "🐨", "🦊", "🐸", "🐻", "🐷",
  "🚗", "🚌", "🚒", "✈️", "🚢", "⛵️", "🚲", "🚁", "🚂", "🚀",
  "⭐️", "🎈", "🎁", "🍦", "🍩", "🍪", "🍕", "🍔", "🍟", "🧁"
];

export class CountObjectsTemplate extends BaseTemplate {
  constructor() {
    super("count_objects", "Count the Objects", {
      columns: 2,
      rows: 3,
      max_count: 10, // 5, 10, or 20
      orientation: "portrait"
    });
  }

  generateState(resolvedConfig) {
    const count = resolvedConfig.columns * resolvedConfig.rows;
    const items = [];

    for (let i = 0; i < count; i++) {
      const emoji = COUNT_EMOJIS[Math.floor(Math.random() * COUNT_EMOJIS.length)];
      const targetCount = Math.floor(Math.random() * resolvedConfig.max_count) + 1; // 1 to max_count
      items.push({ emoji, count: targetCount });
    }

    return { items };
  }

  renderOptions(container, customConfig, onChange) {
    const config = this.resolveConfig(customConfig);

    container.innerHTML = `
      <div class="options-grid">
        <div class="form-group">
          <label>Orientation</label>
          <select id="count-opt-orientation" class="form-select">
            <option value="portrait" ${config.orientation === "portrait" ? "selected" : ""}>Portrait</option>
            <option value="landscape" ${config.orientation === "landscape" ? "selected" : ""}>Landscape</option>
          </select>
        </div>

        <div class="form-group">
          <label>Columns: <span id="val-count-cols" class="option-slider-val">${config.columns}</span></label>
          <input type="range" id="count-opt-cols" min="2" max="3" value="${config.columns}" class="form-input">
        </div>

        <div class="form-group">
          <label>Rows: <span id="val-count-rows" class="option-slider-val">${config.rows}</span></label>
          <input type="range" id="count-opt-rows" min="2" max="4" value="${config.rows}" class="form-input">
        </div>

        <div class="form-group">
          <label>Maximum Count</label>
          <select id="count-opt-max" class="form-select">
            <option value="5" ${config.max_count === 5 ? "selected" : ""}>Up to 5</option>
            <option value="10" ${config.max_count === 10 ? "selected" : ""}>Up to 10</option>
            <option value="20" ${config.max_count === 20 ? "selected" : ""}>Up to 20</option>
          </select>
        </div>
      </div>
    `;

    const getNewConfig = () => {
      return {
        orientation: container.querySelector("#count-opt-orientation").value,
        columns: parseInt(container.querySelector("#count-opt-cols").value),
        rows: parseInt(container.querySelector("#count-opt-rows").value),
        max_count: parseInt(container.querySelector("#count-opt-max").value)
      };
    };

    const triggers = [
      container.querySelector("#count-opt-orientation"),
      container.querySelector("#count-opt-cols"),
      container.querySelector("#count-opt-rows"),
      container.querySelector("#count-opt-max")
    ];

    triggers.forEach(el => {
      el.addEventListener("input", (e) => {
        if (e.target.id === "count-opt-cols") {
          container.querySelector("#val-count-cols").textContent = e.target.value;
        }
        if (e.target.id === "count-opt-rows") {
          container.querySelector("#val-count-rows").textContent = e.target.value;
        }
        onChange(getNewConfig());
      });
    });
  }

  render(container, state, resolvedConfig, options = { interactive: false }) {
    const headerHtml = this.renderHeader(
      "Count the Objects",
      "Count the friendly items in each box and write down the number below!",
      resolvedConfig.orientation
    );

    let cardsHtml = "";
    state.items.forEach((item, idx) => {
      let emojisListHtml = "";
      for (let i = 0; i < item.count; i++) {
        emojisListHtml += `<span class="count-single-emoji">${item.emoji}</span>`;
      }

      const answerHtml = options.interactive
        ? `
          <div class="count-answer-row">
            <span>How many?</span>
            <input type="number" class="count-input-box" data-idx="${idx}" autocomplete="off">
            <span class="correct-count-hint">Ans: ${item.count}</span>
          </div>
        `
        : `
          <div class="count-answer-row">
            <span>How many?</span>
            <span class="count-print-placeholder">______</span>
          </div>
        `;

      cardsHtml += `
        <div class="count-item-card">
          <div class="count-emojis-container">${emojisListHtml}</div>
          ${answerHtml}
        </div>
      `;
    });

    container.innerHTML = `
      ${headerHtml}
      <div class="sheet-body">
        <div class="count-grid" style="grid-template-columns: repeat(${resolvedConfig.columns}, 1fr);">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  validateAnswers(container, state, resolvedConfig) {
    const inputs = container.querySelectorAll(".count-input-box");
    let correctCount = 0;
    let totalCount = 0;

    inputs.forEach(input => {
      totalCount++;
      const idx = parseInt(input.dataset.idx);
      const studentAns = parseInt(input.value);
      const correctAns = state.items[idx].count;

      if (studentAns === correctAns) {
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
