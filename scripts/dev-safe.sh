#!/bin/bash
# Safe dev server starter - ensures only 1 instance running

PORT=3000

echo "🔍 Checking for existing processes on port $PORT..."

EXISTING=$(lsof -ti:$PORT | wc -l | xargs)

if [ "$EXISTING" -gt "0" ]; then
  echo "⚠️  Found $EXISTING process(es) on port $PORT"
  echo "🛑 Killing existing processes..."
  kill -9 $(lsof -ti:$PORT) 2>/dev/null
  sleep 2
  echo "✅ Cleaned up"
else
  echo "✅ Port $PORT is clear"
fi

echo "🚀 Starting dev server..."
npm run dev
