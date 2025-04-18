// UI State Management
let currentView = 'dashboard';
let techDistributionChart = null;

// Form visibility management
function showSingleUpload() {
    document.getElementById('singleUploadForm').classList.remove('hidden');
    document.getElementById('multipleUploadForm').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
}

function showMultipleUpload() {
    document.getElementById('multipleUploadForm').classList.remove('hidden');
    document.getElementById('singleUploadForm').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
}

function showResults() {
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('singleUploadForm').classList.add('hidden');
    document.getElementById('multipleUploadForm').classList.add('hidden');
}

// Handle single resume upload
document.addEventListener('DOMContentLoaded', function() {
    const singleForm = document.getElementById('singleResumeForm');
    if (singleForm) {
        singleForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            
            try {
                submitButton.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>';
                submitButton.disabled = true;
                
                const response = await fetch('/analyze_single', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    await loadResults();
                    showResults();
                } else {
                    alert(data.error || 'An error occurred during analysis');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during analysis');
            } finally {
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }

    // Handle multiple resumes upload
    const multipleForm = document.getElementById('multipleResumesForm');
    if (multipleForm) {
        multipleForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            
            try {
                submitButton.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>';
                submitButton.disabled = true;
                
                const response = await fetch('/analyze_multiple', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    await loadResults();
                    showResults();
                } else {
                    alert(data.error || 'An error occurred during analysis');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during analysis');
            } finally {
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
});

// Load and display results
async function loadResults() {
    try {
        const response = await fetch('/get_results');
        const data = await response.text();
        populateTable(data);
    } catch (error) {
        console.error('Error loading results:', error);
        alert('Error loading results');
    }
}

// Copy email to clipboard
function copyEmail(email) {
    navigator.clipboard.writeText(email).then(() => {
        alert('Email copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy email:', err);
        alert('Failed to copy email');
    });
}

// Populate results table
function populateTable(csvData) {
    const tableBody = document.getElementById('resultsTable');
    tableBody.innerHTML = ''; // Clear existing results
    
    // Parse CSV data into array of objects
    const rows = csvData.split('\n').slice(1); // Skip header row
    const parsedData = rows.map(row => {
        const columns = row.split(',');
        return {
            name: columns[0] || 'N/A',
            email: columns[1] || 'N/A',
            technologies: columns[2] ? columns[2].replace(/"/g, '').trim() : 'N/A',
            score: parseFloat(columns[3]) || 0
        };
    });
    
    // Create table rows for first 5 results only
    parsedData.slice(0, 5).forEach((data, index) => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${data.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center space-x-2">
                    <span>${data.email}</span>
                    <button onclick="copyEmail('${data.email}')" class="text-indigo-600 hover:text-indigo-900">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                        </svg>
                    </button>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${data.technologies}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="sendEmail('${data.email}')" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Send Mail
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function getScoreColor(score) {
    if (score >= 90) return 'text-green-600 font-bold';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-500';
}

function sendEmail(email) {
    // Google Forms link
    const formLink = 'https://forms.gle/yJpYnVEk94p98tsX6';
    
    // Email subject and body
    const subject = 'Complete Your Application Form';
    const body = `Dear Candidate,\n\nThank you for your interest. Please complete the following form to proceed with your application:\n\n${formLink}\n\nBest regards,\nRecruitment Team`;
    
    // Create mailto URL with encoded parameters
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open default email client
    window.location.href = mailtoUrl;
}

// Handle file input change for visual feedback
document.addEventListener('DOMContentLoaded', function() {
    // Single resume upload feedback
    const singleFileInput = document.querySelector('#singleResumeForm input[type="file"]');
    if (singleFileInput) {
        singleFileInput.addEventListener('change', function(e) {
            updateFileUploadText(this, 'single');
        });
    }

    // Multiple resume upload feedback
    const multipleFileInput = document.querySelector('#multipleResumesForm input[type="file"]');
    if (multipleFileInput) {
        multipleFileInput.addEventListener('change', function(e) {
            updateFileUploadText(this, 'multiple');
        });
    }
});

// Update file upload text
function updateFileUploadText(input, type) {
    const container = input.closest('label');
    const textElement = container.querySelector('p');
    
    if (type === 'single') {
        if (input.files.length > 0) {
            textElement.textContent = `Selected: ${input.files[0].name}`;
            container.classList.add('border-green-500');
            container.classList.remove('border-dashed');
        } else {
            textElement.textContent = 'Drag and drop your resume or click to browse';
            container.classList.remove('border-green-500');
            container.classList.add('border-dashed');
        }
    } else {
        if (input.files.length > 0) {
            textElement.textContent = `Selected ${input.files.length} file(s)`;
            container.classList.add('border-green-500');
            container.classList.remove('border-dashed');
        } else {
            textElement.textContent = 'Drag and drop multiple resumes or click to browse';
            container.classList.remove('border-green-500');
            container.classList.add('border-dashed');
        }
    }
}

// Keep track of previous stats for change calculation
let previousStats = {
    total_resumes: 0,
    match_rate: 0,
    processing_time: 0
};

// Update dashboard stats
function updateDashboardStats() {
    fetch('/get_stats')
        .then(response => response.json())
        .then(data => {
            // Update total resumes
            document.getElementById('totalResumes').textContent = data.total_resumes;
            
            // Only show changes if we have processed resumes
            if (data.total_resumes > 0) {
                const resumeChange = ((data.total_resumes - previousStats.total_resumes) / Math.max(previousStats.total_resumes, 1)) * 100;
                document.getElementById('resumeChange').textContent = 
                    `${resumeChange >= 0 ? '+' : ''}${resumeChange.toFixed(1)}% from last update`;
                
                // Update match rate with percentage
                document.getElementById('matchRate').textContent = `${data.match_rate.toFixed(1)}%`;
                const matchRateChange = data.match_rate - previousStats.match_rate;
                document.getElementById('matchRateChange').textContent = 
                    `${matchRateChange >= 0 ? '↑' : '↓'} ${Math.abs(matchRateChange).toFixed(1)}% change`;
                
                // Update processing time
                document.getElementById('processingTime').textContent = `${data.processing_time.toFixed(1)}s`;
                const timeChange = previousStats.processing_time - data.processing_time;
                document.getElementById('processingTimeChange').textContent = 
                    `${timeChange >= 0 ? '↓' : '↑'} ${Math.abs(timeChange).toFixed(1)}s change`;
            } else {
                // Reset display when no resumes
                document.getElementById('resumeChange').textContent = 'Upload resumes to start';
                document.getElementById('matchRate').textContent = '0%';
                document.getElementById('matchRateChange').textContent = 'No data yet';
                document.getElementById('processingTime').textContent = '0s';
                document.getElementById('processingTimeChange').textContent = 'Waiting for uploads';
            }
            
            // Store current stats as previous for next update
            previousStats = { ...data };
        })
        .catch(error => console.error('Error updating stats:', error));
}

// Update stats every 5 seconds
setInterval(updateDashboardStats, 5000);

// Update last updated time
function updateLastUpdated() {
    const now = new Date();
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
        lastUpdated.textContent = now.toLocaleString();
    }
}

// Refresh dashboard data
function refreshData() {
    updateLastUpdated();
    updateDashboardStats();
    if (currentView === 'results') {
        loadResults();
    }
}

// Initialize dashboard
updateLastUpdated();
updateDashboardStats();

// Theme management
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    const lightIcon = document.querySelector('.theme-toggle-light');
    const darkIcon = document.querySelector('.theme-toggle-dark');
    
    if (isDark) {
        html.classList.remove('dark');
        html.classList.add('light');
        lightIcon.classList.remove('hidden');
        darkIcon.classList.add('hidden');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.remove('light');
        html.classList.add('dark');
        lightIcon.classList.add('hidden');
        darkIcon.classList.remove('hidden');
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    const lightIcon = document.querySelector('.theme-toggle-light');
    const darkIcon = document.querySelector('.theme-toggle-dark');
    
    if (savedTheme === 'dark') {
        html.classList.add('dark');
        html.classList.remove('light');
        lightIcon.classList.add('hidden');
        darkIcon.classList.remove('hidden');
    } else {
        html.classList.add('light');
        html.classList.remove('dark');
        lightIcon.classList.remove('hidden');
        darkIcon.classList.add('hidden');
    }
});

// Navigation handling
document.addEventListener('DOMContentLoaded', function() {
    // Add hash change listener for navigation
    window.addEventListener('hashchange', handleNavigation);
    handleNavigation(); // Handle initial navigation
    
    // Initialize other event listeners
    initializeFormListeners();
    initializeFileUploadListeners();
    
    // Start periodic updates
    updateDashboardStats();
    setInterval(updateDashboardStats, 5000);
});

function handleNavigation() {
    const hash = window.location.hash || '#dashboard';
    const sections = {
        '#dashboard': document.querySelector('.ml-64.p-8 > div:not(#technologyTrendsSection)'),
        '#technology': document.getElementById('technologyTrendsSection')
    };
    
    // Update navigation highlighting
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === hash) {
            link.classList.add('bg-indigo-50', 'text-indigo-600');
        } else {
            link.classList.remove('bg-indigo-50', 'text-indigo-600');
        }
    });
    
    // Show/hide sections
    Object.entries(sections).forEach(([sectionHash, element]) => {
        if (element) {
            if (sectionHash === hash) {
                element.classList.remove('hidden');
                if (sectionHash === '#technology') {
                    loadTechnologyTrends();
                }
            } else {
                element.classList.add('hidden');
            }
        }
    });
}

// Technology Trends Functions
async function loadTechnologyTrends() {
    try {
        const response = await fetch('/get_tech_trends');
        const data = await response.json();
        updateTechnologyChart(data);
        updateTechnologyTable(data);
    } catch (error) {
        console.error('Error loading technology trends:', error);
    }
}

function updateTechnologyChart(data) {
    const ctx = document.getElementById('techDistributionChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (techDistributionChart) {
        techDistributionChart.destroy();
    }
    
    techDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.technology),
            datasets: [{
                label: 'Technology Distribution',
                data: data.map(item => item.count),
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

function updateTechnologyTable(data) {
    const tableBody = document.getElementById('techTrendsTable');
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const tr = document.createElement('tr');
        const trendIcon = item.trend === 'Medium' ? '→' : (item.trend === 'High' ? '↑' : '↓');
        const trendClass = item.trend === 'Medium' ? 'text-yellow-500' : (item.trend === 'High' ? 'text-green-500' : 'text-red-500');
        
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.technology}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.count}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.percentage}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${trendClass}">${trendIcon} ${item.trend}</td>
        `;
        
        tableBody.appendChild(tr);
    });
} 