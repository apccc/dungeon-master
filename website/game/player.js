/**
 * Player Character Management System
 * 
 * This module handles the creation and editing of player characters in the D&D game.
 * 
 * DM Mode Restrictions:
 * - When allGameDataJson.is_dm is true, player editing is disabled by default
 * - Editing is only enabled when the dm-id-input field has a valid value
 * - This prevents unauthorized character modifications in DM mode
 * - The form automatically detects DM mode and manages editing permissions
 * 
 * Features:
 * - Dynamic form validation and state management
 * - Real-time editing permission updates
 * - Visual feedback for disabled state
 * - Comprehensive event handling for DM ID input changes
 */

document.addEventListener('DOMContentLoaded', () => loadApiController('game/player', 'middle', 'Game Player', initializePlayerForm));

function initializePlayerForm(containerId, playerData, title, apiPath) {
    const container = document.getElementById(containerId);
    
    console.log('Initializing player form with data:', playerData);
    console.log('Player data structure:', JSON.stringify(playerData, null, 2));
    
    // Build the player form HTML
    const formHtml = buildPlayerForm(playerData?.data || {}, title);
    container.innerHTML = formHtml;
    
    // Populate form fields with existing data
    if (playerData?.data) {
        console.log('Populating form with existing data:', playerData.data);
        window.fieldPopulator.populateForm(playerData.data);
    } else {
        console.log('No existing data to populate');
    }
    
    // Check if editing should be disabled (DM mode without valid DM ID)
    checkAndDisablePlayerEditing();
    
    // Attach form event listeners
    attachPlayerFormEventListeners(apiPath);
    
    // Initialize dynamic tables using field populator
    console.log('Initializing dynamic tables...');
    window.fieldPopulator.initializeTables(playerData?.data || {});
    window.fieldPopulator.initializeSpellSlots(playerData?.data || {});
    window.fieldPopulator.initializeAttunements(playerData?.data || {});
    console.log('Dynamic tables initialized');
}

function buildPlayerForm(playerData, title) {
    // Use the field populator to build the form
    const fieldConfig = window.fieldPopulator.getPlayerFormConfig();
    const formHtml = window.fieldPopulator.buildForm(fieldConfig, playerData);
    
    return `
        <div id="player-container">
            <h2 id="player-title">${title}</h2>
            <form id="player-form">
                ${formHtml}
                <div class="form-actions">
                    <button type="submit">Save Character</button>
                </div>
            </form>
        </div>
    `;
}

function attachPlayerFormEventListeners(apiPath) {
    const form = document.getElementById('player-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            handlePlayerFormSubmission(event, apiPath);
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
            checkAndDisablePlayerEditing();
        });
        
        // Also listen for paste and change events
        dmIdInput.addEventListener('paste', () => {
            setTimeout(() => checkAndDisablePlayerEditing(), 10);
        });
        
        dmIdInput.addEventListener('change', () => {
            checkAndDisablePlayerEditing();
        });
        
        // Listen for when the input is cleared
        dmIdInput.addEventListener('keyup', (event) => {
            if (event.key === 'Backspace' || event.key === 'Delete') {
                checkAndDisablePlayerEditing();
            }
        });
        
        // Listen for when the input is cleared via other means (right-click clear, etc.)
        dmIdInput.addEventListener('cut', () => {
            setTimeout(() => checkAndDisablePlayerEditing(), 10);
        });
        
        // Listen for when the input loses focus to catch any remaining changes
        dmIdInput.addEventListener('blur', () => {
            checkAndDisablePlayerEditing();
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
                            checkAndDisablePlayerEditing();
                        });
                        dmIdInput.addEventListener('paste', () => {
                            setTimeout(() => checkAndDisablePlayerEditing(), 10);
                        });
                        dmIdInput.addEventListener('change', () => {
                            checkAndDisablePlayerEditing();
                        });
                        dmIdInput.addEventListener('keyup', (event) => {
                            if (event.key === 'Backspace' || event.key === 'Delete') {
                                checkAndDisablePlayerEditing();
                            }
                        });
                        dmIdInput.addEventListener('cut', () => {
                            setTimeout(() => checkAndDisablePlayerEditing(), 10);
                        });
                        dmIdInput.addEventListener('blur', () => {
                            checkAndDisablePlayerEditing();
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
        checkAndDisablePlayerEditing();
        checkCount++;
        if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
        }
    }, 500);
    
    // Also set up a longer-term check for dynamic changes
    setInterval(() => {
        // Only check if we're not already in the middle of a check
        if (!document.querySelector('.editing-disabled-note')) {
            checkAndDisablePlayerEditing();
        }
    }, 2000);
    
    // Handle page visibility changes (user switching tabs, etc.)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Page became visible again, refresh editing state
            setTimeout(() => checkAndDisablePlayerEditing(), 100);
        }
    });
    
    // Handle window focus changes
    window.addEventListener('focus', () => {
        setTimeout(() => checkAndDisablePlayerEditing(), 100);
    });
}

// Function to manually trigger editing state check (useful for external calls)
function refreshPlayerEditingState() {
    checkAndDisablePlayerEditing();
}

async function handlePlayerFormSubmission(event, apiPath) {
    event.preventDefault();
    
    // Check if editing is currently disabled
    if (document.getElementById('player-form')?.classList.contains('disabled')) {
        alert('Editing is currently disabled. Please enter a valid DM ID to enable character editing.');
        return;
    }
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
        setButtonState(submitButton, 'Saving...', true);
        
        const dmDataId = document.getElementById('dm-id-input')?.value || '';
        const playerData = collectPlayerFormData();
        const response = await postToApi(apiPath, playerData, dmDataId);
        
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

function collectPlayerFormData() {
    return window.fieldPopulator.collectFormData();
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

function checkAndDisablePlayerEditing() {
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
            console.log('Disabling player form editing - DM mode without valid DM ID');
            disableAllFormInputs();
        } else {
            console.log('Enabling player form editing');
            enableAllFormInputs();
        }
    } catch (error) {
        console.error('Error checking player editing state:', error);
        // Fallback: enable editing if there's an error
        enableAllFormInputs();
    }
}

function disableAllFormInputs() {
    const form = document.getElementById('player-form');
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
    const form = document.getElementById('player-form');
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
        submitButton.textContent = 'Save Character';
        submitButton.style.backgroundColor = '';
        submitButton.style.color = '';
    }
    
    // Remove editing disabled note
    removeEditingDisabledNote();
}

function addEditingDisabledNote() {
    const form = document.getElementById('player-form');
    if (!form) return;
    
    // Check if note already exists
    if (form.querySelector('.editing-disabled-note')) return;
    
    const note = document.createElement('div');
    note.className = 'editing-disabled-note';
    note.style.cssText = 'background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 10px; margin: 10px 0; border-radius: 4px; text-align: center;';
    note.innerHTML = '<strong>Editing Disabled:</strong> You are in DM mode. Enter a DM ID above to enable character editing.';
    
    // Insert note at the top of the form
    form.insertBefore(note, form.firstChild);
    
    // Also update the form title to indicate disabled state
    const title = document.getElementById('player-title');
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
    const title = document.getElementById('player-title');
    if (title) {
        title.style.color = '';
        title.innerHTML = title.innerHTML.replace(/ <span style="font-size: 0.8em; font-weight: normal;">\(DM Mode - Editing Disabled\)<\/span>/, '');
    }
}
