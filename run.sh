#!/bin/bash

echo "Running server"
python3 -m uvicorn main:app --reload --port 8000
echo "Server is running. Press Ctrl+C to stop."