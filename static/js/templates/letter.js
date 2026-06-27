// Letter Practice Template (Language Subject) - Dual Puzzle Edition

import { BaseTemplate } from "./base.js";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LETTER_WORDS = {
  A: ["CAT", "AIM", "ARE"], B: ["BOY", "BAT", "BAG"], C: ["CAT", "CUP", "COW"],
  D: ["DOG", "DOT", "DAY"], E: ["EGG", "EAR", "EYE"], F: ["FOX", "FUN", "FLY"],
  G: ["GEM", "GEM", "GOT"], H: ["HAT", "HEN", "HUG"], I: ["INK", "ICE", "IVY"],
  J: ["JAR", "JOY", "JUG"], K: ["KIT", "KEY", "KID"], L: ["LOG", "LEG", "LIP"],
  M: ["MAT", "MUG", "MAP"], N: ["NET", "NUT", "NAP"], O: ["OWL", "OAK", "ONE"],
  P: ["PEN", "PIG", "POT"], Q: ["QUILL", "QUIZ", "QUEEN"], R: ["RAT", "RED", "RUN"],
  S: ["SUN", "SKY", "SEA"], T: ["TOY", "TEA", "TEN"], U: ["URN", "USE", "UP"],
  V: ["VAN", "VET", "VOW"], W: ["WEB", "WIN", "WAY"], X: ["BOX", "FOX", "WAX"],
  Y: ["YAK", "YAM", "YES"], Z: ["ZIP", "ZOO", "ZAP"]
};

const EMOJI_DICT = [
  { emoji: "🍎", name: "APPLE" }, { emoji: "🍌", name: "BANANA" }, { emoji: "🐱", name: "CAT" },
  { emoji: "🐶", name: "DOG" }, { emoji: "🚗", name: "CAR" }, { emoji: "⭐️", name: "STAR" },
  { emoji: "🐟", name: "FISH" }, { emoji: "🐸", name: "FROG" }, { emoji: "☀️", name: "SUN" },
  { emoji: "🎁", name: "GIFT" }, { emoji: "👑", name: "CROWN" }, { emoji: "🦁", name: "LION" },
  { emoji: "🌙", name: "MOON" }, { emoji: "📦", name: "BOX" }, { emoji: "🍕", name: "PIZZA" },
  { emoji: "🐝", name: "BEE" }, { emoji: "🍇", name: "GRAPES" }, { emoji: "🚀", name: "ROCKET" },
  { emoji: "⛵️", name: "BOAT" }, { emoji: "🧸", name: "BEAR" }, { emoji: "🦊", name: "FOX" }, { emoji: "🚌", name: "BUS" }
];

export class LetterPracticeTemplate extends BaseTemplate {
  constructor() {
    super("letter_practice", "Letter Practice (A-Z)", {
      target_letter_1: "A",
      target_letter_2: "B",
      orientation: "portrait"
    });
  }

