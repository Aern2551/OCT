// Global variables
let uploadedFiles = [];
let currentImageIndex = 0;
let isLoggedIn = false;
let patientHistory = [];

// DOM elements
const loginScreen = document.getElementById('loginScreen');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const thumbnailGrid = document.getElementById('thumbnailGrid');
const fileCount = document.getElementById('fileCount');
const fileCountWarning = document.getElementById('fileCountWarning');
const analyzeBtn = document.getElementById('analyzeBtn');
const uploadInterface = document.getElementById('uploadInterface');
const historyInterface = document.getElementById('historyInterface');
const dashboardInterface = document.getElementById('dashboardInterface');
const resultsDashboard = document.getElementById('resultsDashboard');
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
const notificationBtn = document.getElementById('notificationBtn');
const notificationDropdown = document.getElementById('notificationDropdown');
const notificationContainer = document.getElementById('notificationContainer');

// Initialize sample patient history data
patientHistory = [
    { id: 'P001234', date: '2024-01-15', eye: 'Right', diagnosis: 'CNV', confidence: '94.3%', status: 'High Risk' },
    { id: 'P001235', date: '2024-01-14', eye: 'Left', diagnosis: 'Normal', confidence: '98.1%', status: 'Normal' },
    { id: 'P001236', date: '2024-01-13', eye: 'Both', diagnosis: 'DME', confidence: '89.7%', status: 'Moderate Risk' },
    { id: 'P001237', date: '2024-01-12', eye: 'Right', diagnosis: 'Drusen', confidence: '92.4%', status: 'High Risk' },
    { id: 'P001238', date: '2024-01-11', eye: 'Left', diagnosis: 'Normal', confidence: '96.8%', status: 'Normal' },
    { id: 'P001234', date: '2024-01-10', eye: 'Right', diagnosis: 'Other', confidence: '91.2%', status: 'High Risk' },
];

// Login functionality
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple validation (in real app, this would be server-side)
    if (username && password) {
        isLoggedIn = true;
        loginScreen.classList.add('hidden');
        showNotification('Login successful! Welcome to RetinaView AI', 'success');
        
        // Set current date
        document.getElementById('scanDate').value = new Date().toISOString().split('T')[0];
    } else {
        showNotification('Please enter valid credentials', 'error');
    }
});

// Notification system
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification p-4 rounded-lg shadow-lg text-white max-w-sm ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-sm font-medium">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Profile dropdown toggle
profileBtn.addEventListener('click', () => {
    profileDropdown.classList.toggle('hidden');
    notificationDropdown.classList.add('hidden');
});

// Notification dropdown toggle
notificationBtn.addEventListener('click', () => {
    notificationDropdown.classList.toggle('hidden');
    profileDropdown.classList.add('hidden');
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add('hidden');
    }
    if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
        notificationDropdown.classList.add('hidden');
    }
});

// Tab navigation
function switchTab(activeTab) {
    // Hide all interfaces
    uploadInterface.classList.add('hidden');
    historyInterface.classList.add('hidden');
    dashboardInterface.classList.add('hidden');
    resultsDashboard.classList.add('hidden');
    
    // Remove active class from all tabs
    document.querySelectorAll('[id$="Tab"]').forEach(tab => {
        tab.classList.remove('tab-active');
        tab.classList.add('border-transparent', 'text-gray-500');
        tab.classList.remove('text-green-500');
    });
    
    // Show selected interface and activate tab
    const tabBtn = document.getElementById(activeTab + 'Tab');
    tabBtn.classList.add('tab-active');
    tabBtn.classList.remove('border-transparent', 'text-gray-500');
    tabBtn.classList.add('text-green-500');
    
    if (activeTab === 'upload') {
        uploadInterface.classList.remove('hidden');
    } else if (activeTab === 'history') {
        historyInterface.classList.remove('hidden');
        loadPatientHistory();
    } else if (activeTab === 'dashboard') {
        dashboardInterface.classList.remove('hidden');
    }
}

// Tab event listeners
document.getElementById('uploadTab').addEventListener('click', () => switchTab('upload'));
document.getElementById('historyTab').addEventListener('click', () => switchTab('history'));
document.getElementById('dashboardTab').addEventListener('click', () => switchTab('dashboard'));

