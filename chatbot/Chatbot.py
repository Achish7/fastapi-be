import json
import random
import pickle
import os


base_path = os.path.dirname(__file__)

# Load intents and local sklearn model
with open(os.path.join(base_path, "intents.json")) as f:
    data = json.load(f)

_model = pickle.load(open(os.path.join(base_path, "model.pkl"), "rb"))
_vectorizer = pickle.load(open(os.path.join(base_path, "vectorizer.pkl"), "rb"))
_responses_map = {intent["tag"]: intent["responses"] for intent in data["intents"]}


def get_response(message: str) -> str:
    message = (message or "").strip()
    if not message:
        return "Please type a question so I can help you."

    try:
        X = _vectorizer.transform([message])
        tag = _model.predict(X)[0]
        responses = _responses_map.get(tag, _responses_map.get("fallback", ["I'm not sure about that."]))
        return random.choice(responses)
    except Exception as exc:
        return f"Sorry, I had a problem: {exc}"