  generateSinglePuzzleState(targetLetter, pIdx) {
    const letter = (targetLetter || "A").toUpperCase();
    const words = LETTER_WORDS[letter] || ["CAT", "AIM", "ARE"];

    // 1. Bubbles Grid (12 bubbles, Section 4)
    const bubbles = [];
    const distractorLetters = ALPHABET.filter(l => l !== letter);
    for (let i = 0; i < 12; i++) {
      if (i < 4) {
        bubbles.push({ val: letter, isTarget: true });
      } else {
        const randD = distractorLetters[Math.floor(Math.random() * distractorLetters.length)];
        bubbles.push({ val: randD, isTarget: false });
      }
    }
    bubbles.sort(() => Math.random() - 0.5);

    // 2. Weird Font Variation Boxes (6 boxes, Section 5)
    const fontBoxes = [];
    const fontStyles = ["font-style-serif", "font-style-cursive", "font-style-mono", "font-style-fantasy", "font-style-italic", "font-style-bold"];
    for (let i = 0; i < 6; i++) {
      const isTarget = i < 3;
      const val = isTarget ? letter : distractorLetters[Math.floor(Math.random() * distractorLetters.length)];
      const fontClass = fontStyles[i % fontStyles.length];
      fontBoxes.push({ val, isTarget, fontClass });
    }
    fontBoxes.sort(() => Math.random() - 0.5);

    // 3. Emoji Phonics Match (4 boxes, Section 6)
    const emojiBoxes = [];
    const matchingEmojis = EMOJI_DICT.filter(e => e.name.includes(letter));
    const nonMatchingEmojis = EMOJI_DICT.filter(e => !e.name.includes(letter));

    matchingEmojis.sort(() => Math.random() - 0.5);
    nonMatchingEmojis.sort(() => Math.random() - 0.5);

    for (let i = 0; i < 4; i++) {
      if (i < 2 && matchingEmojis.length > i) {
        emojiBoxes.push({ emoji: matchingEmojis[i].emoji, name: matchingEmojis[i].name, isTarget: true });
      } else if (nonMatchingEmojis.length > 0) {
        const item = nonMatchingEmojis.pop();
        emojiBoxes.push({ emoji: item.emoji, name: item.name, isTarget: false });
      }
    }
    emojiBoxes.sort(() => Math.random() - 0.5);

    // 4. Word Match (4 words, Section 7 - 1 contains letter, 3 do not)
    const wordMatches = [];
    const matchingWordsPool = ["CAT", "HAT", "BAT", "RED", "SUN", "DOG", "MAP", "PEN", "BOX", "CUP", "CAR", "KEY"];
    const withLetter = matchingWordsPool.filter(w => w.includes(letter));
    const withoutLetter = matchingWordsPool.filter(w => !w.includes(letter));

    const targetWord = withLetter.length > 0 ? withLetter[Math.floor(Math.random() * withLetter.length)] : (words[0] || "CAT");
    wordMatches.push({ text: targetWord, isTarget: true });

    withoutLetter.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) {
      const w = withoutLetter[i] || "FOX";
      wordMatches.push({ text: w, isTarget: false });
    }
    wordMatches.sort(() => Math.random() - 0.5);

    // 5. Bottom Line Boxes (12 boxes, Section 8)
    const bottomLine = [];
    for (let i = 0; i < 12; i++) {
      if (i < 4) {
        bottomLine.push({ val: letter, isTarget: true });
      } else {
        const randD = distractorLetters[Math.floor(Math.random() * distractorLetters.length)];
        bottomLine.push({ val: randD, isTarget: false });
      }
    }
    bottomLine.sort(() => Math.random() - 0.5);

