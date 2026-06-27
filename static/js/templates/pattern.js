// Emoji Pattern Path Template (Patterns Subject)

import { BaseTemplate } from "./base.js";

const EMOJI_POOL = [
  "🍎", "🍌", "🍇", "🍊", "🍓", "🍉", "🍍", "🍒", "🍋", "🍐",
  "🐶", "🐱", "🦁", "🐻", "🐸", "🦊", "🐼", "🐨", "🐷", "🐮",
  "🚗", "✈️", "🚀", "⛵️", "🚲", "🚂", "🎈", "⭐️", "🌙", "🎁"
];

export class EmojiPatternTemplate extends BaseTemplate {
  constructor() {
    super("emoji_pattern", "Emoji Pattern Path", {
      challenges_count: 3,
      grid_columns: 2,
      grid_rows: 2,
      orientation: "portrait"
    });
  }

  generateState(resolvedConfig) {
    const count = resolvedConfig.challenges_count;
    const cols = resolvedConfig.grid_columns;
    const rows = resolvedConfig.grid_rows;
    const seqLen = cols * rows;

    const challenges = [];

    for (let c = 0; c < count; c++) {
      // Pick seqLen unique random emojis
      const poolShuffled = [...EMOJI_POOL].sort(() => Math.random() - 0.5);
      const sequence = poolShuffled.slice(0, seqLen);

      // Create exact match grid by shuffling sequence
      const grid = [...sequence].sort(() => Math.random() - 0.5);

      challenges.push({
        id: c,
        sequence,
        grid,
        cols,
        rows
      });
    }

    return { challenges };
  }

  renderOptions(container, customConfig, onChange) {
    const config = this.resolveConfig(customConfig);

    container.innerHTML = `
      <div class="options-grid">
        <div class="form-group">
          <label>Orientation</label>
          <select id="pattern-opt-orientation" class="form-select">
            <option value="portrait" ${config.orientation === "portrait" ? "selected" : ""}>Portrait</option>
            <option value="landscape" ${config.orientation === "landscape" ? "selected" : ""}>Landscape</option>
          </select>
        </div>

        <div class="form-group">
          <label>Challenges Count: <span id="val-pattern-count" class="option-slider-val">${config.challenges_count}</span></label>
          <input type="range" id="pattern-opt-count" min="1" max="4" value="${config.challenges_count}" class="form-input">
        </div>

        <div class="form-group">
          <label>Grid Layout Size</label>
          <select id="pattern-opt-gridsize" class="form-select">
            <option value="2x2" ${config.grid_columns === 2 && config.grid_rows === 2 ? "selected" : ""}>2x2 Grid (4 Emojis)</option>
            <option value="3x2" ${config.grid_columns === 3 && config.grid_rows === 2 ? "selected" : ""}>3x2 Grid (6 Emojis)</option>
            <option value="3x3" ${config.grid_columns === 3 && config.grid_rows === 3 ? "selected" : ""}>3x3 Grid (9 Emojis)</option>
            <option value="3x4" ${config.grid_columns === 3 && config.grid_rows === 4 ? "selected" : ""}>3x4 Grid (12 Emojis)</option>
          </select>
        </div>
      </div>
    `;

    const getNewConfig = () => {
      const sizeVal = container.querySelector("#pattern-opt-gridsize").value;
      const [cols, rows] = sizeVal.split("x").map(Number);

      return {
        orientation: container.querySelector("#pattern-opt-orientation").value,
        challenges_count: parseInt(container.querySelector("#pattern-opt-count").value),
        grid_columns: cols,
        grid_rows: rows
      };
    };

    const triggers = [
      container.querySelector("#pattern-opt-orientation"),
      container.querySelector("#pattern-opt-count"),
      container.querySelector("#pattern-opt-gridsize")
    ];

    triggers.forEach(el => {
      el.addEventListener("input", (e) => {
        if (e.target.id === "pattern-opt-count") {
          container.querySelector("#val-pattern-count").textContent = e.target.value;
        }
        onChange(getNewConfig());
      });
      el.addEventListener("change", () => {
        onChange(getNewConfig());
      });
    });
  }

