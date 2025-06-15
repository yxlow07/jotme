# JotMe

JotMe is a mood-tracking digital journalling website that uses NLP to analyze your diary entries and help you keep track of your emotional well-being.

## How it works
First, the journal entry is passed to the backend, where KeyBERT model extracts important keywords and phrases. These keywords are then used to build a context graph, which helps to recognise relations between them. After that, a transformer model, from hugging face, `j-hartmann/emotion-english-distilroberta-base` is used to analyse the emotions in the text. It is then used to calculate a score and find the most prominent emotion. Voila! An LLM is used to generate follow up prompts based on your latest entry, to help you reflect or improve. 

## Key Features
- **Keyword Extraction:** Using KeyBERT, we can extract important keywords
- **Context Graph:** Using keywords from the same sentence, build a context graph
- **Emotion & Sentiment Analysis:** Using pretrained transformer to detect emotions
- **Mood Scoring:** Calculates a mood score based on emotions.
- **Statistics:** Visualizes your mood trends and distributions over time.
- **Follow-up Prompts:** Suggests thoughtful, context-aware prompts for your next entry using LLM.
- **Monthly Summary:** Summarizes your month's diary entries with key themes, emotions, and suggestions.

## Usage

1. **Start the backend server on windows:**
   ```sh
   install.bat
   run.bat
   ```
   First, install all dependencies using `install.bat`.
   Then, launch the server at `http://127.0.0.1:8000` using `run.bat`.

1. **Start the backend server on macOS:**
   ```sh
   chmod +x install.sh
   ./install.sh
   chmod +x run.sh
   ./run.sh
   ```
   First, install all dependencies using `install.sh`.
   Then, launch the server at `http://127.0.0.1:8000` using `run.sh`.

# Important! Just open the `index.html` will do, don't open the 127.0.0.1:8000, that's the backend.

2. **Open the frontend:**
   - Open `index.html` in your web browser for the main diary interface.
   - Open `stats.html` to view your mood statistics and summaries.

3. **Any Errors:**
   - If you see a lot of downloading, don't worry, it is installing the AI models.
   - If you see some 404 errors, it is FastAPI is trying to read favicons, which is not needed.
   - Lastly, if you face an error saving, create a file `diary_entries.txt` in the root directory of the project first. It is not needed, as Python will create it automatically, but it is a workaround for some systems.

## API Endpoints

- `POST /process`: Analyze a diary entry (keywords, graph, emotions, mood score).
- `POST /save_diary`: Save a new diary entry.
- `GET /list_all`: List all diary entries.
- `GET /suggestive_prompts`: Get follow-up prompts based on the last entry.
- `GET /monthly_summary`: Get a monthly summary of your diary.

## Authors

- Dea Bhargava, Yu Xuan Low, Yuthika Kolla | LingHacks VI

With 💗, JotMe