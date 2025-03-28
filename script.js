// Sample data - In a real application, this would come from your backend
const sampleData = {
    uploadTrends: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        data: [65, 59, 80, 81, 56, 55, 40]
    },
    topResumes: [
        { name: 'Kunal Ushinkar', score: 98, skills: ['Python', 'Machine Learning', 'NLP'] },
        { name: 'Dakshith Shetty', score: 95, skills: ['Data Science', 'Deep Learning', 'SQL'] },
        { name: 'Kaushal Tare', score: 92, skills: ['Java', 'Spring Boot', 'AWS'] },
        { name: 'Atharv Sawant', score: 90, skills: ['React', 'Node.js', 'MongoDB'] },
        { name: 'Vaibhav Tatkare', score: 88, skills: ['C++', 'Computer Vision', 'TensorFlow'] }
    ]
};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    updateTopResumes();
    updateLastUpdated();
    setupFileUpload();
});

// Process emails function
function processEmails() {
    // Here you would connect to your email processing backend
    console.log('Processing emails from inbox...');
    // Show processing notification
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-stormy-dark text-white p-4 rounded-lg shadow-lg';
    notification.textContent = 'Processing emails from inbox...';
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show email instructions modal
function showEmailInstructions() {
    const modal = document.getElementById('emailInstructionsModal');
    modal.classList.remove('hidden');
    // Prevent scrolling on the background
    document.body.style.overflow = 'hidden';
}

// Hide email instructions modal
function hideEmailInstructions() {
    const modal = document.getElementById('emailInstructionsModal');
    modal.classList.add('hidden');
    // Restore scrolling
    document.body.style.overflow = 'auto';
}

// Copy email address to clipboard
function copyEmail() {
    const email = 'upload@resumeradar.ai';
    navigator.clipboard.writeText(email).then(() => {
        // Show a temporary success message
        const codeElement = document.querySelector('code');
        const originalText = codeElement.textContent;
        codeElement.textContent = 'Copied!';
        setTimeout(() => {
            codeElement.textContent = originalText;
        }, 2000);
    });
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('emailInstructionsModal');
    if (e.target === modal) {
        hideEmailInstructions();
    }
});

// Initialize the chart
function initializeChart() {
    const ctx = document.getElementById('uploadTrends').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sampleData.uploadTrends.labels,
            datasets: [{
                label: 'Resumes Uploaded',
                data: sampleData.uploadTrends.data,
                fill: true,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Weekly Resume Upload Trends'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update top resumes section
function updateTopResumes() {
    const topResumesContainer = document.getElementById('topResumes');
    topResumesContainer.innerHTML = '';

    sampleData.topResumes.forEach((resume, index) => {
        const resumeElement = document.createElement('div');
        resumeElement.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-lg';
        resumeElement.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full">
                    ${index + 1}
                </div>
                <div>
                    <h3 class="font-semibold">${resume.name}</h3>
                    <div class="flex flex-wrap gap-2 mt-1">
                        ${resume.skills.map(skill => `
                            <span class="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                                ${skill}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="text-right">
                <span class="text-lg font-bold text-indigo-600">${resume.score}%</span>
                <p class="text-sm text-gray-500">Match</p>
            </div>
        `;
        topResumesContainer.appendChild(resumeElement);
    });
}

// Update last updated timestamp
function updateLastUpdated() {
    const lastUpdated = document.getElementById('lastUpdated');
    lastUpdated.textContent = new Date().toLocaleTimeString();
}

// Setup file upload functionality
function setupFileUpload() {
    const fileInput = document.querySelector('input[type="file"]');
    const dropZone = document.querySelector('.border-dashed');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-indigo-500');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-indigo-500');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-indigo-500');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

// Handle uploaded files
function handleFiles(files) {
    for (const file of files) {
        if (file.type === 'application/pdf') {
            // Here you would typically upload the file to your server
            // and process it with your AI/ML model
            console.log(`Processing file: ${file.name}`);
            
            // Show upload feedback to user
            const feedback = document.createElement('div');
            feedback.className = 'mt-4 p-4 bg-green-100 text-green-700 rounded-lg';
            feedback.textContent = `Successfully uploaded ${file.name}. Processing...`;
            document.querySelector('.flex-col').appendChild(feedback);
            
            // Remove feedback after 3 seconds
            setTimeout(() => {
                feedback.remove();
            }, 3000);
        } else {
            alert('Please upload only PDF files.');
        }
    }
}

// Refresh dashboard data
function refreshData() {
    // In a real application, this would fetch new data from your backend
    updateTopResumes();
    updateLastUpdated();
} 