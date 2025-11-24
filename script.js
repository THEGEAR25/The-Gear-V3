// --- Here ibutang ang Google app script ---
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx2cf39XLv-kCMtt8YfKHXZ9CBpiI7AKMdXFeNkI7lEfYImWzWdTF5QiAWZelexD_5s/exec'; 

const programs = [
   // Graduate School
    "Doctor of Philosophy Major in Technology Education Management",
    "Master of Arts in Language and Literacy Education",
    "Master of Arts in Education",
    "Master in Technician Education",
    // COLLEGE OF ENGINEERING
    "Bachelor of Science in Mechanical Engineering",
    "Bachelor of Science in Electrical Engineering",
    "Bachelor of Science in Industrial Engineering",
    // COLLEGE OF EDUCATION ARTS AND SCIENCES
    "Bachelor of Secondary Education Major in English, SECTION A",
    "Bachelor of Secondary Education Major in English, SECTION B",
    "Bachelor of Secondary Education Major in Mathematics",
    "Bachelor of Secondary Education Major in Social Studies",
    "Bachelor of Secondary Education Major in Filipino",
    "Bachelor of Technical-Vocational Teacher Education Major in Automotive Technology",
    "Bachelor of Technical-Vocational Teacher Education Major in Electronics Technology",
    "Bachelor of Technical-Vocational Teacher Education Major in Food and Service Management",
    "Bachelor of Technical-Vocational Teacher Education Major in Garments, Fashion and Design",
    // COLLEGE OF TECHNOLOGY
    "Bachelor in Food Processing and Service Technology",
    "Bachelor of Industrial Technology (BIT, SECTION A)",
    "Bachelor of Industrial Technology (BIT, SECTION B)",
    "Bachelor of Industrial Technology (BIT, SECTION C)",
    "Diploma in Automotive Technology",
    "Diploma in Civil Technology",
    "Diploma in Electrical Technology",
    "Diploma in Electronics Technology",
    "Diploma in Heating, Ventilating & Air-conditioning Technology",
    "Diploma in Mechanical Technology",
    "Diploma in Welding and Fabrication Technology",
    "Bachelor of Technology Major in Mechanical Technology",
    "Bachelor of Technology Major in Electrical Technology",
    "Bachelor of Technology Major in Electronics Technology",
    "Bachelor of Technology Major in Civil Technology",
    "Bachelor of Technology Major in Heating, Ventilating & Air-conditioning Technology",
    "Bachelor of Technology Major in Welding & Fabrication Technology"
];

const programLogos = {
    'Graduate School': 'Logos/grad.webp',
    'College of Engineering': 'Logos/eng.Webp',
    'College of Education, Arts, and Sciences': 'Logos/edu.webp',
    'College of Technology': 'Logos/tech.webp'
};

// Elements
const form = document.getElementById('yearbook-form');
const programSelect = document.getElementById('program');
const programLogo = document.getElementById('program-logo');
const monthSelect = document.getElementById('b_month');
const daySelect = document.getElementById('b_day');
const yearSelect = document.getElementById('b_year');
const privacyModal = document.getElementById('privacy-modal');
const modalAcceptBtn = document.getElementById('modal-accept-btn');
const loader = document.getElementById('loader');
const successContainer = document.getElementById('success-container');
const reviewContainer = document.getElementById('review-container');
const reviewContent = document.getElementById('review-content');
const formContainer = document.getElementById('form-container');

// Character Counter Logic
const principleInput = document.getElementById('guidingPrinciple');
const currentCount = document.getElementById('current-count');

principleInput.addEventListener('input', (e) => {
    const len = e.target.value.length;
    currentCount.textContent = len;
    currentCount.style.color = len >= 190 ? "#d32f2f" : "#888";
});

// --- NEW: Disable Right Click for Security ---
document.addEventListener('contextmenu', event => event.preventDefault());

// --- UPDATE: Auto-Capitalize AND Whitespace Trimmer ---
const textInputs = document.querySelectorAll('input[type="text"], textarea');

textInputs.forEach(input => {
    input.addEventListener('blur', (e) => {
        // 1. Trim Whitespace
        let val = e.target.value.trim(); 
        
        // 2. Apply Smart Capitalization (if it's a name field)
        const id = e.target.id;
        if (['fullName', 'fathersName', 'mothersName', 'spousesName'].includes(id)) {
            val = smartCapitalize(val);
        }
        
        // Update value
        e.target.value = val;
    });
});

// Core Functions
function getCollegeCategory(programName) {
    if (!programName) return 'Default';
    if (programName.includes("Doctor") || programName.includes("Master")) return "Graduate School";
    if (programName.includes("Engineering")) return "College of Engineering";
    if (programName.includes("Education") || programName.includes("Arts") ||
        programName.includes("Philosophy") || programName.includes("Language") ||
        programName.includes("Secondary Education") || programName.includes("Teacher Education")) return "College of Education, Arts, and Sciences";
    return "College of Technology";
}

