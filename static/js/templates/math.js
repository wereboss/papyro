// Math Grid Template

import { BaseTemplate } from "./base.js";

export class MathGridTemplate extends BaseTemplate {
  constructor() {
    super("math_grid", "Math Operations Grid", {
      columns: 4,
      rows: 5,
      operations: ["+"],
      min_val: 1,
      max_val: 10,
      allow_negative: false,
      orientation: "portrait"
    });
  }

  generateState(resolvedConfig) {
    const problems = [];
    const count = resolvedConfig.columns * resolvedConfig.rows;
    const ops = resolvedConfig.operations.length > 0 ? resolvedConfig.operations : ["+"];

    for (let i = 0; i < count; i++) {
      const op = ops[Math.floor(Math.random() * ops.length)];
      let num1 = Math.floor(Math.random() * (resolvedConfig.max_val - resolvedConfig.min_val + 1)) + resolvedConfig.min_val;
      let num2 = Math.floor(Math.random() * (resolvedConfig.max_val - resolvedConfig.min_val + 1)) + resolvedConfig.min_val;

      // Handle simple non-negative rules for kids
      if (op === "-" && !resolvedConfig.allow_negative && num1 < num2) {
        // Swap to avoid negative answer
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }

      let ans;
      if (op === "+") ans = num1 + num2;
      else if (op === "-") ans = num1 - num2;
      else if (op === "x" || op === "*") ans = num1 * num2;
      else ans = num1 + num2;

      problems.push({ num1, num2, operation: op === "*" ? "x" : op, ans });
    }

    return { problems };
  }

  renderOptions(container, customConfig, onChange) {
    const config = this.resolveConfig(customConfig);

    container.innerHTML = `
      <div class="options-grid">
        <div class="form-group">
          <label>Orientation</label>
          <select id="math-opt-orientation" class="form-select">
            <option value="portrait" ${config.orientation === "portrait" ? "selected" : ""}>Portrait</option>
            <option value="landscape" ${config.orientation === "landscape" ? "selected" : ""}>Landscape</option>
          </select>
        </div>

        <div class="form-group">
          <label>Columns: <span id="val-cols" class="option-slider-val">${config.columns}</span></label>
          <input type="range" id="math-opt-cols" min="2" max="6" value="${config.columns}" class="form-input">
        </div>

        <div class="form-group">
          <label>Rows: <span id="val-rows" class="option-slider-val">${config.rows}</span></label>
          <input type="range" id="math-opt-rows" min="1" max="8" value="${config.rows}" class="form-input">
        </div>

        <div class="form-group">
          <label>Minimum Value</label>
          <input type="number" id="math-opt-min" value="${config.min_val}" class="form-input">
        </div>

        <div class="form-group">
          <label>Maximum Value</label>
          <input type="number" id="math-opt-max" value="${config.max_val}" class="form-input">
        </div>

        <div class="form-group">
          <label>Operations</label>
          <div class="option-checkbox-group">
            <label class="option-checkbox-label">
              <input type="checkbox" value="+" ${config.operations.includes("+") ? "checked" : ""}> Addition (+)
            </label>
            <label class="option-checkbox-label">
              <input type="checkbox" value="-" ${config.operations.includes("-") ? "checked" : ""}> Subtraction (-)
            </label>
            <label class="option-checkbox-label">
              <input type="checkbox" value="x" ${config.operations.includes("x") || config.operations.includes("*") ? "checked" : ""}> Multiplication (x)
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="option-checkbox-label">
            <input type="checkbox" id="math-opt-negative" ${config.allow_negative ? "checked" : ""}> Allow Negative Answers
          </label>
        </div>
      </div>
    `;

    // Hook up dynamic event listeners
    const getNewConfig = () => {
      const ops = [];
      container.querySelectorAll(".option-checkbox-group input:checked").forEach(cb => {
        ops.push(cb.value);
      });

      return {
        orientation: container.querySelector("#math-opt-orientation").value,
        columns: parseInt(container.querySelector("#math-opt-cols").value),
        rows: parseInt(container.querySelector("#math-opt-rows").value),
        min_val: parseInt(container.querySelector("#math-opt-min").value) || 1,
        max_val: parseInt(container.querySelector("#math-opt-max").value) || 10,
        operations: ops,
        allow_negative: container.querySelector("#math-opt-negative").checked
      };
    };

    const triggers = [
      container.querySelector("#math-opt-orientation"),
      container.querySelector("#math-opt-cols"),
      container.querySelector("#math-opt-rows"),
      container.querySelector("#math-opt-min"),
      container.querySelector("#math-opt-max"),
      container.querySelector("#math-opt-negative")
    ];

    triggers.forEach(el => {
      el.addEventListener("input", (e) => {
        if (e.target.id === "math-opt-cols") {
          container.querySelector("#val-cols").textContent = e.target.value;
        }
        if (e.target.id === "math-opt-rows") {
          container.querySelector("#val-rows").textContent = e.target.value;
        }
        onChange(getNewConfig());
      });
    });

    container.querySelectorAll(".option-checkbox-group input").forEach(cb => {
      cb.addEventListener("change", () => {
        onChange(getNewConfig());
      });
    });
  }

  render(container, state, resolvedConfig, options = { interactive: false }) {
    // Generate Header
    const headerHtml = this.renderHeader(
      "Math Grid Worksheet",
      `Practice your math skills! Bounds: ${resolvedConfig.min_val} to ${resolvedConfig.max_val}`,
      resolvedConfig.orientation
    );

    // Build Problems Grid HTML
    let problemsHtml = "";
    state.problems.forEach((p, idx) => {
      const inputHtml = options.interactive
        ? `<input type="number" class="ans-input" data-index="${idx}" autocomplete="off">
           <span class="correct-hint">Ans: ${p.ans}</span>`
        : `<div class="ans-placeholder"></div>`;

      problemsHtml += `
        <div class="math-problem">
          <span class="num">${p.num1}</span>
          <span class="op-symbol">${p.operation}</span>
          <span class="num">${p.num2}</span>
          <div class="line"></div>
          ${inputHtml}
        </div>
      `;
    });

    // Final HTML Assembly
    container.innerHTML = `
      ${headerHtml}
      <div class="sheet-body">
        <div class="math-grid" style="grid-template-columns: repeat(${resolvedConfig.columns}, 1fr);">
          ${problemsHtml}
        </div>
      </div>
    `;
  }

  validateAnswers(container, state, resolvedConfig) {
    const inputs = container.querySelectorAll(".ans-input");
    let correctCount = 0;
    const totalCount = state.problems.length;

    inputs.forEach(input => {
      const idx = parseInt(input.dataset.index);
      const studentAns = parseInt(input.value);
      const correctAns = state.problems[idx].ans;

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
