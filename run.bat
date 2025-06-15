@echo off

echo "Running server"
uvicorn main:app --reload
echo "Server is running. Press Ctrl+C to stop."