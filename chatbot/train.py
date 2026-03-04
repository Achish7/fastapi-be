import json
import random
import pickle
import nltk
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression

nltk.download('punkt')  

# located the intents.json file:  
import os
base_path = os.path.dirname(__file__)
file_path = os.path.join(base_path, "intents.json")

with open(file_path) as file:

    data = json.load(file)

texts = []
labels = []

for intent in data["intents"]:
    for pattern in intent["patterns"]:
        texts.append(pattern)
        labels.append(intent["tag"])

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(texts)

model = LogisticRegression()
model.fit(X, labels)

pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))