function smartCapitalize(text) {
    if (!text) return "";
    let formatted = text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    formatted = formatted.replace(/\bMc(\w)/g, (match, p1) => "Mc" + p1.toUpperCase());
    formatted = formatted.replace(/\bMac(\w)/g, (match, p1) => "Mac" + p1.toUpperCase());
    const romans = ["Ii", "Iii", "Iv", "Vi", "Vii", "Viii"];
    romans.forEach(roman => { formatted = formatted.replace(new RegExp(`\\b${roman}\\b`, 'g'), roman.toUpperCase()); });
    const particles = ["De", "La", "Del", "Dos", "Van", "Von", "Dela"];
    particles.forEach(part => { formatted = formatted.replace(new RegExp(`\\s${part}\\s`, 'g'), ` ${part.toLowerCase()} `); });
    return formatted;
}

function updateCollegeLogo() {
    const category = getCollegeCategory(programSelect.value);
    const logoPath = programLogos[category];
    if (logoPath) {
        programLogo.src = logoPath;
        programLogo.style.visibility = 'visible';
    } else {
        programLogo.src = "";
        programLogo.style.visibility = 'hidden';
    }
}

function populatePrograms() {
    programs.forEach(p => {
        const option = new Option(p, p);
        programSelect.add(option);
    });
}

function populateBirthday() {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    months.forEach((month, index) => {
        const option = new Option(month, index + 1);
        monthSelect.add(option);
    });
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 15; y >= currentYear - 45; y--) {
        const option = new Option(y, y);
        yearSelect.add(option);
    }
}

function updateDays() {
    const month = monthSelect.value;
    const year = yearSelect.value || new Date().getFullYear();
    let daysInMonth = 31;
    if (month && year) daysInMonth = new Date(year, month, 0).getDate();
    const selectedDay = daySelect.value;
    daySelect.innerHTML = '<option value="">Day</option>';
    for (let d = 1; d <= daysInMonth; d++) {
        const option = new Option(d, d);
        daySelect.add(option);
    }
    if (selectedDay <= daysInMonth) daySelect.value = selectedDay;
}

// Review Panel Logic
function showReviewPanel() {
    const data = new FormData(form);
    reviewContent.innerHTML = '';
    
    const m = monthSelect.options[monthSelect.selectedIndex].text;
    const d = data.get('b_day');
    const y = data.get('b_year');
    const bday = (m !== "Month" && d && y) ? `${m} ${d}, ${y}` : "";
    
    formData = Object.fromEntries(data.entries());
    formData['birthday'] = bday; 

    const displayOrder = [
        {k:'fullName', l:'Full Name'}, {k:'program', l:'Program'}, {k:'birthday', l:'Birthday'},
        {k:'address', l:'Address'}, {k:'fathersName', l:'Father'}, {k:'mothersName', l:'Mother'},
        {k:'spousesName', l:'Spouse'}, {k:'thesis', l:'Thesis'},
        {k:'ojt1', l:'OJT 1'}, {k:'ojt2', l:'OJT 2'},
        {k:'org1', l:'Org 1'}, {k:'org2', l:'Org 2'}, {k:'org3', l:'Org 3'}, {k:'org4', l:'Org 4'}, {k:'org5', l:'Org 5'},
        {k:'award1', l:'Award 1'}, {k:'award2', l:'Award 2'}, {k:'award3', l:'Award 3'}, {k:'award4', l:'Award 4'}, {k:'award5', l:'Award 5'},
        {k:'guidingPrinciple', l:'Quote'}
    ];

    displayOrder.forEach(field => {
        const item = document.createElement('div');
        item.className = 'review-item';
        if(field.k === 'guidingPrinciple') item.className += ' full-width';
        const val = formData[field.k] || ""; 
        item.innerHTML = `<strong>${field.l}:</strong> <span>${val}</span>`;
        reviewContent.appendChild(item);
    });

    formContainer.style.display = 'none'; 
    reviewContainer.style.display = 'grid'; 
    window.scrollTo(0, 0);
}

// Submit Logic
async function confirmAndSubmit() {
    loader.style.display = 'block';
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();

        if (result.status === 'success') {
            reviewContainer.style.display = 'none';
            successContainer.style.display = 'block'; 
            form.reset();
            updateCollegeLogo();
            updateDays();
            currentCount.textContent = "0";
            window.scrollTo(0, 0);
        } else if (result.status === 'duplicate') {
            alert('Duplicate: This name is already registered.');
            reviewContainer.style.display = 'none';
            formContainer.style.display = 'block';
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        loader.style.display = 'none';
    }
}

// Listeners
document.addEventListener('DOMContentLoaded', () => {
    populatePrograms();
    populateBirthday();
});

form.addEventListener('submit', (e) => { e.preventDefault(); showReviewPanel(); });
programSelect.addEventListener('change', updateCollegeLogo);
monthSelect.addEventListener('change', updateDays);
yearSelect.addEventListener('change', updateDays);

document.getElementById('btn-edit').addEventListener('click', () => {
    reviewContainer.style.display = 'none';
    formContainer.style.display = 'block';
});
document.getElementById('btn-confirm').addEventListener('click', confirmAndSubmit);
document.getElementById('btn-new-form').addEventListener('click', () => {
    successContainer.style.display = 'none';
    formContainer.style.display = 'block';
});
modalAcceptBtn.addEventListener('click', () => {
    privacyModal.style.display = 'none';
});