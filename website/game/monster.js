/**
 * Monster Management System
 * 
 * This module handles the creation and editing of monsters in the D&D game.
 * 
 * DM Mode Restrictions:
 * - When allGameDataJson.is_dm is true, monster editing is disabled by default
 * - Editing is only enabled when the dm-id-input field has a valid value
 * - This prevents unauthorized monster modifications in DM mode
 * - The form automatically detects DM mode and manages editing permissions
 * 
 * Features:
 * - Dynamic form validation and state management
 * - Real-time editing permission updates
 * - Visual feedback for disabled state
 * - Comprehensive event handling for DM ID input changes
 */

// Wait for both DOM and monsterFieldPopulator to be available
function waitForMonsterFieldPopulator(callback) {
    if (window.monsterFieldPopulator && typeof window.monsterFieldPopulator.populateForm === 'function') {
        console.log('monsterFieldPopulator is ready');
        callback();
    } else {
        console.log('Waiting for monsterFieldPopulator to load...');
        setTimeout(() => waitForMonsterFieldPopulator(callback), 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    waitForMonsterFieldPopulator(() => {
        loadApiController('game/monsters', 'middle', 'Game Monsters', initializeMonsterForm);
    });
});

function initializeMonsterForm(containerId, monsterData, title, apiPath) {
    const container = document.getElementById(containerId);
    
    console.log('Initializing monster form with data:', monsterData);
    console.log('Monster data structure:', JSON.stringify(monsterData, null, 2));
    console.log('Container ID:', containerId);
    console.log('Container element:', container);
    
    if (!container) {
        console.error('Container element not found:', containerId);
        return;
    }
    
    // Extract the actual monster data from the API response structure
    const actualMonsterData = monsterData?.data || monsterData || {};
    console.log('Extracted monster data:', actualMonsterData);
    console.log('Actual monster data keys:', Object.keys(actualMonsterData));
    
    // Build the monster form HTML
    const formHtml = buildMonsterForm(actualMonsterData, title);
    console.log('Built form HTML length:', formHtml.length);
    
    container.innerHTML = formHtml;
    
    // Populate form fields with existing data
    if (actualMonsterData && Object.keys(actualMonsterData).length > 0) {
        console.log('Populating form with existing data:', actualMonsterData);
        console.log('window.monsterFieldPopulator:', window.monsterFieldPopulator);
        console.log('typeof window.monsterFieldPopulator:', typeof window.monsterFieldPopulator);
        
        try {
            if (window.monsterFieldPopulator && typeof window.monsterFieldPopulator.populateForm === 'function') {
                console.log('Calling populateForm...');
                window.monsterFieldPopulator.populateForm(actualMonsterData);
                console.log('Form populated successfully');
            } else {
                console.error('monsterFieldPopulator not available or populateForm method not found');
                console.log('Available window properties:', Object.keys(window).filter(key => key.includes('monster')));
                console.log('All window properties containing "monster":', Object.keys(window).filter(key => key.toLowerCase().includes('monster')));
                
                // Try to wait a bit and retry
                console.log('Waiting 500ms and retrying...');
                setTimeout(() => {
                    if (window.monsterFieldPopulator && typeof window.monsterFieldPopulator.populateForm === 'function') {
                        console.log('Retry: Calling populateForm...');
                        window.monsterFieldPopulator.populateForm(actualMonsterData);
                        console.log('Form populated successfully on retry');
                    } else {
                        console.error('monsterFieldPopulator still not available after retry');
                        // Fallback: try to populate form manually
                        console.log('Attempting manual form population...');
                        populateFormManually(actualMonsterData);
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Error populating form:', error);
            console.error('Error stack:', error.stack);
        }
    } else {
        console.log('No existing data to populate');
    }
    
    // Check if editing should be disabled (DM mode without valid DM ID)
    checkAndDisableMonsterEditing();
    
    // Attach form event listeners
    attachMonsterFormEventListeners(apiPath);
}

// Fallback function to manually populate form fields
function populateFormManually(monsterData) {
    console.log('Manually populating form with data:', monsterData);
    
    const form = document.querySelector('form');
    if (!form) {
        console.error('No form found for manual population');
        return;
    }
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        const fieldName = input.name;
        if (fieldName && monsterData[fieldName] !== undefined) {
            const value = monsterData[fieldName];
            if (input.type === 'checkbox') {
                input.checked = Boolean(value);
            } else if (input.tagName === 'TEXTAREA') {
                input.value = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
            } else {
                input.value = value;
            }
            console.log(`Set ${fieldName} to:`, value);
        }
    });
    
    console.log('Manual form population completed');
}

function buildMonsterForm(monsterData, title) {
    // Check if monsterFieldPopulator is available
    if (!window.monsterFieldPopulator) {
        console.error('monsterFieldPopulator not available');
        return `
            <div id="monster-container">
                <h2 id="monster-title">${title}</h2>
                <div class="form-actions" style="margin-bottom: 20px;">
                    <button type="button" id="back-to-monsters-btn" onclick="loadMonstersList()">← Back to Monsters</button>
                </div>
                <div class="error-message">
                    <p>Error: Monster field populator not loaded. Please refresh the page.</p>
                </div>
            </div>
        `;
    }
    
    // Use the monster field populator to build the form
    const fieldConfig = window.monsterFieldPopulator.getMonsterFormConfig();
    const formHtml = window.monsterFieldPopulator.buildForm(fieldConfig, monsterData);
    
    return `
        <div id="monster-container">
            <h2 id="monster-title">${title}</h2>
            <div class="form-actions" style="margin-bottom: 20px;">
                <button type="button" id="back-to-monsters-btn" onclick="loadMonstersList()">← Back to Monsters</button>
            </div>
            <form id="monster-form">
                ${formHtml}
                <div class="form-actions">
                    <button type="submit">Save Monster</button>
                </div>
            </form>
        </div>
    `;
}

function attachMonsterFormEventListeners(apiPath) {
    const form = document.getElementById('monster-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            handleMonsterFormSubmission(event, apiPath);
        });
    }
    
    // Add event listener to DM ID input to dynamically enable/disable editing
    setupDmIdInputListener();
    
    // Set up periodic checking in case game data loads after form
    setupPeriodicEditingCheck();
}

function setupDmIdInputListener() {
    // Try to find existing DM ID input
    let dmIdInput = document.getElementById('dm-id-input');
    
    if (dmIdInput) {
        // Listen for input changes
        dmIdInput.addEventListener('input', () => {
            checkAndDisableMonsterEditing();
        });
        
        // Also listen for paste and change events
        dmIdInput.addEventListener('paste', () => {
            setTimeout(() => checkAndDisableMonsterEditing(), 10);
        });
        
        dmIdInput.addEventListener('change', () => {
            checkAndDisableMonsterEditing();
        });
        
        // Listen for when the input is cleared
        dmIdInput.addEventListener('keyup', (event) => {
            if (event.key === 'Backspace' || event.key === 'Delete') {
                checkAndDisableMonsterEditing();
            }
        });
        
        // Listen for when the input is cleared via other means (right-click clear, etc.)
        dmIdInput.addEventListener('cut', () => {
            setTimeout(() => checkAndDisableMonsterEditing(), 10);
        });
        
        // Listen for when the input loses focus to catch any remaining changes
        dmIdInput.addEventListener('blur', () => {
            checkAndDisableMonsterEditing();
        });
    } else {
        // If DM ID input doesn't exist yet, set up a mutation observer to watch for it
        setupDmIdInputObserver();
    }
}

function setupDmIdInputObserver() {
    // Watch for when the DM ID input is added to the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const dmIdInput = node.querySelector('#dm-id-input') || 
                                     (node.id === 'dm-id-input' ? node : null);
                    if (dmIdInput) {
                        // Set up all the same event listeners
                        dmIdInput.addEventListener('input', () => {
                            checkAndDisableMonsterEditing();
                        });
                        dmIdInput.addEventListener('paste', () => {
                            setTimeout(() => checkAndDisableMonsterEditing(), 10);
                        });
                        dmIdInput.addEventListener('change', () => {
                            checkAndDisableMonsterEditing();
                        });
                        dmIdInput.addEventListener('keyup', (event) => {
                            if (event.key === 'Backspace' || event.key === 'Delete') {
                                checkAndDisableMonsterEditing();
                            }
                        });
                        dmIdInput.addEventListener('cut', () => {
                            setTimeout(() => checkAndDisableMonsterEditing(), 10);
                        });
                        dmIdInput.addEventListener('blur', () => {
                            checkAndDisableMonsterEditing();
                        });
                        
                        observer.disconnect(); // Stop observing once we find it
                    }
                }
            });
        });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function setupPeriodicEditingCheck() {
    // Check editing state every 500ms for the first 5 seconds to handle delayed loading
    let checkCount = 0;
    const maxChecks = 10;
    const checkInterval = setInterval(() => {
        checkAndDisableMonsterEditing();
        checkCount++;
        if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
        }
    }, 500);
    
    // Also set up a longer-term check for dynamic changes
    setInterval(() => {
        // Only check if we're not already in the middle of a check
        if (!document.querySelector('.editing-disabled-note')) {
            checkAndDisableMonsterEditing();
        }
    }, 2000);
    
    // Handle page visibility changes (user switching tabs, etc.)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Page became visible again, refresh editing state
            setTimeout(() => checkAndDisableMonsterEditing(), 100);
        }
    });
    
    // Handle window focus changes
    window.addEventListener('focus', () => {
        setTimeout(() => checkAndDisableMonsterEditing(), 100);
    });
}

