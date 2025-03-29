import re
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_info(resume_text):
    doc = nlp(resume_text)
    
    # Extract Name
    name = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
    
    # Extract Email
    email = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", resume_text)
    
    # Extract Phone Number
    phone = re.findall(r"\b\d{10}\b", resume_text)
    
    return {
        "Name": name[0] if name else "N/A",
        "Email": email[0] if email else "N/A",
        "Phone": phone[0] if phone else "N/A"
    }
