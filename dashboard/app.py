from flask import Flask, render_template, request, jsonify, send_file
import os
import sys
from werkzeug.utils import secure_filename
import pandas as pd
import time

# Add the current directory to Python path to find the model module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from model.main import process_resume, process_multiple_resumes, calculate_score

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Global variables for stats
total_resumes = 0
match_rate = 0
processing_time = 0

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze_single', methods=['POST'])
def analyze_single():
    global total_resumes, match_rate, processing_time
    
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file uploaded'}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        start_time = time.time()
        try:
            result = process_resume(filepath)
            # Calculate score for single resume
            result["score"] = calculate_score(result, "", "Python, Java, Machine Learning")  # Default technologies
            processing_time = time.time() - start_time
            
            # Update stats
            total_resumes += 1
            match_rate = (match_rate * (total_resumes - 1) + result['score']) / total_resumes
            
            # Save results to CSV
            df = pd.DataFrame([result])
            df.to_csv('results.csv', index=False)
            
            return jsonify({'message': 'Analysis completed successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/analyze_multiple', methods=['POST'])
def analyze_multiple():
    global total_resumes, match_rate, processing_time
    
    if 'resumes' not in request.files:
        return jsonify({'error': 'No resume files uploaded'}), 400
    
    files = request.files.getlist('resumes')
    if not files or files[0].filename == '':
        return jsonify({'error': 'No selected files'}), 400
    
    job_description = request.form.get('job_description', '')
    technologies = request.form.get('technologies', '')
    
    filepaths = []
    try:
        # Save all files
        for file in files:
            if file and file.filename.endswith('.pdf'):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                filepaths.append(filepath)
        
        start_time = time.time()
        results = process_multiple_resumes(filepaths, job_description, technologies)
        processing_time = time.time() - start_time
        
        # Update stats
        total_resumes += len(results)
        new_match_rate = sum(r['score'] for r in results) / len(results)
        match_rate = (match_rate * (total_resumes - len(results)) + new_match_rate * len(results)) / total_resumes
        
        # Save results to CSV
        df = pd.DataFrame(results)
        df.to_csv('results.csv', index=False)
        
        return jsonify({'message': 'Analysis completed successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up uploaded files
        for filepath in filepaths:
            if os.path.exists(filepath):
                os.remove(filepath)

@app.route('/get_results')
def get_results():
    try:
        if os.path.exists('results.csv'):
            return send_file('results.csv', mimetype='text/csv')
        return '', 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_stats')
def get_stats():
    return jsonify({
        'total_resumes': total_resumes,
        'match_rate': round(match_rate * 100, 2),
        'processing_time': round(processing_time, 2)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001) 