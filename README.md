# AI-Powered Resume Screening System

## 📌 Overview
This AI-powered Resume Screening System is designed to help recruiters automate and enhance the candidate selection process. The system extracts key information from resumes, processes it using Natural Language Processing (NLP) and Machine Learning (ML), and ranks candidates based on their suitability for a given job description.

## 🚀 Features
- **Automated Resume Parsing**: Extracts candidate details such as name, email, experience, skills, education, and certifications from PDF resumes.
- **Natural Language Processing (NLP)**: Uses spaCy to analyze text and identify key resume attributes.
- **Machine Learning-Based Candidate Scoring**: Implements a TF-IDF vectorizer and cosine similarity to calculate the ATS score based on job descriptions.
- **CSV Export**: Stores processed resume data, including ATS scores, in a CSV file for easy reference.
- **Top Candidate Selection**: Filters and displays the top 3 candidates based on ATS scores directly in the terminal.

## 🛠️ Technologies Used
- **Python** (Core scripting)
- **spaCy** (NLP for entity extraction)
- **PyMuPDF (fitz)** (PDF text extraction)
- **pandas** (Data processing and storage)
- **re** (Regular expressions for pattern matching)
- **scikit-learn** (TF-IDF and cosine similarity for candidate scoring)


## ⚙️ Installation & Setup
### Prerequisites
Ensure you have Python installed (>=3.7). Install the required dependencies using:
```bash
pip install -r requirements.txt
```

### Running the System
1. Place the resumes (PDF format) inside the `resumes/` folder.
2. Modify the `job_description` variable inside `resume_screening.py` to match your job criteria.
3. Run the script:
```bash
python resume_screening.py
```
4. View the top 3 candidates in the terminal and access the full report in `resume_data.csv`.

## 📊 Sample Output
### Output:
```
               name                       email experience  ...    degree                                       technologies   ats_score
1       Rahul Desai        rahuldesai@gmail.com    0 years  ...       mba                                   Machine Learning   75.457000
2       SumitYesade     sumityesade14@gmail.com    0 years  ...  Bachelor  Python, Java, SQL, Machine Learning, AWS, Reac...   99.041745
3   Vaibhav Tatkare  vaibhavtatkare@outlook.com    0 years  ...       mba  Python, Java, SQL, TensorFlow, Machine Learnin...   87.472489
```

## 📌 Future Enhancements
- **Web Interface**: Build a web-based dashboard for HR teams to upload resumes and view results interactively.
- **Bias Detection**: Implement algorithms to detect and mitigate biases in candidate selection.
- **Interview Scheduling**: Automate interview invitations for top candidates.

## 🏆 Acknowledgments
This project is part of Vaibhav Tatkare's AI-driven portfolio, aiming to enhance recruitment workflows with AI.

---
### ⭐ If you found this project useful, don't forget to star the repository!