// Patient history functionality
function loadPatientHistory() {
    const tableBody = document.getElementById('historyTableBody');
    const resultCount = document.getElementById('resultCount');
    
    tableBody.innerHTML = '';
    
    patientHistory.forEach((record, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50';
        
        const statusColor = record.status === 'High Risk' ? 'text-red-600 bg-red-100' : 
                          record.status === 'Moderate Risk' ? 'text-yellow-600 bg-yellow-100' : 
                          'text-green-600 bg-green-100';
        
        row.innerHTML = `
            <td class="py-3 px-4 font-medium">${record.id}</td>
            <td class="py-3 px-4">${record.date}</td>
            <td class="py-3 px-4">${record.eye}</td>
            <td class="py-3 px-4">${record.diagnosis}</td>
            <td class="py-3 px-4">${record.confidence}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColor}">
                    ${record.status}
                </span>
            </td>
            <td class="py-3 px-4">
                <button onclick="viewPatientRecord('${record.id}', '${record.date}')" class="text-blue-600 hover:text-blue-700 text-sm font-medium mr-2">View</button>
                <button onclick="downloadPatientReport('${record.id}', '${record.date}')" class="text-green-600 hover:text-green-700 text-sm font-medium">Download</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    resultCount.textContent = `${patientHistory.length} records found`;
}

// Search patient history
document.getElementById('searchHistoryBtn').addEventListener('click', () => {
    const searchId = document.getElementById('searchPatientId').value.trim();
    const dateRange = document.getElementById('dateRange').value;
    const diagnosisFilter = document.getElementById('diagnosisFilter').value;
    
    let filteredHistory = patientHistory;
    
    // Filter by patient ID
    if (searchId) {
        filteredHistory = filteredHistory.filter(record => 
            record.id.toLowerCase().includes(searchId.toLowerCase())
        );
    }
    
    // Filter by diagnosis
    if (diagnosisFilter !== 'all') {
        filteredHistory = filteredHistory.filter(record => 
            record.diagnosis.toLowerCase().includes(diagnosisFilter.toLowerCase())
        );
    }
    
    // Update table with filtered results
    const tableBody = document.getElementById('historyTableBody');
    const resultCount = document.getElementById('resultCount');
    
    tableBody.innerHTML = '';
    
    filteredHistory.forEach((record, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50';
        
        const statusColor = record.status === 'High Risk' ? 'text-red-600 bg-red-100' : 
                          record.status === 'Moderate Risk' ? 'text-yellow-600 bg-yellow-100' : 
                          'text-green-600 bg-green-100';
        
        row.innerHTML = `
            <td class="py-3 px-4 font-medium">${record.id}</td>
            <td class="py-3 px-4">${record.date}</td>
            <td class="py-3 px-4">${record.eye}</td>
            <td class="py-3 px-4">${record.diagnosis}</td>
            <td class="py-3 px-4">${record.confidence}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColor}">
                    ${record.status}
                </span>
            </td>
            <td class="py-3 px-4">
                <button onclick="viewPatientRecord('${record.id}', '${record.date}')" class="text-blue-600 hover:text-blue-700 text-sm font-medium mr-2">View</button>
                <button onclick="downloadPatientReport('${record.id}', '${record.date}')" class="text-green-600 hover:text-green-700 text-sm font-medium">Download</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    resultCount.textContent = `${filteredHistory.length} records found`;
    
    if (filteredHistory.length > 0) {
        showNotification(`Found ${filteredHistory.length} matching records`, 'success');
    } else {
        showNotification('No records found matching your criteria', 'warning');
    }
});

// Patient record functions
function viewPatientRecord(patientId, date) {
    showNotification(`Opening record for ${patientId} from ${date}`, 'info');
    // In a real app, this would open a detailed view
}

function downloadPatientReport(patientId, date) {
    showNotification(`Downloading report for ${patientId} from ${date}`, 'success');
    // In a real app, this would trigger a PDF download
}

