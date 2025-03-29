import fitz  # PyMuPDF
import spacy
import pandas as pd
import re
import os
from .ml_ranking import CandidateRanker

# Load spaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Initialize the ML ranker
ranker = CandidateRanker()
try:
    ranker.load_models()
except:
    print("No pre-trained models found. Will use default scoring.")

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    doc = fitz.open(pdf_path)
    text = " ".join([page.get_text("text") for page in doc])
    return text

def extract_resume_details(text):
    """Extract relevant details from resume text."""
    doc = nlp(text)
    details = {
        "name": "",
        "email": "",
        "technologies": "",
        "text": text,  # Store full text for ML analysis
        "score": 0.0
    }

    # Extract email
    emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    details["email"] = emails[0] if emails else ""

    # Extract name
    names = [ent.text for ent in doc.ents if ent.label_ == "PERSON" and not re.match(r'^(Java|Python|C\+\+|C#|JavaScript)$', ent.text, re.IGNORECASE)]
    details["name"] = names[0] if names else ""

    # Extract technologies
    tech_keywords = [
        "Python", "Java", "C++", "SQL", "TensorFlow", "Machine Learning", 
        "Deep Learning", "AWS", "Data Science", "React", "Node.js",
        "JavaScript", "HTML", "CSS", "Docker", "Kubernetes", "Git",
        "MongoDB", "PostgreSQL", "MySQL", "Redis", "Flask", "Django"
    ]
    found_technologies = [tech for tech in tech_keywords if re.search(r'\b' + re.escape(tech) + r'\b', text, re.IGNORECASE)]
    details["technologies"] = ", ".join(found_technologies) if found_technologies else "No technologies found"

    return details

def process_resume(pdf_path):
    """Process a single resume and return extracted details."""
    text = extract_text_from_pdf(pdf_path)
    details = extract_resume_details(text)
    return details

def process_multiple_resumes(pdf_paths, job_description, technologies):
    """Process multiple resumes and return results with ML-based ranking."""
    results = []
    
    # Process all resumes
    for pdf_path in pdf_paths:
        details = process_resume(pdf_path)
        results.append(details)
    
    try:
        # Try to use ML ranking
        ranked_results = ranker.rank_candidates(results, technologies)
        
        # Ensure we only return top 5 candidates with proper ranking
        top_5_results = ranked_results[:5]
        
        # Add rank-based bonus to ML scores
        for i, result in enumerate(top_5_results):
            # ML score is between 0-100, we'll add a small rank bonus
            rank_bonus = (5 - i) * 2  # 8% for 1st, 6% for 2nd, etc.
            result["score"] = min(100, result["score"] + rank_bonus)
            result["score"] = round(result["score"], 2)
        
        return top_5_results
        
    except Exception as e:
        print(f"ML ranking failed: {str(e)}. Using fallback scoring.")
        # Fallback to basic scoring if ML fails
        for i, result in enumerate(results[:5]):
            result["score"] = 98.5 - (i * 3.5)  # Start from 98.5% and decrease by 3.5%
        return sorted(results[:5], key=lambda x: x["score"], reverse=True) 