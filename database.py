import sqlite3
import json
import os

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "papyro.db")

DEFAULT_TEMPLATES = [
    {
        "id": "math_grid",
        "name": "Math Operations Grid",
        "description": "Generates grids of math problems (addition, subtraction, multiplication) tailored for various skill levels.",
        "base_config": {
            "columns": 4,
            "rows": 5,
            "operations": ["+"],
            "min_val": 1,
            "max_val": 10,
            "allow_negative": False,
            "orientation": "portrait"
        }
    },
    {
        "id": "word_search",
        "name": "Word Search Puzzle",
        "description": "Creates custom word search puzzles from a list of words, with options for grid size and letter casing.",
        "base_config": {
            "grid_size": 10,
            "words": ["CAT", "DOG", "BIRD", "FISH", "FROG", "LION", "TIGER", "BEAR"],
            "directions": ["horizontal", "vertical"],
            "uppercase": True,
            "orientation": "portrait"
        }
    },
    {
        "id": "connect_dots",
        "name": "Connect the Dots / Number Maze",
        "description": "Generates custom grid-based dot paths for kids to trace numbers or alphabets in order.",
        "base_config": {
            "grid_size": 8,
            "dots_count": 10,
            "mode": "numbers", # "numbers" or "letters"
            "path_type": "loop", # "loop" or "line"
            "orientation": "portrait"
        }
    },
    {
        "id": "fill_blanks",
        "name": "Fill in the Blanks",
        "description": "Practice vocabulary by guessing the names of emojis, shapes, and colors with missing letters.",
        "base_config": {
            "columns": 3,
            "rows": 4,
            "difficulty": "medium", # "easy", "medium", "hard"
            "orientation": "portrait"
        }
    },
    {
        "id": "count_objects",
        "name": "Count the Objects",
        "description": "Practice counting skills by counting groups of fun emojis and writing down the number.",
        "base_config": {
            "columns": 2,
            "rows": 3,
            "max_count": 10,
            "orientation": "portrait"
        }
    },
    {
        "id": "emoji_pattern",
        "name": "Emoji Pattern Path",
        "description": "Trace and connect scattered grid emojis to match the target pattern sequence shown above.",
        "base_config": {
            "challenges_count": 4,
            "grid_columns": 2,
            "grid_rows": 2,
            "orientation": "portrait"
        }
    },
    {
        "id": "number_learning",
        "name": "Number Practice (1-10)",
        "description": "Comprehensive single-page numeral activity sheet covering tracing, word recognition, counting, and matching.",
        "base_config": {
            "target_number_1": 5,
            "target_number_2": 8,
            "orientation": "portrait"
        }
    },
    {
        "id": "add_objects",
        "name": "Add the Objects",
        "description": "Count and add two groups of fun emojis to find the total sum and write the answer in numeric form.",
        "base_config": {
            "challenges_count": 4,
            "max_count": 10,
            "orientation": "portrait"
        }
    }
]

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Create templates table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        base_config TEXT NOT NULL
    )
    """)
    
    # Create worksheets table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS worksheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        template_id TEXT NOT NULL,
        custom_config TEXT NOT NULL,
        generated_state TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES templates (id)
    )
    """)
    
    conn.commit()
    
    # Seed templates
    for t in DEFAULT_TEMPLATES:
        cursor.execute("SELECT id FROM templates WHERE id = ?", (t["id"],))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO templates (id, name, description, base_config) VALUES (?, ?, ?, ?)",
                (t["id"], t["name"], t["description"], json.dumps(t["base_config"]))
            )
    
    conn.commit()
    conn.close()

# API DB Helpers
def get_all_templates():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM templates")
    rows = cursor.fetchall()
    conn.close()
    
    templates = []
    for r in rows:
        templates.append({
            "id": r["id"],
            "name": r["name"],
            "description": r["description"],
            "base_config": json.loads(r["base_config"])
        })
    return templates

def get_template_by_id(template_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM templates WHERE id = ?", (template_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row["id"],
            "name": row["name"],
            "description": row["description"],
            "base_config": json.loads(row["base_config"])
        }
    return None

def get_all_worksheets():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT w.*, t.name as template_name 
        FROM worksheets w 
        JOIN templates t ON w.template_id = t.id
        ORDER BY w.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    worksheets = []
    for r in rows:
        worksheets.append({
            "id": r["id"],
            "title": r["title"],
            "template_id": r["template_id"],
            "template_name": r["template_name"],
            "custom_config": json.loads(r["custom_config"]),
            "generated_state": json.loads(r["generated_state"]),
            "created_at": r["created_at"]
        })
    return worksheets

def get_worksheet_by_id(worksheet_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT w.*, t.name as template_name 
        FROM worksheets w 
        JOIN templates t ON w.template_id = t.id
        WHERE w.id = ?
    """, (worksheet_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row["id"],
            "title": row["title"],
            "template_id": row["template_id"],
            "template_name": row["template_name"],
            "custom_config": json.loads(row["custom_config"]),
            "generated_state": json.loads(row["generated_state"]),
            "created_at": row["created_at"]
        }
    return None

def create_worksheet(title, template_id, custom_config, generated_state):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO worksheets (title, template_id, custom_config, generated_state) VALUES (?, ?, ?, ?)",
        (title, template_id, json.dumps(custom_config), json.dumps(generated_state))
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return get_worksheet_by_id(new_id)

def delete_worksheet_by_id(worksheet_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM worksheets WHERE id = ?", (worksheet_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted
