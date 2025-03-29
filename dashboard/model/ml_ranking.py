import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os

class CandidateRanker:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.scaler = StandardScaler()
        self.rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.tfidf = TfidfVectorizer(max_features=1000)
        self.model_path = 'model/saved_models'
        
        # Create directory if it doesn't exist
        if not os.path.exists(self.model_path):
            os.makedirs(self.model_path)
    
    def extract_features(self, resume_text, required_skills):
        """Extract features from resume text and required skills."""
        # Process text with spaCy
        doc = self.nlp(resume_text.lower())
        
        # Extract years of experience
        experience_pattern = r'(\d+)\+?\s*years?'
        import re
        experience_matches = re.findall(experience_pattern, resume_text.lower())
        years_experience = float(experience_matches[0]) if experience_matches else 0
        
        # Count required skills mentioned
        required_skills_list = [skill.strip().lower() for skill in required_skills.split(',')]
        skills_mentioned = sum(1 for skill in required_skills_list if skill in resume_text.lower())
        
        # Calculate text similarity using TF-IDF
        texts = [resume_text, required_skills]
        tfidf_matrix = self.tfidf.fit_transform(texts)
        similarity_score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        
        return np.array([
            similarity_score,
            years_experience,
            skills_mentioned,
            len(resume_text) / 1000  # Resume length feature
        ])
    
    def rank_candidates(self, resumes, required_skills):
        """Rank multiple candidates using feature-based scoring."""
        rankings = []
        
        for resume in resumes:
            # Extract features
            features = self.extract_features(resume['text'], required_skills)
            
            # Calculate score based on features
            skill_score = (features[2] / max(len(required_skills.split(',')), 1)) * 40  # Up to 40 points for skills
            exp_score = min(features[1] * 5, 30)  # Up to 30 points for experience
            similarity_score = features[0] * 30  # Up to 30 points for relevance
            
            # Combine scores
            total_score = skill_score + exp_score + similarity_score
            total_score = min(98.5, total_score)  # Cap at 98.5
            
            rankings.append({
                'name': resume['name'],
                'email': resume['email'],
                'technologies': resume['technologies'],
                'score': round(total_score, 2)
            })
        
        # Sort by score in descending order
        rankings.sort(key=lambda x: x['score'], reverse=True)
        
        # Return top 5 candidates
        return rankings[:5] 