    return {
      pIdx,
      letter,
      words,
      bubbles,
      fontBoxes,
      emojiBoxes,
      wordMatches,
      bottomLine
    };
  }

  generateState(resolvedConfig) {
    const l1 = resolvedConfig.target_letter_1 || "A";
    const l2 = resolvedConfig.target_letter_2 || "B";

    const puzzle1 = this.generateSinglePuzzleState(l1, 0);
    const puzzle2 = this.generateSinglePuzzleState(l2, 1);

    return {
      puzzles: [puzzle1, puzzle2]
    };
  }

  renderOptions(container, customConfig, onChange) {
    const config = this.resolveConfig(customConfig);
    const l1 = config.target_letter_1 || "A";
    const l2 = config.target_letter_2 || "B";

    let opts1Html = "";
    let opts2Html = "";
    ALPHABET.forEach(l => {
      opts1Html += `<option value="${l}" ${l1 === l ? "selected" : ""}>Letter ${l}</option>`;
      opts2Html += `<option value="${l}" ${l2 === l ? "selected" : ""}>Letter ${l}</option>`;
    });

    container.innerHTML = `
      <div class="options-grid">
        <div class="form-group">
          <label>Puzzle 1 Letter</label>
          <select id="let-opt-target-1" class="form-select">
            ${opts1Html}
          </select>
        </div>

        <div class="form-group">
          <label>Puzzle 2 Letter</label>
          <select id="let-opt-target-2" class="form-select">
            ${opts2Html}
          </select>
        </div>

        <div class="form-group">
          <label>Orientation</label>
          <select id="let-opt-orientation" class="form-select">
            <option value="portrait" ${config.orientation === "portrait" ? "selected" : ""}>Portrait</option>
            <option value="landscape" ${config.orientation === "landscape" ? "selected" : ""}>Landscape</option>
          </select>
        </div>
      </div>
    `;

    const getNewConfig = () => {
      return {
        target_letter_1: container.querySelector("#let-opt-target-1").value,
        target_letter_2: container.querySelector("#let-opt-target-2").value,
        orientation: container.querySelector("#let-opt-orientation").value
      };
    };

    container.querySelector("#let-opt-target-1").addEventListener("change", () => onChange(getNewConfig()));
    container.querySelector("#let-opt-target-2").addEventListener("change", () => onChange(getNewConfig()));
    container.querySelector("#let-opt-orientation").addEventListener("change", () => onChange(getNewConfig()));
  }

  renderPuzzleHtml(p) {
    const sec1Html = `
      <div class="num-sec sec-1-giant">
        <div class="sec-label">1. Trace</div>
        <div class="giant-numeral">${p.letter}</div>
      </div>
    `;

    let traceBoxesHtml = "";
    for (let i = 0; i < 12; i++) {
      traceBoxesHtml += `<div class="trace-num-box">${p.letter}</div>`;
    }
    const sec2Html = `
      <div class="num-sec sec-2-tracegrid">
        <div class="sec-label">2. Tracing Grid</div>
        <div class="trace-6x2-grid">${traceBoxesHtml}</div>
      </div>
    `;

    const sec3Html = `
      <div class="num-sec sec-3-wordtrace">
        <div class="sec-label">3. Trace Words</div>
        <div class="word-trace-boxes">
          <div class="word-box">${p.words[0]}</div>
          <div class="word-box">${p.words[1]}</div>
          <div class="word-box">${p.words[2]}</div>
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
        <div class="sec-label">4. Find Letter ${p.letter}</div>
        <div class="bubbles-3x4-grid">${bubblesHtml}</div>
      </div>
    `;

    let fontBoxesHtml = "";
    p.fontBoxes.forEach((fb, idx) => {
      fontBoxesHtml += `
        <div class="font-var-box ${fb.fontClass}" data-pidx="${p.pIdx}" data-idx="${idx}" data-istarget="${fb.isTarget}">
          ${fb.val}
        </div>
      `;
    });
    const sec5Html = `
      <div class="num-sec sec-5-fontvar">
        <div class="sec-label">5. Find ${p.letter} in Weird Fonts</div>
        <div class="font-var-grid">${fontBoxesHtml}</div>
      </div>
    `;

    let emojiBoxesHtml = "";
    p.emojiBoxes.forEach((eb, idx) => {
      emojiBoxesHtml += `
        <div class="emoji-match-box" data-pidx="${p.pIdx}" data-idx="${idx}" data-istarget="${eb.isTarget}" title="${eb.name}">
          ${eb.emoji}
        </div>
      `;
    });
    const sec6Html = `
      <div class="num-sec sec-6-emojimatch">
        <div class="sec-label">6. Emoji with ${p.letter}</div>
        <div class="emoji-2x2-grid">${emojiBoxesHtml}</div>
      </div>
    `;

    let wordMatchesHtml = "";
    p.wordMatches.forEach((wm, idx) => {
      wordMatchesHtml += `
        <div class="word-choice-box" data-pidx="${p.pIdx}" data-widx="${idx}" data-istarget="${wm.isTarget}">
          ${wm.text}
        </div>
      `;
    });
    const sec7Html = `
      <div class="num-sec sec-7-wordmatch">
        <div class="sec-label">7. Word with ${p.letter}</div>
        <div class="word-2x2-grid">${wordMatchesHtml}</div>
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
        <div class="sec-label">8. Find all ${p.letter}'s below</div>
        <div class="bottom-12-line">${lineBoxesHtml}</div>
      </div>
    `;

    return `
      <div class="number-practice-card" data-pidx="${p.pIdx}">
        <div class="number-card-title">Letter Practice: ${p.letter}</div>
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
      `Letter Practice Activity Sheet`,
      `Learn to write, trace, recognize, and match letters on this dual-puzzle page!`,
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

    container.querySelectorAll(".font-var-box").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("selected"));
    });

    container.querySelectorAll(".emoji-match-box").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("selected"));
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

      card.querySelectorAll(".num-bubble, .font-var-box, .emoji-match-box, .word-choice-box, .line-match-box").forEach(el => {
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
    });

    return { correct, total };
  }
}
