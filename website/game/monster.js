/**
 * Monster Management System
 * 
 * This module handles the creation and editing of monsters in the D&D game.
 * 
 * Features:
 * - Dynamic form validation and state management
 * - Form population and data collection
 * - Comprehensive event handling
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

// Note: This script is only used for individual monster editing
// The monsters list is handled by monsters.js

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
}


async function handleMonsterFormSubmission(event, apiPath) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {        
        const dmDataId = document.getElementById('dm-id-input')?.value || '';
        if (dmDataId) {
            setButtonState(submitButton, 'Saving...', true);
            const monsterData = collectMonsterFormData();
            const response = await postToApi(apiPath, monsterData, dmDataId);
            console.log(response);
            setButtonState(submitButton, 'Saved!', false, '#4CAF50', 'white');    
        } else {
            alert('Please enter a valid DM ID to save the monster.');
        }                
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

