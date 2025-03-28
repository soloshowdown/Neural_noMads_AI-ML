import fitz  # PyMuPDF
import spacy
import pandas as pd
import re
import os
import glob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load spaCy NLP model
nlp = spacy.load("en_core_web_sm")


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
        "experience": "",
        "technologies": [],
        "certificates": [],
        "grade": "",
        "degree": ""
    }

    # Extract email
    emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    details["email"] = emails[0] if emails else ""

    # Extract name (Avoid extracting programming languages or common words)
    names = [ent.text for ent in doc.ents if ent.label_ == "PERSON" and not re.match(r'^(Java|Python|C\+\+|C#|JavaScript)$', ent.text, re.IGNORECASE)]
    details["name"] = names[0] if names else ""

    # Extract degree (Common degree formats)
    degrees = re.findall(r'(B\.?Tech|M\.?Tech|B\.?Sc|M\.?Sc|MBA|PhD|Bachelor|Master|BE|ME|MCA|BCA|BBA|MS)', text, re.IGNORECASE)
    details["degree"] = degrees[0] if degrees else ""

    # Extract experience (Looking for 'years' keyword)
    exp_match = re.findall(r'(\d{1,2}\+? years?|\d{1,2}\.\d years?)', text)
    details["experience"] = exp_match[0] if exp_match else "0 years"

    # Extract grades (Common grade formats like CGPA, GPA, 9/10, 85%)
    grades = re.findall(r'(CGPA[:\s]\d{1,2}\.\d|\d{1,2}\/10|\d{2,3}%)', text)
    details["grade"] = grades[0] if grades else ""

    # Extract technologies
    tech_keywords = ["Python", "Java", "C++", "SQL", "TensorFlow", "Machine Learning", "Deep Learning", "AWS", "Data Science", "React", "Node.js"]
    found_technologies = [tech for tech in tech_keywords if re.search(r'\b' + re.escape(tech) + r'\b', text, re.IGNORECASE)]
    details["technologies"] = found_technologies

    # Extract certificates (Assumes certificate-related keywords like 'Certified')
    certificates = re.findall(r'(Certified|Certification in [A-Za-z\s]+)', text)
    details["certificates"] = certificates if certificates else []

    return details


def process_resumes(pdf_folder):
    """Process all resumes in the folder and save data in CSV."""
    data = []
    pdf_files = glob.glob(os.path.join(pdf_folder, "*.pdf"))

    for pdf in pdf_files:
        text = extract_text_from_pdf(pdf)
        details = extract_resume_details(text)
        data.append(details)

    df = pd.DataFrame(data)
    
    # Ensure technologies and certificates are stored as comma-separated values
    df["technologies"] = df["technologies"].apply(lambda x: ", ".join(x) if isinstance(x, list) else str(x))
    df["certificates"] = df["certificates"].apply(lambda x: ", ".join(x) if isinstance(x, list) else str(x))

    return df


def calculate_ats_scores(df, job_description):
    """Calculate ATS scores based on job description matching."""
    df["tech_degree"] = df["technologies"] + " " + df["degree"].astype(str)

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df["tech_degree"])
    job_vector = vectorizer.transform([job_description])
    scores = cosine_similarity(tfidf_matrix, job_vector).flatten()

    # Normalize ATS scores between 0 and 100
    df["ats_score"] = (scores / max(scores)) * 100 if max(scores) > 0 else 0

    return df


# Set the folder path for PDFs
pdf_folder = "resumes/"
job_description = "Python, Machine Learning, 3+ years experience, Bachelor's Degree in CS"

# Process resumes and calculate ATS scores
df = process_resumes(pdf_folder)
df = calculate_ats_scores(df, job_description)

# Save updated DataFrame with ATS scores
df.to_csv("resume_data.csv", index=False)
print("Updated resume data with ATS scores saved to resume_data.csv")

# Display top candidates
top_candidates = df.sort_values(by="ats_score", ascending=False).head(3)
print(top_candidates)
