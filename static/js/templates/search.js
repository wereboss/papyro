// Word Search Puzzle Template

import { BaseTemplate } from "./base.js";

export class WordSearchTemplate extends BaseTemplate {
  constructor() {
    super("word_search", "Word Search Puzzle", {
      grid_size: 10,
      words: ["CAT", "DOG", "BIRD", "FISH", "FROG", "LION", "TIGER", "BEAR"],
      directions: ["horizontal", "vertical"],
      uppercase: true,
      orientation: "portrait"
    });
  }

  generateState(resolvedConfig) {
    const size = resolvedConfig.grid_size;
    const rawWords = resolvedConfig.words.length > 0 ? resolvedConfig.words : ["PAPYRO"];
    
    // Clean and filter words
    const wordsToPlace = rawWords
      .map(w => w.trim().replace(/[^a-zA-Z]/g, ""))
      .filter(w => w.length > 0 && w.length <= size)
      .map(w => resolvedConfig.uppercase ? w.toUpperCase() : w.toLowerCase());

    // Initialize empty grid
    const grid = Array(size).fill(null).map(() => Array(size).fill(""));
    const placedWords = [];

    // Helper to check if a word can be placed
    const tryPlaceWord = (word) => {
      const dirs = resolvedConfig.directions.length > 0 ? resolvedConfig.directions : ["horizontal", "vertical"];
      // Shuffle directions and positions to make placement random
      const directions = [...dirs].sort(() => Math.random() - 0.5);
      
      // Let's gather all possible grid cells
      const cells = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          cells.push({ r, c });
        }
      }
      cells.sort(() => Math.random() - 0.5);

