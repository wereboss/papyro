# Papyro - Kids Worksheet Generator SPA

Papyro is a lightweight, responsive, and highly interactive Single Page Application (SPA) designed to dynamically generate A4-sized printable educational worksheets for kids. It covers subjects like Math (Operations, counting), Logic (word searches, connect the dots), and Language (vocabulary fill-in-the-blanks).

---

## ✨ Features

- **🎮 Dual-Panel Layout**: Customize options in the sidebar and view changes on the A4 page preview canvas in real-time.
- **📱 Dynamic Scale-to-Screen (A5, A6, A7)**: Worksheets automatically scale down proportionally to fit mobile and tablet screens without breaking layout structures or font sizes.
- **🖨️ Margins-Perfect Print Engine**: Native browser print support utilizing `@media print` CSS rules. Strips all sidebars, headers, and backgrounds to print clean worksheets on standard A4 paper.
- **✏️ Interactive Play Mode**: Children can complete sheets directly in the browser (with focus-advancing letters for spellings or clickable SVG lines for dot mazes).
- **💾 Local SQLite Bookmark Database**: Save customized worksheet layouts and randomized question values. Reload them in identical states for reprinting or re-playing.
- **☀️ Light/Dark Theme Support**: Playful theme toggle that preserves the white paper worksheet for ink-efficient printing.

---

## 🛠️ Technology Stack

- **Backend**: Python, FastAPI, Uvicorn, SQLite
- **Frontend**: Vanilla HTML5, CSS3 (using HSL variables and CSS grid), Modular JS (ES Modules, zero compile/build steps)

---

## 📁 Repository Structure

```
papyro/
├── requirements.txt     # Python backend dependencies
├── database.py          # SQLite database connection, models, and template seeding
├── schemas.py           # Pydantic request/response validation schemas
├── main.py              # FastAPI endpoints and static file configurations
├── static/              # Frontend client assets
│   ├── index.html       # SPA layout skeleton
│   ├── css/
│   │   ├── app.css      # App workspace, sidebar, themes, and drawer styling
│   │   └── worksheet.css# Worksheet A4 sizing, print properties, and card structures
│   └── js/
│       ├── api.js       # Backend fetch client actions
│       ├── app.js       # Central page state manager and event handler
│       └── templates/   # Modular worksheet rendering components
│           ├── base.js  # BaseTemplate abstract parent class
│           ├── math.js  # Math operations grid subclass
│           ├── count.js # Count the objects grid subclass
│           ├── search.js# Word search puzzle grid subclass
│           └── blanks.js# Fill in the blanks spelling grid subclass
```

---

## 🚀 Installation & Local Run

### Prerequisites
- Python 3.8+
- Git

### 1. Clone the repository & enter directory
```bash
git clone <your-repository-url>
cd papyro
```

### 2. Set up virtual environment
```bash
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the development server
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 9028
```
Open **`http://localhost:9028/`** in your browser (or use your machine's local LAN IP to play on tablets/mobiles).

---

## 📝 Worksheet Templates Available

### 1. Math Operations Grid (Math)
Generates stacked calculation problems. Supports Addition, Subtraction, and Multiplication. Customize column counts, row counts, digit ranges, and allow negative answers.

### 2. Count the Objects (Math)
Generates boxes with randomized groups of colorful emojis (fruits, animals, toys). Children count the items and write down the number. Customize difficulty by setting count limits (up to 5, 10, or 20).

### 3. Word Search Puzzle (Logic & Puzzles)
Builds customizable letter grids from a list of input words. Fits letters in random directions (horizontal, vertical, diagonal). Interactive mode lets kids trace letters to cross words out.

### 4. Connect the Dots (Logic & Puzzles)
Places dot nodes forming outlines of shapes (Heart, Star, Fish, Crown, House) on an interactive SVG canvas. Kids click points in numerical or alphabetical order to draw the lines and reveal the shape.

### 5. Fill in the Blanks (Language)
Features a spelling card grid using emojis. Hides random letters (easy, medium, or hard difficulties) and enables auto-focus progression as letters are typed to teach spelling.

### 6. Emoji Pattern Path (Patterns)
Displays a target sequence line of emojis with directional arrows (`➔`). Below, an exact-match grid contains the same emojis scattered randomly. Children trace/connect the grid emojis in the sequence order.

