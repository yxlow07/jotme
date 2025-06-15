from fastapi import FastAPI
from pydantic import BaseModel
from diaryProcessor import DiaryProcessor
import networkx as nx
import ast
from langchain_google_genai import ChatGoogleGenerativeAI

app = FastAPI()
diary_processor = DiaryProcessor()

class DiaryEntry(BaseModel):
    text: str

@app.post("/process/")
async def process_diary_entry(entry: DiaryEntry):
    text = entry.text
    keywords, graph, emotions, mood_score = diary_processor.process(text)
    graph_data = nx.node_link_data(graph)

    return {
        "keywords": keywords,
        "graph": graph_data,
        "emotions": emotions,
        "mood_score": mood_score
    }

@app.post("/save_diary")
async def save_diary_entry(entry: DiaryEntry):
    keywords, graph, emotions, mood_score = diary_processor.process(entry.text)

    with open("diary_entries.txt", "a") as file:
        file.write(f"{entry.text}\n{keywords}\n{emotions}\n{graph.__dict__}\n{mood_score}\n\n")

    return {"message": "Diary entry saved successfully."}

@app.get("/list_all")
async def list_all_entries():
    try:
        with open("diary_entries.txt", "r") as file:
            content = file.read().strip().split("\n\n")
            entries = []

            for entry in content:
                lines = entry.strip().split("\n")
                if len(lines) < 5:
                    continue  # skip incomplete entries
                text = lines[0]
                keywords = ast.literal_eval(lines[1])
                emotions = ast.literal_eval(lines[2])
                graph = ast.literal_eval(lines[3])
                mood_score = int(lines[4])
                entries.append({
                    "text": text,
                    "keywords": keywords,
                    "emotions": emotions,
                    "graph": graph,
                    "mood_score": mood_score
                })

            return {"entries": entries}
        
    except FileNotFoundError:
        return {"entries": []}
    except Exception as e:
        return {"error": str(e)}
    
@app.get("/suggestive_prompts")
async def suggestive_prompts():
    try:
        data = await list_all_entries()
        last_entry = data['entries'][-1] if data['entries'] else None
        if not last_entry:
            return {"prompts": []}
        
        user_text = last_entry["text"]
        prompt = (
            "Given the following diary entry that the user had written yesterday, suggest 3 short thoughtful follow-up prompts, related to the entry, and not soul sucking questions or generic questions. For each object, only ask 1 prompt, for example, only 1 prompt should be related to dogs, none other should be related to dogs at all."
            "to help the user reflect further:\n\n Separate the prompts with a new line. If you have no objects or events to prompt on, ask about their day\n\n"
            f"Diary Entry: {user_text}\n\nPrompts:"
        )
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.6,
            max_output_tokens=1000,
            api_key="AIzaSyA-W1A_VAulKkw6H3XOEZjpjCTFGTnCpnc",
        )
        response = llm.invoke(prompt)
        prompts = response.content.strip().split('\n')
        prompts = [prompt.strip() for prompt in prompts if prompt.strip()]

        if not prompts:
            return {"prompts": [""]}
        
        return {"prompts": prompts}
    except Exception as e:
        return {"error": str(e)}
    
@app.get("/monthly_summary")
async def monthly_summary():
    try:
        data = await list_all_entries()
        entries = data['entries'][-30:]
        if not entries:
            return {"summary": "No diary entries found for this month."}

        user_texts = "\n".join([entry["text"] for entry in entries])
        prompt = (
            "Given the following diary entries, summarize the key themes, emotions, and events of the month. "
            "Focus on the most significant aspects and avoid generic summaries. Give suggestions on how the user could improve on his/her mood. Focus on highly repeated words and also use some emojis. Start directly by giving a summary, no need to address the user. Do not use any formatting, everything should be in 2 paragraphs with no MD formatting\n\n"
            f"Diary Entries:\n{user_texts}\n\nSummary:"
        )
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=1.5,
            max_output_tokens=1000,
            api_key="AIzaSyA-W1A_VAulKkw6H3XOEZjpjCTFGTnCpnc",
        )
        response = llm.invoke(prompt)
        summary = response.content.strip()

        return {"summary": summary}
    except Exception as e:
        return {"error": str(e)}