      for (const cell of cells) {
        for (const dir of directions) {
          let dRow = 0;
          let dCol = 0;
          if (dir === "horizontal") dCol = 1;
          else if (dir === "vertical") dRow = 1;
          else if (dir === "diagonal") { dRow = 1; dCol = 1; }

          let fit = true;
          const coords = [];
          for (let i = 0; i < word.length; i++) {
            const r = cell.r + i * dRow;
            const c = cell.c + i * dCol;

            if (r >= size || c >= size || (grid[r][c] !== "" && grid[r][c] !== word[i])) {
              fit = false;
              break;
            }
            coords.push({ r, c });
          }

          if (fit) {
            // Commit to grid
            coords.forEach((coord, idx) => {
              grid[coord.r][coord.c] = word[idx];
            });
            placedWords.push({
              word,
              start: coords[0],
              end: coords[coords.length - 1],
              coords
            });
            return true; // Word placed successfully
          }
        }
      }
      return false; // Could not place word
    };

    // Attempt to place all words
    const actualPlaced = [];
    for (const w of wordsToPlace) {
      if (tryPlaceWord(w)) {
        actualPlaced.push(w);
      }
    }

    // Fill empty cells with random letters
    const alphabet = resolvedConfig.uppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "abcdefghijklmnopqrstuvwxyz";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === "") {
          grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    return {
      grid,
      placedWords,
      wordList: actualPlaced
    };
  }

  renderOptions(container, customConfig, onChange) {
    const config = this.resolveConfig(customConfig);

    container.innerHTML = `
      <div class="options-grid">
        <div class="form-group">
          <label>Orientation</label>
          <select id="ws-opt-orientation" class="form-select">
            <option value="portrait" ${config.orientation === "portrait" ? "selected" : ""}>Portrait</option>
            <option value="landscape" ${config.orientation === "landscape" ? "selected" : ""}>Landscape</option>
          </select>
        </div>

        <div class="form-group">
          <label>Grid Size: <span id="val-gridsize" class="option-slider-val">${config.grid_size}x${config.grid_size}</span></label>
          <input type="range" id="ws-opt-size" min="6" max="14" value="${config.grid_size}" class="form-input">
        </div>

        <div class="form-group">
          <label>Words (comma or space separated)</label>
          <textarea id="ws-opt-words" class="form-textarea">${config.words.join(", ")}</textarea>
        </div>

        <div class="form-group">
          <label>Word Directions</label>
          <div class="option-checkbox-group">
            <label class="option-checkbox-label">
              <input type="checkbox" value="horizontal" ${config.directions.includes("horizontal") ? "checked" : ""}> Horizontal (→)
            </label>
            <label class="option-checkbox-label">
              <input type="checkbox" value="vertical" ${config.directions.includes("vertical") ? "checked" : ""}> Vertical (↓)
            </label>
            <label class="option-checkbox-label">
              <input type="checkbox" value="diagonal" ${config.directions.includes("diagonal") ? "checked" : ""}> Diagonal (↘)
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="option-checkbox-label">
            <input type="checkbox" id="ws-opt-uppercase" ${config.uppercase ? "checked" : ""}> Uppercase Letters
          </label>
        </div>
      </div>
    `;

    const getNewConfig = () => {
      const dirs = [];
      container.querySelectorAll(".option-checkbox-group input:checked").forEach(cb => {
        dirs.push(cb.value);
      });

      const wordsStr = container.querySelector("#ws-opt-words").value;
      const wordsArr = wordsStr
        .split(/[\n,]+/)
        .map(w => w.trim())
        .filter(w => w.length > 0);

      return {
        orientation: container.querySelector("#ws-opt-orientation").value,
        grid_size: parseInt(container.querySelector("#ws-opt-size").value),
        words: wordsArr.length > 0 ? wordsArr : config.words,
        directions: dirs,
        uppercase: container.querySelector("#ws-opt-uppercase").checked
      };
    };

    const triggers = [
      container.querySelector("#ws-opt-orientation"),
      container.querySelector("#ws-opt-size"),
      container.querySelector("#ws-opt-uppercase")
    ];

    triggers.forEach(el => {
      el.addEventListener("input", (e) => {
        if (e.target.id === "ws-opt-size") {
          container.querySelector("#val-gridsize").textContent = `${e.target.value}x${e.target.value}`;
        }
        onChange(getNewConfig());
      });
    });

    container.querySelector("#ws-opt-words").addEventListener("blur", () => {
      onChange(getNewConfig());
    });

    container.querySelectorAll(".option-checkbox-group input").forEach(cb => {
      cb.addEventListener("change", () => {
        onChange(getNewConfig());
      });
    });
  }

  render(container, state, resolvedConfig, options = { interactive: false }) {
    const size = resolvedConfig.grid_size;
    const headerHtml = this.renderHeader(
      "Word Search Puzzle",
      "Find all the hidden words list below!",
      resolvedConfig.orientation
    );

    // Build Word List display
    let wordListHtml = "";
    state.wordList.forEach((word) => {
      wordListHtml += `<div class="ws-word-item" data-word="${word}">${word}</div>`;
    });

    // Build grid cells
    let gridCellsHtml = "";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const letter = state.grid[r][c];
        gridCellsHtml += `
          <div class="word-search-cell" data-r="${r}" data-c="${c}">
            ${letter}
          </div>
        `;
      }
    }

    container.innerHTML = `
      ${headerHtml}
      <div class="sheet-body">
        <div class="word-search-container">
          <div class="word-search-grid" style="grid-template-columns: repeat(${size}, 35px); grid-template-rows: repeat(${size}, 35px);">
            ${gridCellsHtml}
          </div>
          
          <div class="word-search-list-box">
            <h5>Words to Find:</h5>
            <div class="word-search-words">
              ${wordListHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook up interactive handlers if play mode is enabled
    if (options.interactive) {
      this.setupInteractiveHandlers(container, state);
    }
  }

  setupInteractiveHandlers(container, state) {
    let selectionStart = null;
    const cells = container.querySelectorAll(".word-search-cell");
    const wordListItems = container.querySelectorAll(".ws-word-item");

    // Track words found in this play session
    this.foundWordsInSession = new Set();

    const getCellAt = (r, c) => {
      return container.querySelector(`.word-search-cell[data-r="${r}"][data-c="${c}"]`);
    };

    const getCellsBetween = (start, end) => {
      const cellsBetween = [];
      const dr = end.r - start.r;
      const dc = end.c - start.c;
      
      const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
      const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

      // Check if coordinates are in a straight line (horizontal, vertical, diagonal)
      const isValidLine = (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc));
      if (!isValidLine) return [];

      let currR = start.r;
      let currC = start.c;
      const steps = Math.max(Math.abs(dr), Math.abs(dc));

      for (let i = 0; i <= steps; i++) {
        cellsBetween.push({ r: currR, c: currC });
        currR += stepR;
        currC += stepC;
      }
      return cellsBetween;
    };

    const clearPreviewSelection = () => {
      cells.forEach(c => c.classList.remove("selected"));
    };

    cells.forEach(cell => {
      cell.addEventListener("click", () => {
        const r = parseInt(cell.dataset.r);
        const c = parseInt(cell.dataset.c);

        if (!selectionStart) {
          // Select Start
          selectionStart = { r, c };
          cell.classList.add("selected");
        } else {
          // Select End & Evaluate
          const selectionEnd = { r, c };
          const coords = getCellsBetween(selectionStart, selectionEnd);

          if (coords.length > 0) {
            // Extract word spelled
            const spelledWord = coords.map(coord => state.grid[coord.r][coord.c]).join("");
            const spelledWordRev = spelledWord.split("").reverse().join("");

            // Check if this matches any placed words
            let matchedWordObj = state.placedWords.find(
              w => w.word === spelledWord || w.word === spelledWordRev
            );

            if (matchedWordObj && !this.foundWordsInSession.has(matchedWordObj.word)) {
              // Word found!
              this.foundWordsInSession.add(matchedWordObj.word);
              
              // Mark cells as found
              matchedWordObj.coords.forEach(coord => {
                const cEl = getCellAt(coord.r, coord.c);
                if (cEl) cEl.classList.add("found");
              });

              // Mark word items crossed out
              const wordItem = container.querySelector(`.ws-word-item[data-word="${matchedWordObj.word}"]`);
              if (wordItem) wordItem.classList.add("found");

              // Trigger global check score
              container.dispatchEvent(new CustomEvent("worksheet-updated"));
            }
          }
          
          selectionStart = null;
          clearPreviewSelection();
        }
      });

      cell.addEventListener("mouseenter", () => {
        if (selectionStart) {
          clearPreviewSelection();
          const r = parseInt(cell.dataset.r);
          const c = parseInt(cell.dataset.c);
          const coords = getCellsBetween(selectionStart, { r, c });
          coords.forEach(coord => {
            const cEl = getCellAt(coord.r, coord.c);
            if (cEl) cEl.classList.add("selected");
          });
        }
      });
    });
  }

  validateAnswers(container, state, resolvedConfig) {
    // In word search, we check which words are marked as found in the DOM or session
    const wordItems = container.querySelectorAll(".ws-word-item");
    const foundCount = container.querySelectorAll(".ws-word-item.found").length;
    const totalCount = state.wordList.length;

    // Show answers by highlighting all placed words
    state.placedWords.forEach(w => {
      w.coords.forEach(coord => {
        const cell = container.querySelector(`.word-search-cell[data-r="${coord.r}"][data-c="${coord.c}"]`);
        if (cell) {
          cell.classList.add("found");
        }
      });
      const item = container.querySelector(`.ws-word-item[data-word="${w.word}"]`);
      if (item) item.classList.add("found");
    });

    return {
      correct: foundCount,
      total: totalCount
    };
  }
}
