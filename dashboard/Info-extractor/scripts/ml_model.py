import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# Load sample dataset
data = pd.read_csv("data/historical_hiring_data.csv")

# Preprocessing
encoder = LabelEncoder()
data["hired"] = encoder.fit_transform(data["hired"])

X = data[["skills_score", "experience_years"]]
y = data["hired"]

# Train model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier()
model.fit(X_train, y_train)

def predict_hiring_fit(skills_score, experience_years):
    return model.predict([[skills_score, experience_years]])[0]
