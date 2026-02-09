// SURGE 2025 Registration System - FIXED VERSION
const SUPABASE_URL = 'https://mhgnznjqgxbfrlkrkinj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZ256bmpxZ3hiZnJsa3JraW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzE3OTEsImV4cCI6MjA4NTM0Nzc5MX0.AgV5rQ6CNyxLGKrn3rHiIaumO4H5K_TO25Zn-WB6T_M';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Event configurations with table names
// Add registrationCap (number) to any event to limit registrations; when reached, event shows "Registration Full"
const eventConfigs = {
    'runtime-curse': {
        name: 'The Runtime Curse',
        teamSize: 4,
        minTeamSize: 2,
        teamSizeDisplay: '2-4',
        requiresTeam: true,
        tableName: 'runtime_curse_registrations',
        description: 'Technical Quiz - Team of 2-4',
        theme: 'curse',
        bgColor: '#1a0d2e',
        accentColor: '#e74c3c',
        emoji: '🕸️',
        registrationCap: 30
    },
    'save-child': {
        name: 'Save the Child',
        teamSize: 2,
        requiresTeam: true,
        tableName: 'save_child_registrations',
        description: 'Puzzle Challenge - Team of 2',
        theme: 'horror',
        bgColor: '#2c1810',
        accentColor: '#e67e22',
        emoji: '🎭',
        registrationCap: 30
    },
    'derry-deception': {
        name: 'The Derry Deception',
        teamSize: 1,
        requiresTeam: false,
        tableName: 'derry_deception_registrations',
        description: 'Social Deduction - Individual Event',
        theme: 'deception',
        bgColor: '#0f1419',
        accentColor: '#9b59b6',
        emoji: '👹',
        registrationCap: 50
    },
    'ctf-cyber': {
        name: 'CTF Cybersecurity',
        teamSize: 3,
        minTeamSize: 2,
        teamSizeDisplay: '2-3',
        requiresTeam: true,
        tableName: 'ctf_cybersecurity_registrations',
        description: 'Capture The Flag - Team of 2-3',
        theme: 'cyber',
        bgColor: '#0d1421',
        accentColor: '#3498db',
        emoji: '🔒',
        registrationCap: 30
    },
    'cybercrime-seminar': {
        name: 'Cybercrime Seminar',
        teamSize: 1,
        requiresTeam: false,
        tableName: 'cybercrime_seminar_registrations',
        description: 'Educational Seminar - Individual',
        theme: 'seminar',
        bgColor: '#1a1a1a',
        accentColor: '#34495e',
        emoji: '👤',
        registrationCap: 100
    }
};

let selectedEventId = null;
let currentMemberCount = 0;
// Events that have reached registration cap (set by fetchRegistrationCounts)
const eventsFull = new Set();

// DOM Elements
const eventCards = document.querySelectorAll('.event-card');
const eventSelection = document.querySelector('.event-selection');
const registrationForm = document.querySelector('.registration-form');
const selectedEventNameSpan = document.getElementById('selected-event-name');
const teamSection = document.getElementById('team-section');
const membersSection = document.getElementById('members-section');
const teamMembersContainer = document.getElementById('team-members-container');
const leaderHeading = document.getElementById('leader-heading');
const form = document.getElementById('registrationForm');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    addSmoothScrolling();
    addFormValidation();
    initializeTooltips();
    updateEventCardDisplays();
    fetchRegistrationCounts();

    // Test Supabase connection
    testSupabaseConnection();
});

// Test Supabase connection
async function testSupabaseConnection() {
    try {
        // Test connection by checking if we can access the Supabase instance
        // Try to query a simple table (one of the event tables) to verify connection
        const testTable = 'runtime_curse_registrations';
        const { data, error } = await supabaseClient.from(testTable).select('registration_id').limit(1);
        
        if (error && error.code === 'PGRST205') {
            console.warn('⚠️ Supabase connected, but tables need to be created. Please run the SQL scripts in Supabase.');
            console.log('📋 See supabase-setup.sql for table creation scripts');
        } else if (error) {
            console.warn('⚠️ Supabase connection test failed:', error.message);
        } else {
            console.log('✅ Supabase connection successful');
        }
    } catch (err) {
        console.warn('⚠️ Supabase connection test failed:', err.message);
    }
}

