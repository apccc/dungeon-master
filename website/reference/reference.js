const buildReferenceForm = (containerId, settings, title, apiPath, currentInputs = null) => {
    const container = document.getElementById(containerId);
    const data = settings?.data || settings || {};

    // Check if we're viewing a specific resource
    const urlParams = new URLSearchParams(window.location.search);
    const currentResource = urlParams.get('resource');
    
    const html = `
        <div id="reference-container">
            ${renderRootLevelNavigation(data, currentInputs)}
            <div id="breadcrumb-container"></div>
            <div id="reference-data-container">
                ${renderObjectRecursively(data, 'root')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Always attach event listeners after rendering, regardless of data level
    attachReferenceNavigationListeners();
    
    // Store current reference data globally for breadcrumb restoration
    window.currentReferenceData = data;
    
    // Render breadcrumbs after the form is built so we can access the form fields
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    if (breadcrumbContainer) {
        // Use a longer delay to ensure the form is fully rendered and accessible
        setTimeout(() => {
            breadcrumbContainer.innerHTML = renderBreadcrumbNavigation(currentResource, apiPath, currentInputs);
            console.log('Breadcrumbs rendered for:', { currentResource, apiPath, currentInputs });
            
            // Double-check that breadcrumbs are visible after a short delay
            setTimeout(() => {
                ensureBreadcrumbsVisible(currentInputs);
            }, 200);
        }, 100);
    } else {
        console.warn('Breadcrumb container not found');
    }
};



/**
 * Renders navigation fields for root-level data
 * @param {object} data - The root-level data
 * @param {object} currentInputs - Current input values to preserve
 * @returns {string} HTML for navigation fields
 */
function renderRootLevelNavigation(data, currentInputs = null) {
    const keys = Object.keys(data);
    
    // Use current input values if provided, otherwise default to "index"
    const databaseValue = currentInputs?.database || "index";
    const tableValue = currentInputs?.table || "index";
    const resourceValue = currentInputs?.resource || "index";
    
    return `
        <div class="reference-navigation">
            <div class="reference-field">
                <label class="reference-field-label">Database:</label>
                <span class="reference-field-value"><input type="text" id="reference-database-input" value="${databaseValue}" /></span>
            </div>
            <div class="reference-field">
                <label class="reference-field-label">Table:</label>
                <span class="reference-field-value"><input type="text" id="reference-table-input" value="${tableValue}" /></span>
            </div>
            <div class="reference-field">
                <label class="reference-field-label">Resource:</label>
                <span class="reference-field-value"><input type="text" id="reference-resource-input" value="${resourceValue}" /></span>
            </div>
            <div class="reference-field">
                <button type="button" id="reference-load-btn" class="reference-load-button">Load</button>
            </div>
        </div>
    `;
}



/**
 * Renders breadcrumb navigation for the current path
 * @param {string} currentResource - The name of the current resource (if any)
 * @param {string} apiPath - The base API path
 * @param {object} currentInputs - Current input values (database, table, resource)
 * @returns {string} HTML for breadcrumb navigation
 */
function renderBreadcrumbNavigation(currentResource, apiPath, currentInputs = null) {
    // Use provided inputs if available, otherwise try to get from form fields
    let currentDatabase = 'index';
    let currentTable = 'index';
    let currentResourceValue = 'index';
    
    if (currentInputs) {
        currentDatabase = currentInputs.database || 'index';
        currentTable = currentInputs.table || 'index';
        currentResourceValue = currentInputs.resource || 'index';
    } else {
        // Fall back to form field values if inputs not provided
        const databaseInput = document.getElementById('reference-database-input');
        const tableInput = document.getElementById('reference-table-input');
        const resourceInput = document.getElementById('reference-resource-input');
        
        currentDatabase = databaseInput ? databaseInput.value : 'index';
        currentTable = tableInput ? tableInput.value : 'index';
        currentResourceValue = resourceInput ? resourceInput.value : 'index';
    }
    
    console.log('Breadcrumb values:', { currentDatabase, currentTable, currentResourceValue });
    
    let breadcrumbHtml = '';
    
    // Check if we're truly at root level (all values are 'index')
    const isTrulyRootLevel = currentDatabase === 'index' && currentTable === 'index' && currentResourceValue === 'index';
    
    if (isTrulyRootLevel) {
        // Root level - all fields set to index
        breadcrumbHtml = `
            <div class="reference-breadcrumb">
                <a href="#" onclick="setBreadcrumbValues('index', 'index', 'index')" class="reference-breadcrumb-link">Root</a>
            </div>
        `;
        console.log('Rendering root level breadcrumbs');
    } else {
        console.log('Rendering non-root level breadcrumbs for:', { currentDatabase, currentTable, currentResourceValue });
        const pathParts = [];
        
        // Root breadcrumb - set all to index
        pathParts.push(`<a href="#" onclick="setBreadcrumbValues('index', 'index', 'index')" class="reference-breadcrumb-link">Root</a>`);
        pathParts.push(`<span class="reference-breadcrumb-separator">/</span>`);
        
        if (currentDatabase !== 'index') {
            // Second level - keep database, set table and resource to index
            pathParts.push(`<a href="#" onclick="setBreadcrumbValues('${currentDatabase}', 'index', 'index')" class="reference-breadcrumb-link">${currentDatabase}</a>`);
            pathParts.push(`<span class="reference-breadcrumb-separator">/</span>`);
            
            if (currentTable !== 'index') {
                // Third level - keep database and table, set resource to index
                pathParts.push(`<a href="#" onclick="setBreadcrumbValues('${currentDatabase}', '${currentTable}', 'index')" class="reference-breadcrumb-link">${currentTable}</a>`);
                pathParts.push(`<span class="reference-breadcrumb-separator">/</span>`);
                
                if (currentResourceValue !== 'index') {
                    // Current level - show current resource
                    pathParts.push(`<span class="reference-breadcrumb-current">${currentResourceValue}</span>`);
                } else {
                    pathParts.push(`<span class="reference-breadcrumb-current">${currentTable}</span>`);
                }
            } else {
                pathParts.push(`<span class="reference-breadcrumb-current">${currentDatabase}</span>`);
            }
        } else {
            pathParts.push(`<span class="reference-breadcrumb-current">Root Index</span>`);
        }

        breadcrumbHtml = `
            <div class="reference-breadcrumb">
                ${pathParts.join('')}
            </div>
        `;
    }

    return breadcrumbHtml;
}

/**
 * Recursively renders an object or value for display
 * @param {any} value - The value to render
 * @param {string} key - The key name for this value
 * @param {number} depth - Current nesting depth
 * @returns {string} HTML string representation
 */
function renderObjectRecursively(value, key, depth = 0) {
    const depthClass = depth > 0 ? ` reference-depth-${Math.min(depth, 5)}` : '';
    
    if (value === null) {
        return `<div class="reference-item reference-null${depthClass}">
            <span class="reference-key">${key}:</span>
            <span class="reference-value reference-null-value">null</span>
        </div>`;
    }
    
    if (value === undefined) {
        return `<div class="reference-item reference-undefined${depthClass}">
            <span class="reference-key">${key}:</span>
            <span class="reference-value reference-undefined-value">undefined</span>
        </div>`;
    }
    
    if (typeof value === 'string') {
        // Special handling for root-level API endpoints
        if (depth === 0 && value.startsWith('/api/')) {
            return `<div class="reference-item reference-api-endpoint${depthClass}">
                <span class="reference-key">${key}:</span>
                <span class="reference-value reference-api-endpoint-value">
                    <a href="#" onclick="navigateToEndpoint('${value}')" class="api-endpoint-link">${value}</a>
                </span>
            </div>`;
        }
        
        // Special handling for strings starting with "/api/2014" - convert to clickable links
        if (value.startsWith('/api/2014/')) {
            return `<div class="reference-item reference-api-link${depthClass}">
                <span class="reference-key">${key}:</span>
                <span class="reference-value reference-api-link-value">
                    <a href="#" onclick="navigateToApi2014('${value}')" class="api-2014-link">${value}</a>
                </span>
            </div>`;
        }
        
        return `<div class="reference-item reference-string${depthClass}">
            <span class="reference-key">${key}:</span>
            <span class="reference-value reference-string-value">"${escapeHtml(value)}"</span>
        </div>`;
    }
    
    if (typeof value === 'number') {
        return `<div class="reference-item reference-number${depthClass}">
            <span class="reference-key">${key}:</span>
            <span class="reference-value reference-number-value">${value}</span>
        </div>`;
    }
    
    if (typeof value === 'boolean') {
        return `<div class="reference-item reference-boolean${depthClass}">
            <span class="reference-key">${key}:</span>
            <span class="reference-value reference-boolean-value">${value}</span>
        </div>`;
    }
    
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return `<div class="reference-item reference-array reference-empty${depthClass}">
                <span class="reference-key">${key}:</span>
                <span class="reference-value reference-array-value">[]</span>
            </div>`;
        }
        
        const arrayItems = value.map((item, index) => 
            renderObjectRecursively(item, `[${index}]`, depth + 1)
        ).join('');
        
        return `<div class="reference-item reference-array${depthClass}">
            <div class="reference-array-header">
                <span class="reference-key">${key}:</span>
                <span class="reference-value reference-array-value">[${value.length} items]</span>
                <button type="button" class="reference-toggle-btn" onclick="toggleReferenceSection(this)">
                    <span class="toggle-icon">▼</span>
                </button>
            </div>
            <div class="reference-array-content">
                ${arrayItems}
            </div>
        </div>`;
    }
    
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) {
            return `<div class="reference-item reference-object reference-empty${depthClass}">
                <span class="reference-key">${key}:</span>
                <span class="reference-value reference-object-value">{}</span>
            </div>`;
        }
        
        const objectItems = keys.map(k => 
            renderObjectRecursively(value[k], k, depth + 1)
        ).join('');
        
        return `<div class="reference-item reference-object${depthClass}">
            <div class="reference-object-header">
                <span class="reference-key">${key}:</span>
                <span class="reference-value reference-object-value">{${keys.length} properties}</span>
                <button type="button" class="reference-toggle-btn" onclick="toggleReferenceSection(this)">
                    <span class="toggle-icon">▼</span>
                </button>
            </div>
            <div class="reference-object-content">
                ${objectItems}
            </div>
        </div>`;
    }
    
    // Fallback for other types
    return `<div class="reference-item reference-unknown${depthClass}">
        <span class="reference-key">${key}:</span>
        <span class="reference-value reference-unknown-value">${String(value)}</span>
    </div>`;
}

/**
 * Toggles the visibility of reference sections (arrays and objects)
 * @param {HTMLElement} button - The toggle button element
 */
function toggleReferenceSection(button) {
    const content = button.closest('.reference-item').querySelector('.reference-array-content, .reference-object-content');
    const icon = button.querySelector('.toggle-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
        button.classList.remove('collapsed');
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
        button.classList.add('collapsed');
    }
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Navigates to a specific API endpoint
 * @param {string} endpoint - The API endpoint to navigate to
 */
function navigateToEndpoint(endpoint) {
    // Extract the resource name from the endpoint (e.g., "/api/2014/monsters" -> "monsters")
    const resourceName = endpoint.split('/').pop();
    
    // Extract database and table from the endpoint path
    const pathParts = endpoint.split('/');
    const database = pathParts[2] || 'index'; // /api/2014/monsters -> 2014
    const table = pathParts[3] || 'index';   // /api/2014/monsters -> monsters
    
    // URL updates removed - browser URL should not be modified
    console.log('Navigating to endpoint:', endpoint);
    
    // Preserve the database and table values when navigating
    const currentInputs = { database, table, resource: resourceName };
    
    // Reload the reference data for the specific endpoint
    loadApiController(endpoint.replace('/api/', ''), 'middle', `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} Reference`, (containerId, settings, title, apiPath) => {
        buildReferenceForm(containerId, settings, title, apiPath, currentInputs);
    });
}

/**
 * Navigates to a specific API 2014 endpoint and populates the form fields
 * @param {string} apiPath - The API path (e.g., "/api/2014/features/bardic-inspiration-d6")
 * Note: The "2014" is the API version and is not used for database/table/resource mapping
 */
function navigateToApi2014(apiPath) {
    // Parse the API path to extract database, table, and resource
    // Format: /api/2014/features/bardic-inspiration-d6
    const pathParts = apiPath.split('/');
    
    // Extract components - skip the "2014" version part
    const database = pathParts[3] || 'index';        // "features" (was pathParts[2] = "2014")
    const table = pathParts[4] || 'index';           // "bardic-inspiration-d6" (was pathParts[3] = "features")
    const resource = pathParts[5] || 'index';        // next level if exists (was pathParts[4])
    
    console.log('Parsed API 2014 path:', { apiPath, database, table, resource });
    
    // Populate the form fields
    const databaseInput = document.getElementById('reference-database-input');
    const tableInput = document.getElementById('reference-table-input');
    const resourceInput = document.getElementById('reference-resource-input');
    
    if (databaseInput) databaseInput.value = database;
    if (tableInput) tableInput.value = table;
    if (resourceInput) resourceInput.value = resource;
    
    // Automatically execute the Load function
    setTimeout(() => {
        try {
            handleReferenceLoad();
        } catch (error) {
            console.error('Error loading reference data after API 2014 navigation:', error);
        }
    }, 100);
}

/**
 * Attaches event listeners to the reference navigation elements
 */
function attachReferenceNavigationListeners() {
    const loadButton = document.getElementById('reference-load-btn');
    if (loadButton) {
        console.log('Attaching event listener to Load button');
        loadButton.addEventListener('click', handleReferenceLoad);
    } else {
        console.warn('Load button not found when trying to attach event listener');
    }
}

/**
 * Handles the Load button click event
 */
async function handleReferenceLoad() {
    console.log('Load button clicked!');
    const database = getReferenceInputValue('reference-database-input');
    const table = getReferenceInputValue('reference-table-input');
    const resource = getReferenceInputValue('reference-resource-input');
    
    if (!database || !table || !resource) {
        showReferenceError('Please fill in all fields (Database, Table, Resource)');
        return;
    }
    
    try {
        await loadReferenceData(database, table, resource);
    } catch (error) {
        console.error('Failed to load reference data:', error);
        showReferenceError('Failed to load reference data. Please check your inputs and try again.');
    }
}

/**
 * Gets the value from a reference input field
 * @param {string} inputId - The ID of the input field
 * @returns {string} The trimmed input value
 */
function getReferenceInputValue(inputId) {
    const input = document.getElementById(inputId);
    return input ? input.value.trim() : '';
}

/**
 * Loads reference data with the specified parameters using existing api.js conventions
 * @param {string} database - The database name
 * @param {string} table - The table name
 * @param {string} resource - The resource name
 */
async function loadReferenceData(database, table, resource) {
    const loadButton = document.getElementById('reference-load-btn');
    const originalText = loadButton.textContent;
    
    try {
        // Use existing button state management from api.js
        setButtonState(loadButton, 'Loading...', true);
        
        // Construct the API path with parameters
        const apiPath = `reference?database=${encodeURIComponent(database)}&table=${encodeURIComponent(table)}&resource=${encodeURIComponent(resource)}`;
        
        // Preserve current input values when rebuilding the form
        const currentInputs = { database, table, resource };
        
        // Use existing loadApiController function from api.js, but pass current inputs
        await loadApiController(apiPath, 'middle', `${resource.charAt(0).toUpperCase() + resource.slice(1)} Reference`, (containerId, settings, title, apiPath) => {
            buildReferenceForm(containerId, settings, title, apiPath, currentInputs);
            
            // Ensure breadcrumbs are rendered after the form is built
            setTimeout(() => {
                const breadcrumbContainer = document.getElementById('breadcrumb-container');
                if (breadcrumbContainer) {
                    breadcrumbContainer.innerHTML = renderBreadcrumbNavigation(resource, apiPath, currentInputs);
                    console.log('Breadcrumbs re-rendered after load:', { resource, apiPath, currentInputs });
                }
            }, 100);
        });
        
        // Update URL to reflect the loaded resource
        updateReferenceURL(resource);
        
        setButtonState(loadButton, 'Loaded!', false, '#4CAF50', 'white');
        
    } catch (error) {
        console.error('Load failed:', error);
        setButtonState(loadButton, 'Load Failed', false, '#f44336', 'white');
        throw error;
    }
    
    setTimeout(() => {
        resetButtonState(loadButton, originalText);
    }, 1000);
}

/**
 * Updates the URL to reflect the loaded resource
 * @param {string} resource - The resource name
 */
function updateReferenceURL(resource) {
    // URL updates removed - browser URL should not be modified
    console.log('Resource loaded:', resource);
}

/**
 * Sets the breadcrumb values in the form fields
 * @param {string} database - The database value to set
 * @param {string} table - The table value to set
 * @param {string} resource - The resource value to set
 */
function setBreadcrumbValues(database, table, resource) {
    console.log('Setting breadcrumb values:', { database, table, resource });
    
    const databaseInput = document.getElementById('reference-database-input');
    const tableInput = document.getElementById('reference-table-input');
    const resourceInput = document.getElementById('reference-resource-input');
    
    if (databaseInput) databaseInput.value = database;
    if (tableInput) tableInput.value = table;
    if (resourceInput) resourceInput.value = resource;
    
    // Automatically load the data with the new values
    if (database !== 'index' || table !== 'index' || resource !== 'index') {
        // Use a small delay to ensure the form is fully updated
        setTimeout(() => {
            try {
                handleReferenceLoad();
            } catch (error) {
                console.error('Error loading reference data after breadcrumb navigation:', error);
            }
        }, 100);
    } else {
        // If going back to root, load the root-level data
        setTimeout(() => {
            try {
                handleReferenceLoad();
            } catch (error) {
                console.error('Error loading root reference data after breadcrumb navigation:', error);
            }
        }, 100);
    }
}

/**
 * Ensures breadcrumbs are visible and properly rendered
 * @param {object} currentInputs - Current input values
 */
function ensureBreadcrumbsVisible(currentInputs = null) {
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    if (breadcrumbContainer && (!breadcrumbContainer.innerHTML || breadcrumbContainer.innerHTML.trim() === '')) {
        console.log('Breadcrumbs missing, restoring them...');
        
        // Get current values from form if not provided
        if (!currentInputs) {
            const databaseInput = document.getElementById('reference-database-input');
            const tableInput = document.getElementById('reference-table-input');
            const resourceInput = document.getElementById('reference-resource-input');
            
            if (databaseInput && tableInput && resourceInput) {
                currentInputs = {
                    database: databaseInput.value || 'index',
                    table: tableInput.value || 'index',
                    resource: resourceInput.value || 'index'
                };
            }
        }
        
        // Default to root level if no inputs available
        if (!currentInputs) {
            currentInputs = { database: 'index', table: 'index', resource: 'index' };
        }
        
        breadcrumbContainer.innerHTML = renderBreadcrumbNavigation(currentInputs.resource, null, currentInputs);
        console.log('Breadcrumbs restored for:', currentInputs);
    }
}

/**
 * Shows an error message to the user
 * @param {string} message - The error message to display
 */
function showReferenceError(message) {
    // Create or update error message element
    let errorElement = document.getElementById('reference-error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'reference-error-message';
        errorElement.className = 'reference-error-message';
        errorElement.style.cssText = 'color: #f44336; margin-top: 10px; padding: 10px; background-color: #ffebee; border: 1px solid #f44336; border-radius: 4px;';
        
        const navigationElement = document.querySelector('.reference-navigation');
        if (navigationElement) {
            navigationElement.appendChild(errorElement);
        }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide error message after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}


document.addEventListener('DOMContentLoaded', () => {
    loadApiController('reference', 'middle', 'Reference', (containerId, settings, title, apiPath) => {
        buildReferenceForm(containerId, settings, title, apiPath, { database: 'index', table: 'index', resource: 'index' });
    });
    
    // Periodically check if breadcrumbs are visible and restore them if needed
    setInterval(() => {
        const breadcrumbContainer = document.getElementById('breadcrumb-container');
        if (breadcrumbContainer && (!breadcrumbContainer.innerHTML || breadcrumbContainer.innerHTML.trim() === '')) {
            console.log('Breadcrumbs check: missing, restoring...');
            ensureBreadcrumbsVisible();
        }
    }, 2000); // Check every 2 seconds
});
