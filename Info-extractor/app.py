from flask import Flask, request, render_template
import os
from scripts.extract_text import extract_text_from_pdf, extract_text_from_docx
from scripts.extract_info import extract_info
from scripts.extract_skills import extract_skills
from scripts.job_match import match_resume_to_job

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def upload_resume():
    if request.method == "POST":
        file = request.files["resume"]
        job_description = request.form["job_description"]
        filename = file.filename
        file_path = os.path.join("data", filename)
        file.save(file_path)

        # Extract text from resume
        resume_text = extract_text_from_pdf(file_path) if filename.endswith(".pdf") else extract_text_from_docx(file_path)
        
        # Extract skills & info
        info = extract_info(resume_text)
        skills = extract_skills(resume_text)

        # Match with job description
        ats_score, missing_skills = match_resume_to_job(resume_text, job_description)

        return render_template("results.html", info=info, skills=skills, ats_score=ats_score, missing_skills=missing_skills)
    
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