// Update event card displays with correct team sizes
function updateEventCardDisplays() {
    eventCards.forEach(card => {
        const eventId = card.getAttribute('data-event');
        if (eventId && eventConfigs[eventId]) {
            const config = eventConfigs[eventId];
            const detailsElement = card.querySelector('.event-details');
            if (detailsElement) {
                const teamInfo = detailsElement.querySelector('.event-team');
                if (teamInfo) {
                    if (config.requiresTeam) {
                        const teamLabel = config.teamSizeDisplay || config.teamSize;
                        teamInfo.innerHTML = `<i class="fas fa-users"></i> Team of ${teamLabel}`;
                    } else {
                        teamInfo.innerHTML = `<i class="fas fa-user"></i> Individual`;
                    }
                }
            }
        }
    });
}

// Fetch registration counts and mark events that are full
async function fetchRegistrationCounts() {
    const eventsWithCap = Object.entries(eventConfigs).filter(([, c]) => c.registrationCap != null);
    for (const [eventId, config] of eventsWithCap) {
        try {
            const { count, error } = await supabaseClient
                .from(config.tableName)
                .select('*', { count: 'exact', head: true });
            if (!error && count !== null && count >= config.registrationCap) {
                eventsFull.add(eventId);
            }
        } catch (err) {
            console.warn('Could not fetch count for', eventId, err);
        }
    }
    updateEventCardFullState();
}

// Show "Registration Full" and disable button for events that have reached cap
function updateEventCardFullState() {
    eventCards.forEach(card => {
        const eventId = card.getAttribute('data-event');
        const btn = card.querySelector('.select-event-btn');
        let banner = card.querySelector('.registration-full-banner');
        if (eventsFull.has(eventId)) {
            card.classList.add('event-full');
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Registration Full';
            }
            if (!banner) {
                banner = document.createElement('div');
                banner.className = 'registration-full-banner';
                banner.innerHTML = '<span>Registration is full for this event</span>';
                card.insertBefore(banner, card.firstChild);
            }
            banner.style.display = 'block';
        } else {
            card.classList.remove('event-full');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Select This Event';
            }
            if (banner) banner.style.display = 'none';
        }
    });
}

// Event selection functionality
function selectEvent(eventId) {
    if (eventsFull.has(eventId)) {
        return;
    }
    selectedEventId = eventId;
    const config = eventConfigs[eventId];

    // Update UI
    eventCards.forEach(card => card.classList.remove('selected'));
    const selectedCard = document.querySelector(`[data-event="${eventId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }

    // Apply theme to the page
    applyEventTheme(config);

    // Show registration form
    setTimeout(() => {
        eventSelection.style.display = 'none';
        registrationForm.style.display = 'block';

        // Smooth scroll to registration form
        registrationForm.scrollIntoView({ behavior: 'smooth' });

        // Update form based on selected event
        updateRegistrationForm(config);
    }, 300);
}

// Apply event-specific theme
function applyEventTheme(config) {
    const root = document.documentElement;

    // Set CSS custom properties for theming
    root.style.setProperty('--event-bg-color', config.bgColor);
    root.style.setProperty('--event-accent-color', config.accentColor);

    // Add theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${config.theme}`);
}

