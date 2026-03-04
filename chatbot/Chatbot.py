import pickle
import json
import random

model = pickle.load(open("chatbot/model.pkl", "rb"))
vectorizer = pickle.load(open("chatbot/vectorizer.pkl", "rb"))

with open("chatbot/intents.json") as file:
    intents = json.load(file)

def get_response(message):
    X = vectorizer.transform([message])
    tag = model.predict(X)[0]

    for intent in intents["intents"]:
        if intent["tag"] == tag:
            return random.choice(intent["responses"])

    # Fallback if tag not matched
    for intent in intents["intents"]:
        if intent["tag"] == "fallback":
            return random.choice(intent["responses"])

    return "I'm not sure I understand. Try asking about our guitars, prices, or how to order! 🎸"
