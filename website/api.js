const API_URL = 'https://nvnhyksn62wsnujvvcqkvjwyoe0nodnc.lambda-url.us-west-2.on.aws/';

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function getGameId() {
    return getCookie('gameId');
}

function getPlayerId() {
    return getCookie('playerId');
}

async function getFromApi(path, dmDataId) {
    const gameId = getGameId();
    const playerId = getPlayerId();

    if (!gameId || !playerId) {
        document.location.href = '/';
        return;
    }

    const maxRetries = 3;
    const retryDelayMs = 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(`${API_URL}${path}`, {
                headers: {
                    'game_id': gameId,
                    'player_id': playerId,
                    'dm_data_id': dmDataId || ''
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            console.warn(`API request attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                console.error(`All ${maxRetries} attempts failed for path: ${path}`);
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
    }
}

async function postToApi(path, body, dmDataId) {
    const gameId = getGameId();
    const playerId = getPlayerId();

    if (!gameId || !playerId) {
        document.location.href = '/';
    }

    let body_content;
    if (typeof body === 'string') {
        body_content = body;
    } else if (typeof body === 'object') {
        body_content = JSON.stringify(body);
    } else {
        throw new Error('Invalid body type');
    }

    const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
            'game_id': gameId,
            'player_id': playerId,
            'dm_data_id': dmDataId || ''
        },
        body: body_content
    });

    return response.json();
}

function createPropertyField(propertyName, propertyValue) {
    const fieldId = `field-${propertyName.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    let propertyValueString = '';
    if (propertyValue !== null && propertyValue !== undefined) {
        if (typeof propertyValue === 'string') {
            propertyValueString = propertyValue;
        } else {
            propertyValueString = JSON.stringify(propertyValue, null, 2);
        }
    }
    return `
        <div class="property-field" data-property-container="${propertyName}">
            <label for="${fieldId}">${propertyName}</label>
            <textarea id="${fieldId}" class="property-textarea" data-property="${propertyName}" autocorrect="off" autocomplete="off" spellcheck="false"></textarea>
            <button type="button" class="delete-property-btn" data-property="${propertyName}" title="Delete property">×</button>
        </div>
    `;
}

function buildSettingsForm(settingsData, title) {
    const objectEntries = settingsData ? Object.entries(settingsData) : [];
    const propertyFields = objectEntries
        .map(([propertyName, propertyValue]) => createPropertyField(propertyName, propertyValue))
        .join('');

    return {
        html: `
            <div id="settings-container">
                <h2 id="game-body-title">${title}</h2>
                <form id="settings-form">
                    <div class="new-property-control">
                        <label for="new-property-name">New:</label>
                        <input type="text" id="new-property-name" placeholder="New property" />
                        <button type="button" id="add-property-btn">Add</button>
                    </div>
                    <div id="property-fields-container">
                        ${propertyFields}
                    </div>
                    <button type="submit">Save</button>
                </form>
            </div>
        `,
        data: settingsData
    };
}

function collectFormData() {
    const textareas = document.querySelectorAll('.property-textarea');
    const settingsData = {};
    
    textareas.forEach(textarea => {
        const propertyName = textarea.dataset.property;
        try {
            const propertyValue = JSON.parse(textarea.value);
            settingsData[propertyName] = propertyValue;
        } catch (error) {
            settingsData[propertyName] = textarea.value;
        }
    });
    
    return settingsData;
}

let currentApiControllerData = {};
async function loadApiController(apiPath, containerId, title, formFunction = initializeSettingsForm) {
    currentApiControllerData = {
        apiPath: apiPath,
        title: title,
        containerId: containerId,
        formFunction: formFunction
    };
    const dmDataId = document.getElementById('dm-id-input')?.value || '';
    const settings = await getFromApi(apiPath, dmDataId);
    
    formFunction(containerId, settings, title, apiPath);
}

async function reloadApiController() {
    return await loadApiController(
        currentApiControllerData.apiPath,
        currentApiControllerData.containerId,
        currentApiControllerData.title,
        currentApiControllerData.formFunction
    );
}

function addNewProperty() {
    const propertyNameInput = document.getElementById('new-property-name');
    const propertyName = propertyNameInput.value.trim();
    
    if (!propertyName) {
        alert('Please enter a property name');
        return;
    }

    const existingField = document.querySelector(`[data-property="${propertyName}"]`);
    if (existingField) {
        alert('Property already exists');
        return;
    }
    
    const newPropertyField = createPropertyField(propertyName, '');
    const container = document.getElementById('property-fields-container');
    container.insertAdjacentHTML('beforeend', newPropertyField);

    const newDeleteBtn = container.querySelector(`[data-property="${propertyName}"].delete-property-btn`);
    if (newDeleteBtn) {
        newDeleteBtn.addEventListener('click', deleteProperty);
    }

    propertyNameInput.value = '';
}

function deleteProperty(event) {
    const propertyName = event.target.dataset.property;
    if (confirm(`Are you sure you want to delete the property "${propertyName}"?`)) {
        const propertyContainer = document.querySelector(`[data-property-container="${propertyName}"]`);
        if (propertyContainer) {
            propertyContainer.remove();
        }
    }
}

function initializeSettingsForm(containerId, settings, title, apiPath) {
    const controllerData = buildSettingsForm(settings.data, title);
    document.getElementById(containerId).innerHTML = controllerData.html;

    populateFormFields(settings.data);

    attachFormEventListeners(apiPath);
}

function populateFormFields(settingsData) {
    if (!settingsData) return;
    
    Object.entries(settingsData).forEach(([propertyName, propertyValue]) => {
        const textarea = document.querySelector(`[data-property="${propertyName}"].property-textarea`);
        if (textarea) {
            textarea.value = typeof propertyValue === 'string' 
                ? propertyValue 
                : JSON.stringify(propertyValue, null, 2);
        }
    });
}

function attachFormEventListeners(apiPath) {
    document.getElementById('add-property-btn').addEventListener('click', addNewProperty);

    document.querySelectorAll('.delete-property-btn').forEach(btn => {
        btn.addEventListener('click', deleteProperty);
    });

    document.getElementById('settings-form').addEventListener('submit', (event) => {
        handleFormSubmission(event, apiPath);
    });
}

async function handleFormSubmission(event, apiPath) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
        setButtonState(submitButton, 'Saving...', true);
        
        const dmDataId = document.getElementById('dm-id-input')?.value || '';
        const settingsData = collectFormData();
        const response = await postToApi(apiPath, settingsData, dmDataId);
        
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