// Function to manually trigger editing state check (useful for external calls)
function refreshMonsterEditingState() {
    checkAndDisableMonsterEditing();
}

async function handleMonsterFormSubmission(event, apiPath) {
    event.preventDefault();
    
    // Check if editing is currently disabled
    if (document.getElementById('monster-form')?.classList.contains('disabled')) {
        alert('Editing is currently disabled. Please enter a valid DM ID to enable monster editing.');
        return;
    }
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
        setButtonState(submitButton, 'Saving...', true);
        
        const dmDataId = document.getElementById('dm-id-input')?.value || '';
        const monsterData = collectMonsterFormData();
        const response = await postToApi(apiPath, monsterData, dmDataId);
        
        console.log(response);
        setButtonState(submitButton, 'Saved!', false, '#4CAF50', 'white');
        
    } catch (error) {
        console.error('Save failed:', error);
        setButtonState(submitButton, 'Save Failed', false, '#f44336', 'white');
    }
    
    setTimeout(() => {
        resetButtonState(submitButton, originalText);
    }, 1000);
}

function collectMonsterFormData() {
    return window.monsterFieldPopulator.collectFormData();
}

function setButtonState(button, text, disabled, backgroundColor = '', color = '') {
    button.textContent = text;
    button.disabled = disabled;
    if (backgroundColor) button.style.backgroundColor = backgroundColor;
    if (color) button.style.color = color;
}