// Update registration form based on event type
function updateRegistrationForm(config) {
    selectedEventNameSpan.textContent = config.name;
    selectedEventNameSpan.insertAdjacentHTML('afterbegin', `${config.emoji} `);
    document.getElementById('selectedEvent').value = selectedEventId;

    // Update form container theme
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.className = `form-container theme-${config.theme}`;
    }

    // Handle team vs individual events properly
    const teamNameInput = document.getElementById('teamName');

    if (config.requiresTeam) {
        // Team event - show team sections and make teamName required
        teamSection.style.display = 'block';
        membersSection.style.display = 'block';
        leaderHeading.innerHTML = `<i class="fas fa-crown"></i> Team Leader Information`;

        // Make team name required and visible
        if (teamNameInput) {
            teamNameInput.required = true;
            teamNameInput.disabled = false;
        }

        // Generate team member forms (excluding leader)
        generateTeamMemberForms(config.teamSize);
    } else {
        // Individual event - hide team sections and remove teamName requirement
        teamSection.style.display = 'none';
        membersSection.style.display = 'none';
        leaderHeading.innerHTML = `<i class="fas fa-user"></i> Personal Information`;

        // Remove required attribute and disable field for individual events
        if (teamNameInput) {
            teamNameInput.required = false;
            teamNameInput.disabled = true;
            teamNameInput.value = ''; // Clear any existing value
        }
    }
}

// Generate team member forms dynamically with correct count
function generateTeamMemberForms(teamSize) {
    if (!teamMembersContainer) return;

    const config = eventConfigs[selectedEventId];
    if (!config) return;

    teamMembersContainer.innerHTML = '';
    currentMemberCount = 0;

    // Create forms for team members (excluding leader, so teamSize - 1)
    const membersNeeded = teamSize - 1;

    for (let i = 0; i < membersNeeded; i++) {
        const memberNumber = i + 2;
        // Third member is optional for CTF (minTeamSize 2 = only member 2 required)
        const isOptional = config.minTeamSize && memberNumber >= config.minTeamSize + 1;
        addMemberForm(memberNumber, isOptional);
    }
}

// Add individual member form (isOptional: true = no required validation, e.g. CTF third member)
function addMemberForm(memberNumber, isOptional) {
    const config = eventConfigs[selectedEventId];
    const maxMembers = config.teamSize - 1; // Excluding leader

    if (currentMemberCount >= maxMembers) return;

    currentMemberCount++;

    const req = isOptional ? '' : ' *';
    const requiredAttr = isOptional ? '' : ' required';

    const memberDiv = document.createElement('div');
    memberDiv.className = `member-form theme-${config.theme}`;
    memberDiv.setAttribute('data-member', memberNumber);
    if (isOptional) memberDiv.setAttribute('data-optional-member', 'true');

    memberDiv.innerHTML = `
        <div class="member-header">
            <h4 class="member-title">${config.emoji} Team Member ${memberNumber}${isOptional ? ' (Optional)' : ''}</h4>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="member${memberNumber}Name">Full Name${req}</label>
                <input type="text" id="member${memberNumber}Name" name="member${memberNumber}Name"${requiredAttr}>
            </div>
            <div class="form-group">
                <label for="member${memberNumber}Email">Email Address${req}</label>
                <input type="email" id="member${memberNumber}Email" name="member${memberNumber}Email"${requiredAttr}>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="member${memberNumber}Phone">Phone Number${req}</label>
                <input type="tel" id="member${memberNumber}Phone" name="member${memberNumber}Phone"${requiredAttr}>
            </div>
            <div class="form-group">
                <label for="member${memberNumber}Year">Year of Study${req}</label>
                <select id="member${memberNumber}Year" name="member${memberNumber}Year"${requiredAttr}>
                    <option value="">Select Year</option>
                    <option value="FE">First Year (FE)</option>
                    <option value="SE">Second Year (SE)</option>
                    <option value="TE">Third Year (TE)</option>
                    <option value="BE">Final Year (BE)</option>
                </select>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="member${memberNumber}Branch">Branch${req}</label>
                <select id="member${memberNumber}Branch" name="member${memberNumber}Branch"${requiredAttr}>
                    <option value="">Select Branch</option>
                    <option value="CMPN">Computer Engineering (CMPN)</option>
                    <option value="INFT">Information Technology (INFT)</option>
                    <option value="EXTC">Electronics & Telecommunication (EXTC)</option>
                    <option value="EXCS">Electronics & Computer Science (EXCS)</option>
                    <option value="BIOM">Biomedical Engineering (BIOM)</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="member${memberNumber}RollNo">Roll Number${req}</label>
                <input type="text" id="member${memberNumber}RollNo" name="member${memberNumber}RollNo"${requiredAttr}>
            </div>
        </div>
    `;

    teamMembersContainer.appendChild(memberDiv);

    // Add animation
    memberDiv.style.opacity = '0';
    memberDiv.style.transform = 'translateY(20px)';
    setTimeout(() => {
        memberDiv.style.transition = 'all 0.3s ease';
        memberDiv.style.opacity = '1';
        memberDiv.style.transform = 'translateY(0)';
    }, 10);
}

