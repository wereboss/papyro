// Connect the Dots / Maze Template

import { BaseTemplate } from "./base.js";

const PRESET_SHAPES = {
  heart: [
    { x: 4, y: 2 }, { x: 5.5, y: 0.8 }, { x: 7, y: 1.2 }, { x: 7.5, y: 2.5 },
    { x: 7.2, y: 4 }, { x: 6, y: 5.5 }, { x: 4, y: 7.5 }, { x: 2, y: 5.5 },
    { x: 0.8, y: 4 }, { x: 0.5, y: 2.5 }, { x: 1, y: 1.2 }, { x: 2.5, y: 0.8 }
  ],
  star: [
    { x: 4, y: 0.5 }, { x: 5.1, y: 2.9 }, { x: 7.6, y: 2.9 }, { x: 5.6, y: 4.4 },
    { x: 6.4, y: 6.9 }, { x: 4, y: 5.4 }, { x: 1.6, y: 6.9 }, { x: 2.4, y: 4.4 },
    { x: 0.4, y: 2.9 }, { x: 2.9, y: 2.9 }
  ],
  house: [
    { x: 1.5, y: 7.5 }, { x: 1.5, y: 4 }, { x: 4, y: 1.5 }, { x: 6.5, y: 4 },
    { x: 6.5, y: 7.5 }, { x: 4.5, y: 7.5 }, { x: 4.5, y: 5.5 }, { x: 3.5, y: 5.5 },
    { x: 3.5, y: 7.5 }
  ],
  fish: [
    { x: 1, y: 4 }, { x: 2.5, y: 2.5 }, { x: 5, y: 2.2 }, { x: 6.5, y: 3.2 },
    { x: 7.5, y: 2 }, { x: 7, y: 4 }, { x: 7.5, y: 6 }, { x: 6.5, y: 4.8 },
    { x: 5, y: 5.8 }, { x: 2.5, y: 5.5 }
  ],
  crown: [
    { x: 1, y: 7 }, { x: 1, y: 4 }, { x: 2.5, y: 5 }, { x: 4, y: 2.5 },
    { x: 5.5, y: 5 }, { x: 7, y: 4 }, { x: 7, y: 7 }, { x: 4, y: 7.5 }
  ]
};

export class ConnectDotsTemplate extends BaseTemplate {
  constructor() {
    super("connect_dots", "Connect the Dots", {
      grid_size: 8, // Grid mapping bounding box (0-8)
      preset: "star",
      mode: "numbers", // "numbers" (1,2,3) or "letters" (A,B,C)
      path_type: "loop",
      orientation: "portrait"
    });
  }

  generateState(resolvedConfig) {
    const rawShape = PRESET_SHAPES[resolvedConfig.preset] || PRESET_SHAPES.star;
    
    // Convert normalized coordinates (0-8 scale) to SVG space (400x400 px, centered)
    const padding = 40;
    const canvasSize = 400;
    const scaleFactor = (canvasSize - padding * 2) / 8; // Scale factor based on grid bounds

    const dots = rawShape.map((p, idx) => {
      const x = padding + p.x * scaleFactor;
      const y = padding + p.y * scaleFactor;

      // Label calculation
      let label = "";
      if (resolvedConfig.mode === "letters") {
        label = String.fromCharCode(65 + (idx % 26)); // A-Z cycles
      } else {
        label = (idx + 1).toString();
      }

      return { id: idx, x, y, label };
    });

    return {
      dots,
      preset: resolvedConfig.preset
    };
  }

  renderOptions(container, customConfig, onChange) {
    const config = this.resolveConfig(customConfig);

    container.innerHTML = `
      <div class="options-grid">
        <div class="form-group">
          <label>Orientation</label>
          <select id="dots-opt-orientation" class="form-select">
            <option value="portrait" ${config.orientation === "portrait" ? "selected" : ""}>Portrait</option>
            <option value="landscape" ${config.orientation === "landscape" ? "selected" : ""}>Landscape</option>
          </select>
        </div>

        <div class="form-group">
          <label>Dot Labels</label>
          <select id="dots-opt-mode" class="form-select">
            <option value="numbers" ${config.mode === "numbers" ? "selected" : ""}>Numbers (1, 2, 3...)</option>
            <option value="letters" ${config.mode === "letters" ? "selected" : ""}>Letters (A, B, C...)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Shape Template</label>
          <select id="dots-opt-preset" class="form-select">
            <option value="star" ${config.preset === "star" ? "selected" : ""}>Star</option>
            <option value="heart" ${config.preset === "heart" ? "selected" : ""}>Heart</option>
            <option value="house" ${config.preset === "house" ? "selected" : ""}>House</option>
            <option value="fish" ${config.preset === "fish" ? "selected" : ""}>Fish</option>
            <option value="crown" ${config.preset === "crown" ? "selected" : ""}>Crown</option>
          </select>
        </div>
      </div>
    `;

    const getNewConfig = () => {
      return {
        orientation: container.querySelector("#dots-opt-orientation").value,
        mode: container.querySelector("#dots-opt-mode").value,
        preset: container.querySelector("#dots-opt-preset").value,
        grid_size: 8
      };
    };

    const triggers = [
      container.querySelector("#dots-opt-orientation"),
      container.querySelector("#dots-opt-mode"),
      container.querySelector("#dots-opt-preset")
    ];

    triggers.forEach(el => {
      el.addEventListener("change", () => {
        onChange(getNewConfig());
      });
    });
  }

