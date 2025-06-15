@echo off
echo Installing Python packages...
pip install keybert sentence-transformers transformers torch networkx spacy hf_xet

echo Downloading spaCy English model...
python -m spacy download en_core_web_sm

echo All tasks completed.
pause