// Form submission with Supabase integration
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (selectedEventId && eventsFull.has(selectedEventId)) {
            showErrorMessage('Registration is full for this event.');
            return;
        }
        if (validateForm()) {
            submitRegistrationToSupabase();
        }
    });
}

// FIXED: Validate form - skip hidden/disabled fields and remove terms validation
function validateForm() {
    if (!form) return false;

    // Only validate visible and enabled required fields
    const requiredFields = form.querySelectorAll('input[required]:not([disabled]), select[required]:not([disabled])');
    let isValid = true;
    let firstInvalidField = null;

    requiredFields.forEach(field => {
        // Skip hidden fields or fields in hidden sections
        if (field.offsetParent === null || field.disabled) {
            return; // Skip validation for hidden/disabled fields
        }

        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        } else {
            clearFieldError(field);
        }
    });

    // Validate email formats for visible fields only
    const emailFields = form.querySelectorAll('input[type="email"]:not([disabled])');
    emailFields.forEach(field => {
        if (field.offsetParent === null || field.disabled) return; // Skip hidden/disabled

        if (field.value && !isValidEmail(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        }
    });

    // REMOVED: Terms checkbox validation (doesn't exist in simplified form)

    if (!isValid && firstInvalidField) {
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidField.focus();
    }

    return isValid;
}

