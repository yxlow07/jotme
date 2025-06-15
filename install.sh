#!/bin/bash

echo "Installing Python packages..."
pip install fastapi uvicorn pydantic keybert langchain-google-genai sentence-transformers transformers torch networkx spacy hf_xet

echo "Downloading spaCy English model..."
python -m spacy download en_core_web_sm

echo "All tasks completed."
read -p "Press enter to continue"