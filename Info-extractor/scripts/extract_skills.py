import spacy
import re

# Load SpaCy model
nlp = spacy.load("en_core_web_sm")

# Expanded tech skills list
TECH_SKILLS = {
    "python", "java", "c++", "c", "sql", "nosql", "mongodb", "postgresql", "mysql",
    "javascript", "typescript", "html", "css", "react", "angular", "node.js",
    "flask", "django", "fastapi", "spring", "tensorflow", "pytorch", "scikit-learn",
    "machine learning", "deep learning", "nlp", "opencv", "computer vision",
    "aws", "azure", "gcp", "docker", "kubernetes", "linux", "bash", "git",
    "rest api", "graphql", "hadoop", "spark", "kafka", "pandas", "numpy",
    "llm", "transformers", "bert", "rnn", "cnn", "lstm", "huggingface",
    "data structures", "algorithms", "fine-tuning", "hyperparameter tuning",
    "cloud computing", "big data", "tableau", "power bi", "data analysis",
}

def extract_skills(text):
    """Extracts technical skills from resume text."""
    text = text.lower()
    doc = nlp(text)
    
    extracted_skills = set()

    # Check for exact skill match
    for token in doc:
        if token.text in TECH_SKILLS:
            extracted_skills.add(token.text)

    # Also check for multi-word skills
    for phrase in TECH_SKILLS:
        if phrase in text:
            extracted_skills.add(phrase)

    return list(extracted_skills)