// Sign out functionality
document.querySelector('a[href="#"]:last-child').addEventListener('click', (e) => {
    e.preventDefault();
    isLoggedIn = false;
    loginScreen.classList.remove('hidden');
    showNotification('Signed out successfully', 'info');
});

// File upload functionality
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function processFiles(files) {
    // Filter valid image files
    const validFiles = files.filter(file => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/dicom'];
        return validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.dcm');
    });

    // Add to uploaded files (limit to 30)
    uploadedFiles = [...uploadedFiles, ...validFiles].slice(0, 30);
    
    updateFilePreview();
    updateAnalyzeButton();
}

function updateFilePreview() {
    if (uploadedFiles.length === 0) {
        filePreview.classList.add('hidden');
        return;
    }

    filePreview.classList.remove('hidden');
    fileCount.textContent = `${uploadedFiles.length}/30 files`;
    
    // Show/hide warning
    if (uploadedFiles.length < 10 || uploadedFiles.length > 30) {
        fileCountWarning.classList.remove('hidden');
    } else {
        fileCountWarning.classList.add('hidden');
    }

    // Generate thumbnails
    thumbnailGrid.innerHTML = '';
    uploadedFiles.forEach((file, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'relative group thumbnail cursor-pointer';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            thumbnail.innerHTML = `
                <img src="${e.target.result}" class="w-full h-16 object-cover rounded-lg border-2 border-gray-200 group-hover:border-green-500 transition-colors" alt="OCT ${index + 1}">
                <button class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors" onclick="removeFile(${index})">×</button>
                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">${index + 1}</div>
            `;
        };
        reader.readAsDataURL(file);
        
        thumbnailGrid.appendChild(thumbnail);
    });
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFilePreview();
    updateAnalyzeButton();
}

function updateAnalyzeButton() {
    const patientId = document.getElementById('patientId').value.trim();
    const scanDate = document.getElementById('scanDate').value;
    const eyeSelection = document.getElementById('eyeSelection').value;
    const hasValidFileCount = uploadedFiles.length >= 10 && uploadedFiles.length <= 30;
    
    const isValid = patientId && scanDate && eyeSelection && hasValidFileCount;
    analyzeBtn.disabled = !isValid;
}

// Form validation
['patientId', 'scanDate', 'eyeSelection'].forEach(id => {
    document.getElementById(id).addEventListener('change', updateAnalyzeButton);
    document.getElementById(id).addEventListener('input', updateAnalyzeButton);
});

// Analyze button functionality
analyzeBtn.addEventListener('click', startAnalysis);

function startAnalysis() {
    // Show loading state
    document.getElementById('analyzeText').textContent = 'Analyzing...';
    document.getElementById('loadingSpinner').classList.remove('hidden');
    document.getElementById('analysisProgress').classList.remove('hidden');
    analyzeBtn.disabled = true;

    // Simulate progress
    let progress = 0;
    const progressBar = document.getElementById('progressBar');
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(showResults, 500);
        }
    }, 200);
}

