import spacy
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scripts.extract_skills import TECH_SKILLS

# Load NLP model
nlp = spacy.load("en_core_web_sm")
nltk.download("stopwords")

# Common words to exclude
EXCLUDE_WORDS = set(stopwords.words("english")).union({
    "opportunity", "hour", "exciting", "facing", "familiar", "blog", "need", "excellent", "write", "expand", 
    "text", "paper", "join", "seek", "worry", "potential", "initially", "transformer", "lora", "job", "document", 
    "related", "expertise", "turn", "qualification", "work", "role", "fully", "increase", "article", "fit", "gpt", 
    "field", "lot", "remote", "generative", "people", "phone", "content", "strong", "topic", "site", "month", 
    "finetuning", "tech", "performance", "information", "bonus", "happy", "prefer", "complex", "engineer", 
    "explain", "communication", "reading", "pytorch", "hire", "read", "degree", "yes", "face", "adapt", 
    "validate", "keras", "open", "responsibility", "note", "long", "etc", "embedding", "journey", "min", 
    "extension", "x", "pay", "necessary", "client", "senior", "offer", "management", "common", "dsa", "ds"
})

def preprocess_text(text):
    """Lemmatizes and removes stopwords from text."""
    doc = nlp(text.lower())
    return " ".join([token.lemma_ for token in doc if token.is_alpha and token.lemma_ not in EXCLUDE_WORDS])

def match_resume_to_job(resume_text, job_description):
    """Computes ATS match score and identifies missing relevant skills."""
    if not resume_text or not job_description:
        return 0, []

    processed_resume = preprocess_text(resume_text)
    processed_job_desc = preprocess_text(job_description)

    # Compute similarity score
    vectorizer = CountVectorizer().fit_transform([processed_resume, processed_job_desc])
    vectors = vectorizer.toarray()
    similarity = cosine_similarity([vectors[0]], [vectors[1]])[0][0]
    match_score = round(similarity * 100, 2)

    # Extract relevant missing skills
    job_keywords = set(processed_job_desc.split())
    resume_keywords = set(processed_resume.split())

    missing_keywords = [word for word in job_keywords - resume_keywords if word in TECH_SKILLS]

    return match_score, missing_keywords
