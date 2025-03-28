from transformers import pipeline

classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def detect_bias(resume_text):
    labels = ["male", "female", "gender-neutral"]
    result = classifier(resume_text, labels)
    return result