function showResults() {
    // Set patient ID in results
    document.getElementById('resultPatientId').textContent = document.getElementById('patientId').value;
    
    // Hide upload interface and show results
    uploadInterface.classList.add('hidden');
    resultsDashboard.classList.remove('hidden');
    
    // Generate sample OCT images for display
    generateSampleImages();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function generateSampleImages() {
    const imageCarousel = document.getElementById('imageCarousel');
    const imageGrid = document.getElementById('imageGrid');
    
    // Clear existing content
    imageCarousel.innerHTML = '';
    imageGrid.innerHTML = '';
    
    // Generate sample images (using uploaded files or placeholders)
    const imagesToShow = Math.min(uploadedFiles.length, 20);
    
    for (let i = 0; i < imagesToShow; i++) {
        const isAbnormal = Math.random() > 0.7; // 30% chance of abnormal
        
        // Create carousel item
        const carouselItem = document.createElement('div');
        carouselItem.className = `flex-shrink-0 ${isAbnormal ? 'abnormal-highlight' : ''}`;
        
        // Create grid item
        const gridItem = document.createElement('div');
        gridItem.className = `relative cursor-pointer ${isAbnormal ? 'abnormal-highlight' : ''}`;
        
        if (uploadedFiles[i]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgHTML = `
                    <img src="${e.target.result}" class="w-64 h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow" alt="OCT ${i + 1}" onclick="openImageModal(${i})">
                    ${isAbnormal ? '<div class="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></div>' : ''}
                `;
                carouselItem.innerHTML = imgHTML;
                
                const gridImgHTML = `
                    <img src="${e.target.result}" class="w-full h-24 object-cover rounded-lg" alt="OCT ${i + 1}" onclick="openImageModal(${i})">
                    ${isAbnormal ? '<div class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>' : ''}
                    <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg text-center">${i + 1}</div>
                `;
                gridItem.innerHTML = gridImgHTML;
            };
            reader.readAsDataURL(uploadedFiles[i]);
        } else {
            // Placeholder for demo
            const placeholderHTML = `
                <div class="w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span class="text-gray-500">OCT ${i + 1}</span>
                </div>
                ${isAbnormal ? '<div class="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></div>' : ''}
            `;
            carouselItem.innerHTML = placeholderHTML;
            
            const gridPlaceholderHTML = `
                <div class="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span class="text-gray-500 text-xs">${i + 1}</span>
                </div>
                ${isAbnormal ? '<div class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>' : ''}
            `;
            gridItem.innerHTML = gridPlaceholderHTML;
        }
        
        imageCarousel.appendChild(carouselItem);
        imageGrid.appendChild(gridItem);
    }
}

// View toggle functionality
document.getElementById('gridViewBtn').addEventListener('click', () => {
    document.getElementById('carouselView').classList.add('hidden');
    document.getElementById('gridView').classList.remove('hidden');
    document.getElementById('gridViewBtn').classList.add('bg-blue-600', 'text-white');
    document.getElementById('gridViewBtn').classList.remove('bg-gray-100', 'text-gray-700');
    document.getElementById('carouselViewBtn').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('carouselViewBtn').classList.add('bg-gray-100', 'text-gray-700');
});

document.getElementById('carouselViewBtn').addEventListener('click', () => {
    document.getElementById('gridView').classList.add('hidden');
    document.getElementById('carouselView').classList.remove('hidden');
    document.getElementById('carouselViewBtn').classList.add('bg-blue-600', 'text-white');
    document.getElementById('carouselViewBtn').classList.remove('bg-gray-100', 'text-gray-700');
    document.getElementById('gridViewBtn').classList.remove('bg-blue-600', 'text-white');
    document.getElementById('gridViewBtn').classList.add('bg-gray-100', 'text-gray-700');
});

// Back to upload functionality
document.getElementById('backToUpload').addEventListener('click', () => {
    resultsDashboard.classList.add('hidden');
    uploadInterface.classList.remove('hidden');
    
    // Reset analyze button
    document.getElementById('analyzeText').textContent = 'Analyze Now';
    document.getElementById('loadingSpinner').classList.add('hidden');
    document.getElementById('analysisProgress').classList.add('hidden');
    updateAnalyzeButton();
});

// Image modal functionality
function openImageModal(index) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const imageAnalysis = document.getElementById('imageAnalysis');
    
    if (uploadedFiles[index]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            modalImage.src = e.target.result;
        };
        reader.readAsDataURL(uploadedFiles[index]);
    }
    
    // Sample analysis data
    imageAnalysis.innerHTML = `
        <div class="space-y-2">
            <p><strong>Image ${index + 1} Analysis:</strong></p>
            <p>• Retinal thickness: ${Math.floor(Math.random() * 100 + 200)}μm</p>
            <p>• Fluid detection: ${Math.random() > 0.5 ? 'Present' : 'None detected'}</p>
            <p>• Layer integrity: ${Math.random() > 0.3 ? 'Intact' : 'Disrupted'}</p>
            <p>• Abnormality score: ${(Math.random() * 100).toFixed(1)}%</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('imageModal').classList.add('hidden');
});

// Download report functionality
document.getElementById('downloadReport').addEventListener('click', () => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `OCT_Report_${document.getElementById('patientId').value}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Show download notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = 'Report download started...';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
});

// Initialize
updateAnalyzeButton();