  render(container, state, resolvedConfig, options = { interactive: false }) {
    const headerHtml = this.renderHeader(
      "Emoji Pattern Path",
      "Look at the target sequence line, then connect the matching emojis in the grid in the exact same order!",
      resolvedConfig.orientation
    );

    let challengesHtml = "";
    state.challenges.forEach((ch, cIdx) => {
      // 1. Render Top Sequence Line with arrows
      let seqLineHtml = "";
      ch.sequence.forEach((emoji, sIdx) => {
        seqLineHtml += `<span class="pattern-seq-emoji">${emoji}</span>`;
        if (sIdx < ch.sequence.length - 1) {
          seqLineHtml += `<span class="pattern-arrow">➔</span>`;
        }
      });

      // 2. Render Scattered Grid Items
      let gridNodesHtml = "";
      ch.grid.forEach((emoji, gIdx) => {
        gridNodesHtml += `
          <div class="pattern-grid-node" data-cidx="${cIdx}" data-gidx="${gIdx}" data-emoji="${emoji}">
            <span class="node-emoji">${emoji}</span>
          </div>
        `;
      });

      challengesHtml += `
        <div class="pattern-challenge-card" data-cidx="${cIdx}">
          <div class="pattern-challenge-title">Pattern #${cIdx + 1}</div>
          <div class="pattern-sequence-bar">
            ${seqLineHtml}
          </div>
          <div class="pattern-grid-wrapper">
            <svg class="pattern-svg-overlay" id="pattern-svg-${cIdx}">
              <g class="pattern-lines-group"></g>
            </svg>
            <div class="pattern-nodes-grid" style="grid-template-columns: repeat(${ch.cols}, 1fr); grid-template-rows: repeat(${ch.rows}, 1fr);">
              ${gridNodesHtml}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      ${headerHtml}
      <div class="sheet-body">
        <div class="pattern-workspace-list">
          ${challengesHtml}
        </div>
      </div>
    `;

    if (options.interactive) {
      this.setupInteractiveHandlers(container, state);
    }
  }

  setupInteractiveHandlers(container, state) {
    this.challengeProgress = state.challenges.map(() => ({
      step: 0,
      pathNodes: [],
      completed: false
    }));

    const cards = container.querySelectorAll(".pattern-challenge-card");

    cards.forEach(card => {
      const cIdx = parseInt(card.dataset.cidx);
      const ch = state.challenges[cIdx];
      const nodes = card.querySelectorAll(".pattern-grid-node");
      const svgGroup = card.querySelector(`#pattern-svg-${cIdx} .pattern-lines-group`);

      const drawLineBetweenNodes = (fromNode, toNode) => {
        const rect1 = fromNode.getBoundingClientRect();
        const rect2 = toNode.getBoundingClientRect();
        const svgRect = card.querySelector(`#pattern-svg-${cIdx}`).getBoundingClientRect();

        const x1 = (rect1.left + rect1.width / 2) - svgRect.left;
        const y1 = (rect1.top + rect1.height / 2) - svgRect.top;
        const x2 = (rect2.left + rect2.width / 2) - svgRect.left;
        const y2 = (rect2.top + rect2.height / 2) - svgRect.top;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "var(--success)");
        line.setAttribute("stroke-width", "4");
        line.setAttribute("stroke-linecap", "round");
        svgGroup.appendChild(line);
      };

      nodes.forEach(nodeEl => {
        nodeEl.addEventListener("click", () => {
          const prog = this.challengeProgress[cIdx];
          if (prog.completed) return;

          const emoji = nodeEl.dataset.emoji;
          const expectedEmoji = ch.sequence[prog.step];

          if (emoji === expectedEmoji && !nodeEl.classList.contains("connected")) {
            // Correct click!
            nodeEl.classList.add("connected");
            
            if (prog.step > 0) {
              const prevNode = prog.pathNodes[prog.pathNodes.length - 1];
              drawLineBetweenNodes(prevNode, nodeEl);
            }
            
            prog.pathNodes.push(nodeEl);
            prog.step++;

            if (prog.step === ch.sequence.length) {
              prog.completed = true;
              card.classList.add("challenge-done");
              container.dispatchEvent(new CustomEvent("worksheet-updated"));
            }
          } else if (emoji !== expectedEmoji) {
            // Wrong node click feedback
            nodeEl.classList.add("wrong-pulse");
            setTimeout(() => nodeEl.classList.remove("wrong-pulse"), 400);
          }
        });
      });
    });
  }

  validateAnswers(container, state, resolvedConfig) {
    let completedCount = 0;

    state.challenges.forEach((ch, cIdx) => {
      const card = container.querySelector(`.pattern-challenge-card[data-cidx="${cIdx}"]`);
      if (!card) return;

      const svgGroup = card.querySelector(`#pattern-svg-${cIdx} .pattern-lines-group`);
      svgGroup.innerHTML = ""; // Clear existing

      // Map sequence emojis to their grid DOM elements in order
      const sequenceNodeEls = [];
      ch.sequence.forEach(targetEmoji => {
        const matchingNodes = Array.from(card.querySelectorAll(`.pattern-grid-node[data-emoji="${targetEmoji}"]`));
        const unusedNode = matchingNodes.find(n => !sequenceNodeEls.includes(n));
        if (unusedNode) sequenceNodeEls.push(unusedNode);
      });

      const svgRect = card.querySelector(`#pattern-svg-${cIdx}`).getBoundingClientRect();

      // Connect lines in sequence order
      for (let i = 0; i < sequenceNodeEls.length; i++) {
        const currNode = sequenceNodeEls[i];
        currNode.classList.add("connected");

        if (i > 0) {
          const prevNode = sequenceNodeEls[i - 1];
          const rect1 = prevNode.getBoundingClientRect();
          const rect2 = currNode.getBoundingClientRect();

          const x1 = (rect1.left + rect1.width / 2) - svgRect.left;
          const y1 = (rect1.top + rect1.height / 2) - svgRect.top;
          const x2 = (rect2.left + rect2.width / 2) - svgRect.left;
          const y2 = (rect2.top + rect2.height / 2) - svgRect.top;

          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", x1);
          line.setAttribute("y1", y1);
          line.setAttribute("x2", x2);
          line.setAttribute("y2", y2);
          line.setAttribute("stroke", "var(--success)");
          line.setAttribute("stroke-width", "4");
          line.setAttribute("stroke-linecap", "round");
          svgGroup.appendChild(line);
        }
      }

      const prog = this.challengeProgress ? this.challengeProgress[cIdx] : null;
      if (prog && prog.completed) completedCount++;
      else if (!prog) completedCount++; // Validation reveal mode
    });

    return {
      correct: completedCount,
      total: state.challenges.length
    };
  }
}
