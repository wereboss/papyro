// Number Learning Activity Template (Math Subject) - Dual Puzzle Edition

import { BaseTemplate } from "./base.js";

const NUMBER_WORDS = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"];
const FRUIT_EMOJIS = ["🍎", "🍓", "🍊", "🍋", "🍇", "🍒", "🍐", "🍉", "🍍", "🍌"];

export class NumberLearningTemplate extends BaseTemplate {
  constructor() {
    super("number_learning", "Number Practice (1-10)", {
      target_number_1: 5,
      target_number_2: 8,
      orientation: "portrait"
    });
  }

  generateSinglePuzzleState(targetNum, pIdx) {
    const target = Math.min(10, Math.max(1, parseInt(targetNum) || 5));
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
      pIdx,
      target,
      word,
      fruit,
      bubbles,
      dotCards,
      wordBoxes,
      bottomLine
    };
  }

  generateState(resolvedConfig) {
    const t1 = resolvedConfig.target_number_1 !== undefined ? resolvedConfig.target_number_1 : (resolvedConfig.target_number || 5);
    const t2 = resolvedConfig.target_number_2 !== undefined ? resolvedConfig.target_number_2 : 8;

    const puzzle1 = this.generateSinglePuzzleState(t1, 0);
    const puzzle2 = this.generateSinglePuzzleState(t2, 1);

    return {
      puzzles: [puzzle1, puzzle2]
    };
  }

  renderOptions(container, customConfig, onChange) {
    const config = this.resolveConfig(customConfig);
    const t1 = config.target_number_1 !== undefined ? config.target_number_1 : (config.target_number || 5);
    const t2 = config.target_number_2 !== undefined ? config.target_number_2 : 8;

    let opts1Html = "";
    let opts2Html = "";
    for (let i = 1; i <= 10; i++) {
      opts1Html += `<option value="${i}" ${t1 === i ? "selected" : ""}>Number ${i} (${NUMBER_WORDS[i-1]})</option>`;
      opts2Html += `<option value="${i}" ${t2 === i ? "selected" : ""}>Number ${i} (${NUMBER_WORDS[i-1]})</option>`;
    }

    container.innerHTML = `
      <div class="options-grid">
        <div class="form-group">
          <label>Puzzle 1 Target</label>
          <select id="num-opt-target-1" class="form-select">
            ${opts1Html}
          </select>
        </div>

        <div class="form-group">
          <label>Puzzle 2 Target</label>
          <select id="num-opt-target-2" class="form-select">
            ${opts2Html}
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
        target_number_1: parseInt(container.querySelector("#num-opt-target-1").value),
        target_number_2: parseInt(container.querySelector("#num-opt-target-2").value),
        orientation: container.querySelector("#num-opt-orientation").value
      };
    };

    container.querySelector("#num-opt-target-1").addEventListener("change", () => onChange(getNewConfig()));
    container.querySelector("#num-opt-target-2").addEventListener("change", () => onChange(getNewConfig()));
    container.querySelector("#num-opt-orientation").addEventListener("change", () => onChange(getNewConfig()));
  }

  renderPuzzleHtml(p) {
    const sec1Html = `
      <div class="num-sec sec-1-giant">
        <div class="sec-label">1. Trace</div>
        <div class="giant-numeral">${p.target}</div>
      </div>
    `;

    let traceBoxesHtml = "";
    for (let i = 0; i < 12; i++) {
      traceBoxesHtml += `<div class="trace-num-box">${p.target}</div>`;
    }
    const sec2Html = `
      <div class="num-sec sec-2-tracegrid">
        <div class="sec-label">2. Tracing Grid</div>
        <div class="trace-6x2-grid">${traceBoxesHtml}</div>
      </div>
    `;

    const sec3Html = `
      <div class="num-sec sec-3-wordtrace">
        <div class="sec-label">3. Trace Word</div>
        <div class="word-trace-boxes">
          <div class="word-box">${p.word}</div>
          <div class="word-box">${p.word}</div>
          <div class="word-box">${p.word}</div>
        </div>
      </div>
    `;

    let bubblesHtml = "";
    p.bubbles.forEach((b, idx) => {
      bubblesHtml += `
        <div class="num-bubble" data-pidx="${p.pIdx}" data-idx="${idx}" data-istarget="${b.isTarget}">
          ${b.val}
        </div>
      `;
    });
    const sec4Html = `
      <div class="num-sec sec-4-bubbles">
        <div class="sec-label">4. Find ${p.target}</div>
        <div class="bubbles-3x4-grid">${bubblesHtml}</div>
      </div>
    `;

    let fruitsHtml = "";
    for (let i = 0; i < 10; i++) {
      fruitsHtml += `<span class="fruit-item" data-pidx="${p.pIdx}" data-fidx="${i}">${p.fruit}</span>`;
    }
    const sec5Html = `
      <div class="num-sec sec-5-fruits">
        <div class="sec-label">5. Color ${p.target} Fruits</div>
        <div class="fruits-row">${fruitsHtml}</div>
      </div>
    `;

    let dotCardsHtml = "";
    p.dotCards.forEach((dc, idx) => {
      let dotsHtml = "";
      for (let d = 0; d < dc.count; d++) {
        dotsHtml += `<span class="card-dot"></span>`;
      }
      dotCardsHtml += `
        <div class="dot-card-box" data-pidx="${p.pIdx}" data-didx="${idx}" data-istarget="${dc.isTarget}">
          <div class="dots-wrapper">${dotsHtml}</div>
        </div>
      `;
    });
    const sec6Html = `
      <div class="num-sec sec-6-dice">
        <div class="sec-label">6. Dot Group</div>
        <div class="dot-cards-list">${dotCardsHtml}</div>
      </div>
    `;

    let wordBoxesHtml = "";
    p.wordBoxes.forEach((wb, idx) => {
      wordBoxesHtml += `
        <div class="word-choice-box" data-pidx="${p.pIdx}" data-widx="${idx}" data-istarget="${wb.isTarget}">
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

    let lineBoxesHtml = "";
    p.bottomLine.forEach((bl, idx) => {
      lineBoxesHtml += `
        <div class="line-match-box" data-pidx="${p.pIdx}" data-lidx="${idx}" data-istarget="${bl.isTarget}">
          ${bl.val}
        </div>
      `;
    });
    const sec8Html = `
      <div class="num-sec sec-8-bottomline">
        <div class="sec-label">8. Find all ${p.target}'s below</div>
        <div class="bottom-12-line">${lineBoxesHtml}</div>
      </div>
    `;

    return `
      <div class="number-practice-card" data-pidx="${p.pIdx}">
        <div class="number-card-title">Number Practice: ${p.target} (${p.word})</div>
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
  }

  render(container, state, resolvedConfig, options = { interactive: false }) {
    const headerHtml = this.renderHeader(
      `Number Practice Activity Sheet`,
      `Learn to write, trace, count, and recognize numbers on this dual-puzzle page!`,
      resolvedConfig.orientation
    );

    let puzzlesHtml = "";
    state.puzzles.forEach(p => {
      puzzlesHtml += this.renderPuzzleHtml(p);
    });

    container.innerHTML = `
      ${headerHtml}
      <div class="sheet-body">
        <div class="number-puzzles-wrapper">
          ${puzzlesHtml}
        </div>
      </div>
    `;

    if (options.interactive) {
      this.setupInteractiveHandlers(container, state);
    }
  }

  setupInteractiveHandlers(container, state) {
    container.querySelectorAll(".num-bubble").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("selected"));
    });

    container.querySelectorAll(".fruit-item").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("colored"));
    });

    container.querySelectorAll(".number-practice-card").forEach((card, pIdx) => {
      card.querySelectorAll(".dot-card-box").forEach(el => {
        el.addEventListener("click", () => {
          card.querySelectorAll(".dot-card-box").forEach(c => c.classList.remove("selected"));
          el.classList.add("selected");
        });
      });
    });

    container.querySelectorAll(".word-choice-box").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("selected"));
    });

    container.querySelectorAll(".line-match-box").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("selected"));
    });
  }

  validateAnswers(container, state, resolvedConfig) {
    let correct = 0;
    let total = 0;

    state.puzzles.forEach(p => {
      const card = container.querySelector(`.number-practice-card[data-pidx="${p.pIdx}"]`);
      if (!card) return;

      // Validate Bubbles (Section 4)
      card.querySelectorAll(".num-bubble").forEach(el => {
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
      const coloredFruits = card.querySelectorAll(".fruit-item.colored").length;
      total++;
      if (coloredFruits === p.target) correct++;

      // Validate Dot Cards (Section 6)
      const selectedDot = card.querySelector(".dot-card-box.selected");
      total++;
      if (selectedDot && selectedDot.dataset.istarget === "true") {
        correct++;
        selectedDot.classList.add("correct-pick");
      }

      // Validate Word Choice (Section 7)
      card.querySelectorAll(".word-choice-box").forEach(el => {
        total++;
        const isTarget = el.dataset.istarget === "true";
        const isSelected = el.classList.contains("selected");
        if ((isTarget && isSelected) || (!isTarget && !isSelected)) {
          correct++;
          if (isTarget) el.classList.add("correct-pick");
        }
      });

      // Validate Bottom Line (Section 8)
      card.querySelectorAll(".line-match-box").forEach(el => {
        total++;
        const isTarget = el.dataset.istarget === "true";
        const isSelected = el.classList.contains("selected");
        if ((isTarget && isSelected) || (!isTarget && !isSelected)) {
          correct++;
          if (isTarget) el.classList.add("correct-pick");
        }
      });
    });

    return { correct, total };
  }
}