function resetButtonState(button, originalText) {
    button.textContent = originalText;
    button.disabled = false;
    button.style.backgroundColor = '';
    button.style.color = '';
}

function checkAndDisableMonsterEditing() {
    try {
        // Check if we're in DM mode and if the DM ID input has a value
        const dmIdInput = document.getElementById('dm-id-input');
        
        // Try to get DM status from global game data, fallback to checking if DM ID form exists
        let isDmMode = false;
        if (window.allGameDataJson && window.allGameDataJson.is_dm === true) {
            isDmMode = true;
            console.log('DM mode detected from game data');
        } else if (dmIdInput && dmIdInput.parentElement && dmIdInput.parentElement.id === 'dm-id-form') {
            // If DM ID form exists, we're likely in DM mode
            isDmMode = true;
            console.log('DM mode detected from DM ID form presence');
        }
        
        const hasValidDmId = dmIdInput && dmIdInput.value && dmIdInput.value.trim() !== '';
        
        console.log('DM Mode:', isDmMode, 'Valid DM ID:', hasValidDmId);
        
        // If in DM mode and no valid DM ID, disable all form inputs
        if (isDmMode && !hasValidDmId) {
            console.log('Disabling monster form editing - DM mode without valid DM ID');
            disableAllFormInputs();
        } else {
            console.log('Enabling monster form editing');
            enableAllFormInputs();
        }
    } catch (error) {
        console.error('Error checking monster editing state:', error);
        // Fallback: enable editing if there's an error
        enableAllFormInputs();
    }
}

function disableAllFormInputs() {
    const form = document.getElementById('monster-form');
    if (!form) return;
    
    // Add disabled class for CSS styling
    form.classList.add('disabled');
    
    // Disable all input elements
    const inputs = form.querySelectorAll('input, textarea, select, button[type="submit"]');
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    // Add visual indication that editing is disabled
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'DM Mode - Enter DM ID to Edit';
        submitButton.style.backgroundColor = '#6c757d';
        submitButton.style.color = 'white';
    }
    
    // Add a note about why editing is disabled
    addEditingDisabledNote();
}

function enableAllFormInputs() {
    const form = document.getElementById('monster-form');
    if (!form) return;
    
    // Remove disabled class for CSS styling
    form.classList.remove('disabled');
    
    // Enable all input elements
    const inputs = form.querySelectorAll('input, textarea, select, button[type="submit"]');
    inputs.forEach(input => {
        input.disabled = false;
    });
    
    // Reset submit button
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Save Monster';
        submitButton.style.backgroundColor = '';
        submitButton.style.color = '';
    }
    
    // Remove editing disabled note
    removeEditingDisabledNote();
}

function addEditingDisabledNote() {
    const form = document.getElementById('monster-form');
    if (!form) return;
    
    // Check if note already exists
    if (form.querySelector('.editing-disabled-note')) return;
    
    const note = document.createElement('div');
    note.className = 'editing-disabled-note';
    note.style.cssText = 'background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 10px; margin: 10px 0; border-radius: 4px; text-align: center;';
    note.innerHTML = '<strong>Editing Disabled:</strong> You are in DM mode. Enter a DM ID above to enable monster editing.';
    
    // Insert note at the top of the form
    form.insertBefore(note, form.firstChild);
    
    // Also update the form title to indicate disabled state
    const title = document.getElementById('monster-title');
    if (title) {
        title.style.color = '#6c757d';
        title.innerHTML = title.innerHTML + ' <span style="font-size: 0.8em; font-weight: normal;">(DM Mode - Editing Disabled)</span>';
    }
}

function removeEditingDisabledNote() {
    const note = document.querySelector('.editing-disabled-note');
    if (note) {
        note.remove();
    }
    
    // Reset the form title
    const title = document.getElementById('monster-title');
    if (title) {
        title.style.color = '';
        title.innerHTML = title.innerHTML.replace(/ <span style="font-size: 0.8em; font-weight: normal;">\(DM Mode - Editing Disabled\)<\/span>/, '');
    }
}
