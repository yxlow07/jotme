import spacy
import networkx as nx
from keybert import KeyBERT
from transformers import pipeline

class DiaryProcessor():
    def __init__(self):
        self.model = KeyBERT()
        self.nlp = spacy.load("en_core_web_sm")
        self.emotion_classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=None)
        self.emotion_valence = {
            "joy": 1.0,
            "surprise": 0.6,
            "neutral": 0.4,
            "fear": 0.3,
            "sadness": 0.0,
            "anger": 0.1,
            "disgust": 0.2
        }

        print("Diary Processor initialized")

    def extract_keywords(self, text):
        top_n = max(10, text.count(' ') // 10 + 1)
        keywords = self.model.extract_keywords(text, keyphrase_ngram_range=(1, 2), stop_words='english', top_n=top_n)

        return [keyword[0] for keyword in keywords]
    
    def build_graph(self, text, keywords):
        G = nx.Graph()
        G.add_nodes_from(keywords)
        doc = self.nlp(text)
        sentences = [sent.text for sent in doc.sents]

        for sentence in sentences:
            sentence_keywords = [kw for kw in keywords if kw in sentence.lower()]
            for i in range(len(sentence_keywords)):
                for j in range(i + 1, len(sentence_keywords)):
                    G.add_edge(sentence_keywords[i], sentence_keywords[j])

        return G
    
    def analyze_emotions(self, text):
        results = self.emotion_classifier(text)[0]
        emotions = {result['label']: result['score'] for result in results}

        emotions = {emotion: score for emotion, score in emotions.items() if score >= 0.01}
        emotions = dict(sorted(emotions.items(), key=lambda item: item[1], reverse=True))
        total_score = sum(emotions.values())
        if total_score > 0:
            emotions = {emotion: score / total_score for emotion, score in emotions.items()}
        emotions = {emotion: round(score, 2) for emotion, score in emotions.items()}
        
        if not emotions:
            return {}  

        return emotions
    
    def emotions_to_score(self, emotions):
        score = 0.0
        total = 0.0

        for emotion, weight in emotions.items():
            valence = self.emotion_valence.get(emotion, 0.5)
            score += weight * valence
            total += weight

        if total == 0:
            return 50
        mood_score = int(score / total * 100)

        return max(0, min(100, mood_score))
    
    def process(self, text):
        keywords = self.extract_keywords(text)
        graph = self.build_graph(text, keywords)
        emotions = self.analyze_emotions(text)
        mood_score = self.emotions_to_score(emotions)

        return keywords, graph, emotions, mood_score