// FIXED: Submit registration to Supabase with separate tables (removed emergency contact and updates)
async function submitRegistrationToSupabase() {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
        const config = eventConfigs[selectedEventId];
        const formData = new FormData(form);
        const registrationId = generateRegistrationId();

        let registrationData = {};

        if (config.requiresTeam) {
            // Team event registration
            registrationData = {
                registration_id: registrationId,
                team_name: formData.get('teamName'),
                leader_name: formData.get('leaderName'),
                leader_email: formData.get('leaderEmail'),
                leader_phone: formData.get('leaderPhone'),
                leader_year: formData.get('leaderYear'),
                leader_branch: formData.get('leaderBranch'),
                leader_roll_no: formData.get('leaderRollNo')
                // REMOVED: emergency contact and wants_updates fields
            };

            // Add team members based on team size
            for (let i = 2; i <= config.teamSize; i++) {
                registrationData[`member${i}_name`] = formData.get(`member${i}Name`) || '';
                registrationData[`member${i}_email`] = formData.get(`member${i}Email`) || '';
                registrationData[`member${i}_phone`] = formData.get(`member${i}Phone`) || '';
                registrationData[`member${i}_year`] = formData.get(`member${i}Year`) || '';
                registrationData[`member${i}_branch`] = formData.get(`member${i}Branch`) || '';
                registrationData[`member${i}_roll_no`] = formData.get(`member${i}RollNo`) || '';
            }
        } else {
            // Individual event registration
            registrationData = {
                registration_id: registrationId,
                participant_name: formData.get('leaderName'),
                participant_email: formData.get('leaderEmail'),
                participant_phone: formData.get('leaderPhone'),
                participant_year: formData.get('leaderYear'),
                participant_branch: formData.get('leaderBranch'),
                participant_roll_no: formData.get('leaderRollNo')
                // REMOVED: emergency contact and wants_updates fields
            };
        }

        // Insert into the appropriate table
        const { data, error } = await supabaseClient
            .from(config.tableName)
            .insert([registrationData])
            .select();

        if (error) {
            throw error;
        }

        // Show success modal
        showSuccessModal(registrationId);

        console.log('✅ Registration successful:', data);

    } catch (error) {
        console.error('❌ Registration failed:', error);
        showErrorMessage(error.message);
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Generate registration ID
function generateRegistrationId() {
    const eventPrefix = selectedEventId.toUpperCase().replace('-', '').substring(0, 6);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${eventPrefix}${timestamp}${random}`;
}

// Show success modal
function showSuccessModal(registrationId) {
    const modal = document.getElementById('successModal');
    const eventNameSpan = document.getElementById('modal-event-name');
    const regIdSpan = document.getElementById('modal-reg-id');

    if (modal && eventNameSpan && regIdSpan) {
        eventNameSpan.textContent = eventConfigs[selectedEventId].name;
        regIdSpan.textContent = registrationId;

        modal.classList.add('show');

        // Add animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'scale(0.8)';

            setTimeout(() => {
                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }, 10);
        }
    }
}

// Show error message
function showErrorMessage(errorMessage) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Registration Failed</h3>
            <p>${errorMessage}</p>
            <button onclick="this.parentElement.parentElement.remove()" class="btn-primary">
                Try Again
            </button>
        </div>
    `;

    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        backdrop-filter: blur(5px);
    `;

    const errorContent = errorDiv.querySelector('.error-content');
    errorContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        border: 2px solid #dc3545;
    `;

    document.body.appendChild(errorDiv);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    if (!modal) return;

    const modalContent = modal.querySelector('.modal-content');

    if (modalContent) {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.8)';
    }

    setTimeout(() => {
        modal.classList.remove('show');
        // Reset form and go back to event selection
        if (form) form.reset();
        goBackToEvents();
    }, 300);
}

// Navigation functions
function goBack() {
    if (confirm('Are you sure you want to go back? Any unsaved data will be lost.')) {
        window.location.href = 'index.html';
    }
}

function goBackToEvents() {
    if (registrationForm) registrationForm.style.display = 'none';
    if (eventSelection) eventSelection.style.display = 'block';

    // Reset selections and theme
    eventCards.forEach(card => card.classList.remove('selected'));
    selectedEventId = null;
    document.body.className = document.body.className.replace(/theme-\w+/g, '');

    // Reset CSS custom properties
    const root = document.documentElement;
    root.style.removeProperty('--event-bg-color');
    root.style.removeProperty('--event-accent-color');

    // Smooth scroll to event selection
    if (eventSelection) {
        eventSelection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(field, message) {
    clearFieldError(field);

    field.style.borderColor = '#dc3545';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = '#e0e6ed';
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function addFormValidation() {
    if (!form) return;

    const inputs = form.querySelectorAll('input, select');

    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.disabled && !this.value.trim()) {
                showFieldError(this, 'This field is required');
            } else {
                clearFieldError(this);
            }
        });

        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.dataset.tooltip;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        z-index: 1000;
        pointer-events: none;
    `;

    document.body.appendChild(tooltip);

    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Terms and Privacy functions
function showTerms() {
    alert('Terms and Conditions\n\n1. Participants must be currently enrolled students\n2. Registration is non-transferable\n3. ITSA reserves the right to modify event details\n4. Participants must follow all safety guidelines\n5. Decision of judges is final');
}

function showPrivacy() {
    alert('Privacy Policy\n\n1. We collect personal information for event management\n2. Data is not shared with third parties\n3. Information is stored securely\n4. Participants can request data deletion');
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeModal();
    }
});

console.log('✅ SURGE 2025 Registration System - FIXED VERSION loaded successfully');