  render(container, state, resolvedConfig, options = { interactive: false }) {
    const headerHtml = this.renderHeader(
      "Connect the Dots Puzzle",
      `Connect the points in order to reveal the secret shape!`,
      resolvedConfig.orientation
    );

    // Build dots elements
    let svgDotsHtml = "";
    state.dots.forEach((dot) => {
      svgDotsHtml += `
        <g class="dot-group" data-id="${dot.id}">
          <circle cx="${dot.x}" cy="${dot.y}" r="4" fill="#000" class="maze-dot" data-id="${dot.id}"></circle>
          <text x="${dot.x + 10}" y="${dot.y - 6}" class="maze-dot-text">${dot.label}</text>
        </g>
      `;
    });

    container.innerHTML = `
      ${headerHtml}
      <div class="sheet-body">
        <div class="maze-container">
          <svg width="400" height="400" class="maze-svg-canvas" id="maze-svg">
            <!-- Drawn connection lines go here -->
            <g id="svg-connections"></g>
            <g id="svg-guide-lines" class="maze-lines-guide"></g>
            <!-- Dots -->
            ${svgDotsHtml}
          </svg>
        </div>
      </div>
    `;

    if (options.interactive) {
      this.setupInteractiveHandlers(container, state);
    }
  }

  setupInteractiveHandlers(container, state) {
    const svg = container.querySelector("#maze-svg");
    const connectionsGroup = container.querySelector("#svg-connections");
    const dots = container.querySelectorAll(".maze-dot");
    
    let nextDotIndex = 0; // The child must click dot 0 first
    const pathConnections = []; // Stores IDs of connected dots

    const drawConnection = (fromDot, toDot) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", fromDot.x);
      line.setAttribute("y1", fromDot.y);
      line.setAttribute("x2", toDot.x);
      line.setAttribute("y2", toDot.y);
      line.setAttribute("stroke", "var(--success)");
      line.setAttribute("stroke-width", "3");
      line.setAttribute("class", "maze-line");
      connectionsGroup.appendChild(line);
    };

    const highlightTargetDot = () => {
      // Clear active animation
      dots.forEach(d => d.classList.remove("active-target"));
      
      const targetDotEl = container.querySelector(`.maze-dot[data-id="${nextDotIndex}"]`);
      if (targetDotEl) {
        targetDotEl.classList.add("active-target");
      }
    };

    highlightTargetDot();

    dots.forEach(dotEl => {
      dotEl.addEventListener("click", () => {
        const dotId = parseInt(dotEl.dataset.id);

        if (dotId === nextDotIndex) {
          // Connected correctly!
          dotEl.classList.add("connected");
          pathConnections.push(dotId);

          if (nextDotIndex > 0) {
            // Draw line from previous dot
            const fromDot = state.dots[nextDotIndex - 1];
            const toDot = state.dots[nextDotIndex];
            drawConnection(fromDot, toDot);
          }

          nextDotIndex++;

          // Check if loop is completed (connect back to the start if all items resolved)
          if (nextDotIndex === state.dots.length) {
            const startDot = state.dots[0];
            const lastDot = state.dots[state.dots.length - 1];
            drawConnection(lastDot, startDot);
            
            // Celebration
            dots.forEach(d => d.classList.remove("active-target"));
            container.dispatchEvent(new CustomEvent("worksheet-updated"));
          } else {
            highlightTargetDot();
          }
        } else {
          // Wrong click feedback - flash red
          dotEl.setAttribute("fill", "var(--error)");
          setTimeout(() => {
            if (!dotEl.classList.contains("connected")) {
              dotEl.setAttribute("fill", "#000");
            } else {
              dotEl.setAttribute("fill", "var(--success)");
            }
          }, 400);
        }
      });
    });

    // Save playing index back to instance for validation checks
    this.completedCount = () => pathConnections.length;
    this.maxCount = () => state.dots.length;
  }

  validateAnswers(container, state, resolvedConfig) {
    const connectionsGroup = container.querySelector("#svg-connections");
    connectionsGroup.innerHTML = ""; // Clear existing

    // Draw all lines to complete the shape
    for (let i = 0; i < state.dots.length; i++) {
      const fromDot = state.dots[i];
      const toDot = state.dots[(i + 1) % state.dots.length];
      
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", fromDot.x);
      line.setAttribute("y1", fromDot.y);
      line.setAttribute("x2", toDot.x);
      line.setAttribute("y2", toDot.y);
      line.setAttribute("stroke", "var(--success)");
      line.setAttribute("stroke-width", "3");
      line.setAttribute("class", "maze-line");
      connectionsGroup.appendChild(line);
    }

    // Highlight all dots green
    container.querySelectorAll(".maze-dot").forEach(dot => {
      dot.classList.add("connected");
      dot.setAttribute("fill", "var(--success)");
    });

    const isDone = this.completedCount ? (this.completedCount() === this.maxCount()) : true;

    return {
      correct: isDone ? state.dots.length : 0,
      total: state.dots.length
    };
  }
}
