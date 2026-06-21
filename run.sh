#!/usr/bin/env bash

# Papyro Production Startup Script
# Compatible with BASH and FISH environments when executed as a script (e.g. ./run.sh)

# Exit immediately if a command exits with a non-zero status
set -e

# Get current script path
SRC_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" && pwd )"
cd "$SRC_DIR"

echo "========================================="
echo "📝 Starting Papyro Worksheet Production Server"
echo "========================================="

# 1. Verify/Create Virtual Environment
if [ ! -d "venv" ]; then
  echo "📦 Virtual environment 'venv' not found. Creating..."
  python3 -m venv venv
fi

# 2. Activate environment
echo "🔌 Activating virtual environment..."
# Check if running in Fish shell context (for sourcing directly)
if [ -n "$FISH_VERSION" ]; then
  echo "⚠️ Sourcing in Fish shell detected. Please run this script directly as './run.sh' instead."
fi
source venv/bin/activate

# 3. Verify dependencies (run manually if packages change)
# pip install -r requirements.txt

# 4. Start Production Server
PORT=9028
echo "🌐 Production server is spinning up on http://0.0.0.0:$PORT"
echo "========================================="

# Run Uvicorn with multiple workers for production scaling
exec python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4
