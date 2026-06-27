// Number Learning Activity Template (Math Subject)

import { BaseTemplate } from "./base.js";

const NUMBER_WORDS = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"];
const FRUIT_EMOJIS = ["🍎", "🍓", "🍊", "🍋", "🍇", "🍒", "🍐", "🍉", "🍍", "🍌"];

export class NumberLearningTemplate extends BaseTemplate {
  constructor() {
    super("number_learning", "Number Practice (1-10)", {
      target_number: 5,
      orientation: "portrait"
    });
  }

  generateState(resolvedConfig) {
    const target = Math.min(10, Math.max(1, parseInt(resolvedConfig.target_number) || 5));
    const word = NUMBER_WORDS[target - 1];
    const fruit = FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)];

    // 1. Bubbles Grid (12 bubbles, Section 4)
    const bubbles = [];
    const distractorNums = Array.from({ length: 10 }, (_, i) => i + 1).filter(n => n !== target);
    for (let i = 0; i < 12; i++) {
      if (i < 4) {
        bubbles.push({ val: target, isTarget: true });
      } else {
        const randD = distractorNums[Math.floor(Math.random() * distractorNums.length)];
        bubbles.push({ val: randD, isTarget: false });
      }
    }
    bubbles.sort(() => Math.random() - 0.5);

    // 2. Dot Cards (3 cards, Section 6)
    const dotCards = [{ count: target, isTarget: true }];
    const availableDots = Array.from({ length: 10 }, (_, i) => i + 1).filter(n => n !== target);
    availableDots.sort(() => Math.random() - 0.5);
    dotCards.push({ count: availableDots[0], isTarget: false });
    dotCards.push({ count: availableDots[1], isTarget: false });
    dotCards.sort(() => Math.random() - 0.5);

    // 3. Word Choice Boxes (4 boxes, Section 7)
    const wordBoxes = [{ text: word, isTarget: true }];
    const distractorWords = NUMBER_WORDS.filter(w => w !== word).sort(() => Math.random() - 0.5);
    wordBoxes.push({ text: distractorWords[0], isTarget: false });
    wordBoxes.push({ text: distractorWords[1], isTarget: false });
    wordBoxes.push({ text: distractorWords[2], isTarget: false });
    wordBoxes.sort(() => Math.random() - 0.5);

    // 4. Bottom Line Boxes (12 boxes, Section 8)
    const bottomLine = [];
    for (let i = 0; i < 12; i++) {
      if (i < 4) {
        bottomLine.push({ val: target, isTarget: true });
      } else {
        const randD = distractorNums[Math.floor(Math.random() * distractorNums.length)];
        bottomLine.push({ val: randD, isTarget: false });
      }
    }
    bottomLine.sort(() => Math.random() - 0.5);

    return {
      target,
      word,
      fruit,
      bubbles,
      dotCards,
      wordBoxes,
      bottomLine
    };
  }

  renderOptions(container, customConfig, onChange) {
    const config = this.resolveConfig(customConfig);

    let numberOptionsHtml = "";
    for (let i = 1; i <= 10; i++) {
      numberOptionsHtml += `<option value="${i}" ${config.target_number === i ? "selected" : ""}>Number ${i} (${NUMBER_WORDS[i-1]})</option>`;
    }

    container.innerHTML = `
      <div class="options-grid">
        <div class="form-group">
          <label>Target Number</label>
          <select id="num-opt-target" class="form-select">
            ${numberOptionsHtml}
          </select>
        </div>

        <div class="form-group">
          <label>Orientation</label>
          <select id="num-opt-orientation" class="form-select">
            <option value="portrait" ${config.orientation === "portrait" ? "selected" : ""}>Portrait</option>
            <option value="landscape" ${config.orientation === "landscape" ? "selected" : ""}>Landscape</option>
          </select>
        </div>
      </div>
    `;

    const getNewConfig = () => {
      return {
        target_number: parseInt(container.querySelector("#num-opt-target").value),
        orientation: container.querySelector("#num-opt-orientation").value
      };
    };

    container.querySelector("#num-opt-target").addEventListener("change", () => onChange(getNewConfig()));
    container.querySelector("#num-opt-orientation").addEventListener("change", () => onChange(getNewConfig()));
  }

  render(container, state, resolvedConfig, options = { interactive: false }) {
    const headerHtml = this.renderHeader(
      `Number ${state.target} Practice Sheet`,
      `Learn to write, trace, count, and recognize number ${state.target}!`,
      resolvedConfig.orientation
    );

    // Section 1: Giant Numeral (1x3 box, col 1, rows 1..3)
    const sec1Html = `
      <div class="num-sec sec-1-giant">
        <div class="sec-label">1. Trace Number</div>
        <div class="giant-numeral">${state.target}</div>
      </div>
    `;

    // Section 2: Numeral Tracing Sub-grid (2x2 box, cols 2..3, rows 1..2)
    let traceBoxesHtml = "";
    for (let i = 0; i < 12; i++) {
      traceBoxesHtml += `<div class="trace-num-box">${state.target}</div>`;
    }
    const sec2Html = `
      <div class="num-sec sec-2-tracegrid">
        <div class="sec-label">2. More Tracing Practice</div>
        <div class="trace-6x2-grid">${traceBoxesHtml}</div>
      </div>
    `;

    // Section 3: Word Tracing (2x1 box, cols 2..3, row 3)
    const sec3Html = `
      <div class="num-sec sec-3-wordtrace">
        <div class="sec-label">3. Trace Word</div>
        <div class="word-trace-boxes">
          <div class="word-box">${state.word}</div>
          <div class="word-box">${state.word}</div>
          <div class="word-box">${state.word}</div>
        </div>
      </div>
    `;

    // Section 4: Bubbles Grid (1x2 box, col 1, rows 4..5)
    let bubblesHtml = "";
    state.bubbles.forEach((b, idx) => {
      bubblesHtml += `
        <div class="num-bubble" data-idx="${idx}" data-istarget="${b.isTarget}">
          ${b.val}
        </div>
      `;
    });
    const sec4Html = `
      <div class="num-sec sec-4-bubbles">
        <div class="sec-label">4. Find & Tick Number ${state.target}</div>
        <div class="bubbles-3x4-grid">${bubblesHtml}</div>
      </div>
    `;

    // Section 5: Color Fruits (2x1 box, cols 2..3, row 4)
    let fruitsHtml = "";
    for (let i = 0; i < 10; i++) {
      fruitsHtml += `<span class="fruit-item" data-fidx="${i}">${state.fruit}</span>`;
    }
    const sec5Html = `
      <div class="num-sec sec-5-fruits">
        <div class="sec-label">5. Color ${state.target} Fruits</div>
        <div class="fruits-row">${fruitsHtml}</div>
      </div>
    `;

    // Section 6: Dice / Dot Cards (1x1 box, col 2, row 5)
    let dotCardsHtml = "";
    state.dotCards.forEach((dc, idx) => {
      let dotsHtml = "";
      for (let d = 0; d < dc.count; d++) {
        dotsHtml += `<span class="card-dot"></span>`;
      }
      dotCardsHtml += `
        <div class="dot-card-box" data-didx="${idx}" data-istarget="${dc.isTarget}">
          <div class="dots-wrapper">${dotsHtml}</div>
        </div>
      `;
    });
    const sec6Html = `
      <div class="num-sec sec-6-dice">
        <div class="sec-label">6. Right Dot Group</div>
        <div class="dot-cards-list">${dotCardsHtml}</div>
      </div>
    `;

    // Section 7: Word Match Choice (1x1 box, col 3, row 5)
    let wordBoxesHtml = "";
    state.wordBoxes.forEach((wb, idx) => {
      wordBoxesHtml += `
        <div class="word-choice-box" data-widx="${idx}" data-istarget="${wb.isTarget}">
          ${wb.text}
        </div>
      `;
    });
    const sec7Html = `
      <div class="num-sec sec-7-wordmatch">
        <div class="sec-label">7. Match Word</div>
        <div class="word-2x2-grid">${wordBoxesHtml}</div>
      </div>
    `;

    // Section 8: Bottom Line Matching (3x1 box, cols 1..3, row 6)
    let lineBoxesHtml = "";
    state.bottomLine.forEach((bl, idx) => {
      lineBoxesHtml += `
        <div class="line-match-box" data-lidx="${idx}" data-istarget="${bl.isTarget}">
          ${bl.val}
        </div>
      `;
    });
    const sec8Html = `
      <div class="num-sec sec-8-bottomline">
        <div class="sec-label">8. Find all ${state.target}'s in the line below</div>
        <div class="bottom-12-line">${lineBoxesHtml}</div>
      </div>
    `;

    container.innerHTML = `
      ${headerHtml}
      <div class="sheet-body">
        <div class="number-learning-grid">
          ${sec1Html}
          ${sec2Html}
          ${sec3Html}
          ${sec4Html}
          ${sec5Html}
          ${sec6Html}
          ${sec7Html}
          ${sec8Html}
        </div>
      </div>
    `;

    if (options.interactive) {
      this.setupInteractiveHandlers(container, state);
    }
  }

  setupInteractiveHandlers(container, state) {
    // Interactive toggles for Bubbles (Section 4)
    container.querySelectorAll(".num-bubble").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("selected"));
    });

    // Interactive toggles for Fruits (Section 5)
    container.querySelectorAll(".fruit-item").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("colored"));
    });

    // Interactive toggles for Dot Cards (Section 6)
    container.querySelectorAll(".dot-card-box").forEach(el => {
      container.querySelectorAll(".dot-card-box").forEach(c => c.classList.remove("selected"));
      el.classList.add("selected");
    });

    // Interactive toggles for Word Boxes (Section 7)
    container.querySelectorAll(".word-choice-box").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("selected"));
    });

    // Interactive toggles for Bottom Line (Section 8)
    container.querySelectorAll(".line-match-box").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("selected"));
    });
  }

  validateAnswers(container, state, resolvedConfig) {
    let correct = 0;
    let total = 0;

    // Validate Bubbles (Section 4)
    container.querySelectorAll(".num-bubble").forEach(el => {
      total++;
      const isTarget = el.dataset.istarget === "true";
      const isSelected = el.classList.contains("selected");
      if ((isTarget && isSelected) || (!isTarget && !isSelected)) {
        correct++;
        if (isTarget) el.classList.add("correct-pick");
      } else if (isTarget && !isSelected) {
        el.classList.add("missed-pick");
      }
    });

    // Validate Fruits (Section 5)
    const coloredFruits = container.querySelectorAll(".fruit-item.colored").length;
    total++;
    if (coloredFruits === state.target) correct++;

    // Validate Dot Cards (Section 6)
    const selectedDot = container.querySelector(".dot-card-box.selected");
    total++;
    if (selectedDot && selectedDot.dataset.istarget === "true") {
      correct++;
      selectedDot.classList.add("correct-pick");
    }

    // Validate Word Choice (Section 7)
    container.querySelectorAll(".word-choice-box").forEach(el => {
      total++;
      const isTarget = el.dataset.istarget === "true";
      const isSelected = el.classList.contains("selected");
      if ((isTarget && isSelected) || (!isTarget && !isSelected)) {
        correct++;
        if (isTarget) el.classList.add("correct-pick");
      }
    });

    // Validate Bottom Line (Section 8)
    container.querySelectorAll(".line-match-box").forEach(el => {
      total++;
      const isTarget = el.dataset.istarget === "true";
      const isSelected = el.classList.contains("selected");
      if ((isTarget && isSelected) || (!isTarget && !isSelected)) {
        correct++;
        if (isTarget) el.classList.add("correct-pick");
      }
    });

    return { correct, total };
  }
}
