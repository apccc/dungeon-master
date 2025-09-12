/**
 * Initialize Multiple Form - Generic display for multiple items
 * 
 * This function creates a display for multiple items from API data.
 * It handles both object and string formats in the data.
 * Includes functionality to create and delete items.
 * 
 * @param {string} containerId - The ID of the container to populate
 * @param {Object} apiData - The API response data
 * @param {string} title - The title to display
 * @param {string} apiPath - The API path for save operations
 */
function initializeMultipleForm(containerId, apiData, title, apiPath) {
    const container = document.getElementById(containerId);
    
    console.log('Initializing multiple form with data:', apiData);
    console.log('API data structure:', JSON.stringify(apiData, null, 2));
    
    // Store API path for later use
    window.currentMultipleFormApiPath = apiPath;
    
    // Store the current entity manager if available
    const entityType = getEntityTypeFromApiPath(apiPath);
    const entityManager = getEntityManager(entityType);
    
    // Build the multiple items display HTML
    const displayHtml = buildMultipleItemsDisplay(apiData?.data || {}, title, entityManager);
    container.innerHTML = displayHtml;
    
    // Attach event listeners
    attachMultipleItemsEventListeners(entityManager);
}

/**
 * Get entity type from API path
 * @param {string} apiPath - The API path
 * @returns {string} The entity type
 */
function getEntityTypeFromApiPath(apiPath) {
    if (apiPath.includes('/monsters')) return 'monster';
    if (apiPath.includes('/npcs')) return 'npc';
    if (apiPath.includes('/items')) return 'item';
    if (apiPath.includes('/locations')) return 'location';
    if (apiPath.includes('/quests')) return 'quest';
    return 'entity';
}

/**
 * Get entity manager for the given entity type
 * @param {string} entityType - The entity type
 * @returns {Object|null} The entity manager instance
 */
function getEntityManager(entityType) {
    switch (entityType) {
        case 'monster':
            return window.monsterManager || null;
        case 'npc':
            return window.npcManager || null;
        case 'item':
            return window.itemManager || null;
        case 'location':
            return window.locationManager || null;
        case 'quest':
            return window.questManager || null;
        default:
            return null;
    }
}

/**
 * Build HTML for displaying multiple items
 * 
 * @param {Object} itemsData - The items data object
 * @param {string} title - The title to display
 * @param {Object} entityManager - The entity manager instance
 * @returns {string} HTML string for the display
 */
function buildMultipleItemsDisplay(itemsData, title, entityManager) {
    const itemsList = Object.entries(itemsData || {}).map(([itemKey, itemData]) => {
        return buildSingleItemDisplay(itemKey, itemData, entityManager);
    }).join('');
    
    return `
        <div id="multiple-items-container">
            <h2 id="multiple-items-title">${title}</h2>
            
            <!-- Add New Item Controls -->
            <div class="new-item-controls">
                <div class="new-item-form">
                    <input type="text" id="new-item-key" placeholder="Key" />
                    <input type="text" id="new-item-name" placeholder="Name" />
                    <input type="text" id="new-item-type" placeholder="Type" />
                    <input type="text" id="new-item-image" placeholder="Image Path" />
                    <textarea id="new-item-description" placeholder="Description"></textarea>
                    <button type="button" id="add-item-btn">Add</button>
                </div>
            </div>
            
            <!-- Items Grid -->
            <div class="items-grid">
                ${itemsList}
            </div>
            
            <!-- Save Button -->
            <div class="form-actions">
                <button type="button" id="save-items-btn">Save All Changes</button>
            </div>
        </div>
    `;
}

/**
 * Build HTML for a single item display
 * 
 * @param {string} itemKey - The key/ID of the item
 * @param {Object|string} itemData - The item data (can be object or JSON string)
 * @param {Object} entityManager - The entity manager instance
 * @returns {string} HTML string for the single item
 */
function buildSingleItemDisplay(itemKey, itemData, entityManager) {
    // Parse item data if it's a string
    let parsedData = itemData;
    if (typeof itemData === 'string') {
        try {
            parsedData = JSON.parse(itemData);
        } catch (error) {
            console.warn(`Failed to parse item data for ${itemKey}:`, error);
            parsedData = { name: itemKey, description: itemData };
        }
    }
    
    // Store the parsed data in the entity manager's client data if available
    if (entityManager) {
        entityManager.clientData[itemKey] = parsedData;
    }
    
    // Extract common properties
    const name = parsedData.name || itemKey;
    const description = parsedData.description || '';
    const type = parsedData.type || '';
    const image = parsedData.image || '';
    
    // Build the item HTML
    const imageHtml = image ? `<div class="item-image"><img src="/images/${image}" alt="${name}" /></div>` : '';
    const typeHtml = type ? `<div class="item-type">${type}</div>` : '';
    const descriptionHtml = description ? `<div class="item-description">${description}</div>` : '';
    
    return `
        <div class="item-card" data-item-key="${itemKey}">
            <button type="button" class="delete-item-btn" data-item-key="${itemKey}" title="Delete item">×</button>
            <button type="button" class="edit-item-btn" data-item-key="${itemKey}" title="Edit item">✏️</button>
            ${imageHtml}
            <div class="item-content">
                <input type="text" class="item-name-edit" value="${name}" data-field="name" placeholder="Name" style="display: none;" />
                <h3 class="item-name">${name}</h3>
                <input type="text" class="item-type-edit" value="${type}" data-field="type" placeholder="Type" style="display: none;" />
                ${typeHtml}
                <input type="text" class="item-image-edit" value="${image}" data-field="image" placeholder="Image Path" style="display: none;" />
                <textarea class="item-description-edit" data-field="description" placeholder="Description" style="display: none;">${description}</textarea>
                ${descriptionHtml}
            </div>
        </div>
    `;
}

/**
 * Attach event listeners for the multiple items display
 * @param {Object} entityManager - The entity manager instance
 */
function attachMultipleItemsEventListeners(entityManager) {
    // Add new item button
    const addItemBtn = document.getElementById('add-item-btn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => addNewItem(entityManager));
    }
    
    // Save items button
    const saveItemsBtn = document.getElementById('save-items-btn');
    if (saveItemsBtn) {
        saveItemsBtn.addEventListener('click', () => saveAllItems(entityManager));
    }
    
    // Delete item buttons
    const deleteButtons = document.querySelectorAll('.delete-item-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent card click
            deleteItem(event.target.dataset.itemKey, entityManager);
        });
    });
    
    // Edit item buttons
    const editButtons = document.querySelectorAll('.edit-item-btn');
    editButtons.forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent card click
            toggleEditMode(event.target.dataset.itemKey, entityManager);
        });
    });
    
    // Add input change listeners for real-time updates
    const editInputs = document.querySelectorAll('.item-name-edit, .item-type-edit, .item-image-edit, .item-description-edit');
    editInputs.forEach(input => {
        // Add click event listener to prevent card click when clicking on input fields
        input.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent card click
        });
        
        input.addEventListener('input', (event) => {
            const itemKey = event.target.closest('.item-card').dataset.itemKey;
            const fieldName = event.target.dataset.field;
            const newValue = event.target.value;
            
            // Update client-side data representation
            if (entityManager && itemKey && fieldName) {
                entityManager.updateClientData(itemKey, fieldName, newValue);
            }
        });
    });
    
    // Add click handlers to item cards if needed
    const itemCards = document.querySelectorAll('.item-card');
    itemCards.forEach(card => {
        card.addEventListener('click', (event) => {
            // Don't trigger if clicking delete or edit button, or any input fields
            if (event.target.classList.contains('delete-item-btn') || 
                event.target.classList.contains('edit-item-btn') ||
                event.target.classList.contains('item-name-edit') ||
                event.target.classList.contains('item-type-edit') ||
                event.target.classList.contains('item-image-edit') ||
                event.target.classList.contains('item-description-edit')) {
                return;
            }
            const itemKey = event.currentTarget.dataset.itemKey;
            console.log('Item clicked:', itemKey);
            
            // Populate dm-id-input with the item key
            const dmIdInput = document.getElementById('dm-id-input');
            if (dmIdInput) {
                dmIdInput.value = itemKey;
                console.log('Populated dm-id-input with:', itemKey);
                
                // If we have an entity manager, use it to load the entity form
                if (entityManager && itemKey && itemKey.trim() !== '') {
                    // Add a small delay to ensure the dm-id-input value is set
                    setTimeout(() => {
                        entityManager.loadEntityForm(itemKey);
                    }, 100);
                } else if (window.location.pathname.includes('/monsters.html') && itemKey && itemKey.trim() !== '') {
                    // Fallback for backward compatibility
                    setTimeout(() => {
                        if (typeof loadMonsterForm === 'function') {
                            loadMonsterForm(itemKey);
                        } else {
                            console.warn('loadMonsterForm function not available');
                        }
                    }, 100);
                }
            } else {
                console.warn('dm-id-input element not found');
            }
        });
    });
    
    // Add hover effects
    itemCards.forEach(card => {
        card.addEventListener('mouseenter', (event) => {
            event.currentTarget.classList.add('hovered');
        });
        
        card.addEventListener('mouseleave', (event) => {
            event.currentTarget.classList.remove('hovered');
        });
    });
}

/**
 * Add a new item to the display
 * @param {Object} entityManager - The entity manager instance
 */
function addNewItem(entityManager) {
    const keyInput = document.getElementById('new-item-key');
    const nameInput = document.getElementById('new-item-name');
    const typeInput = document.getElementById('new-item-type');
    const imageInput = document.getElementById('new-item-image');
    const descriptionInput = document.getElementById('new-item-description');
    
    const key = keyInput.value.trim();
    const name = nameInput.value.trim();
    const type = typeInput.value.trim();
    const image = imageInput.value.trim();
    const description = descriptionInput.value.trim();
    
    if (!key || !name) {
        alert('Please enter both Item Key and Item Name');
        return;
    }
    
    // Validate key format (lowercase alphanumeric and minus only)
    const keyPattern = /^[a-z0-9-]+$/;
    if (!keyPattern.test(key)) {
        alert('Item Key must contain only lowercase letters, numbers, and minus characters');
        return;
    }
    
    // Check if item already exists
    const existingCard = document.querySelector(`[data-item-key="${key}"]`);
    if (existingCard) {
        alert('An item with this key already exists');
        return;
    }
    
    // Create new item data
    const newItemData = {
        name: name,
        type: type,
        image: image,
        description: description
    };
    
    // Add to grid
    const itemsGrid = document.querySelector('.items-grid');
    const newItemHtml = buildSingleItemDisplay(key, newItemData, entityManager);
    itemsGrid.insertAdjacentHTML('beforeend', newItemHtml);
    
    // Clear form
    keyInput.value = '';
    nameInput.value = '';
    typeInput.value = '';
    imageInput.value = '';
    descriptionInput.value = '';
    
    // Reattach event listeners for the new item
    attachMultipleItemsEventListeners(entityManager);
    
    console.log('Added new item:', key, newItemData);
}

/**
 * Delete an item from the display
 * @param {string} itemKey - The key of the item to delete
 * @param {Object} entityManager - The entity manager instance
 */
function deleteItem(itemKey, entityManager) {
    if (confirm(`Are you sure you want to delete the item "${itemKey}"?`)) {
        const itemCard = document.querySelector(`[data-item-key="${itemKey}"]`);
        if (itemCard) {
            itemCard.remove();
            
            // Remove from entity manager's client data
            if (entityManager && entityManager.clientData[itemKey]) {
                delete entityManager.clientData[itemKey];
            }
            
            console.log('Deleted item:', itemKey);
        }
    }
}

/**
 * Toggle edit mode for an item
 * @param {string} itemKey - The key of the item to edit
 * @param {Object} entityManager - The entity manager instance
 */
function toggleEditMode(itemKey, entityManager) {
    const itemCard = document.querySelector(`[data-item-key="${itemKey}"]`);
    if (!itemCard) return;
    
    const isEditing = itemCard.classList.contains('editing');
    
    if (isEditing) {
        // Save changes and exit edit mode
        saveItemChanges(itemKey, entityManager);
        exitEditMode(itemCard);
    } else {
        // Enter edit mode
        enterEditMode(itemCard);
    }
}

/**
 * Enter edit mode for an item card
 */
function enterEditMode(itemCard) {
    itemCard.classList.add('editing');
    
    // Hide display elements
    const nameDisplay = itemCard.querySelector('.item-name');
    const typeDisplay = itemCard.querySelector('.item-type');
    const descriptionDisplay = itemCard.querySelector('.item-description');
    const imageDisplay = itemCard.querySelector('.item-image');
    
    // Show edit elements
    const nameEdit = itemCard.querySelector('.item-name-edit');
    const typeEdit = itemCard.querySelector('.item-type-edit');
    const descriptionEdit = itemCard.querySelector('.item-description-edit');
    const imageEdit = itemCard.querySelector('.item-image-edit');
    
    if (nameDisplay) nameDisplay.style.display = 'none';
    if (typeDisplay) typeDisplay.style.display = 'none';
    if (descriptionDisplay) descriptionDisplay.style.display = 'none';
    if (imageDisplay) imageDisplay.style.display = 'none';
    
    if (nameEdit) nameEdit.style.display = 'block';
    if (typeEdit) typeEdit.style.display = 'block';
    if (descriptionEdit) descriptionEdit.style.display = 'block';
    if (imageEdit) imageEdit.style.display = 'block';
    
    // Update edit button
    const editBtn = itemCard.querySelector('.edit-item-btn');
    if (editBtn) editBtn.textContent = '💾';
}

/**
 * Exit edit mode for an item card
 */
function exitEditMode(itemCard) {
    itemCard.classList.remove('editing');
    
    // Show display elements
    const nameDisplay = itemCard.querySelector('.item-name');
    const typeDisplay = itemCard.querySelector('.item-type');
    const descriptionDisplay = itemCard.querySelector('.item-description');
    const imageDisplay = itemCard.querySelector('.item-image');
    
    // Hide edit elements
    const nameEdit = itemCard.querySelector('.item-name-edit');
    const typeEdit = itemCard.querySelector('.item-type-edit');
    const descriptionEdit = itemCard.querySelector('.item-description-edit');
    const imageEdit = itemCard.querySelector('.item-image-edit');
    
    if (nameDisplay) nameDisplay.style.display = 'block';
    if (typeDisplay) typeDisplay.style.display = 'block';
    if (descriptionDisplay) descriptionDisplay.style.display = 'block';
    if (imageDisplay) imageDisplay.style.display = 'block';
    
    if (nameEdit) nameEdit.style.display = 'none';
    if (typeEdit) typeEdit.style.display = 'none';
    if (descriptionEdit) descriptionEdit.style.display = 'none';
    if (imageEdit) imageEdit.style.display = 'none';
    
    // Update edit button
    const editBtn = itemCard.querySelector('.edit-item-btn');
    if (editBtn) editBtn.textContent = '✏️';
}

/**
 * Save changes for a specific item
 * @param {string} itemKey - The key of the item to save
 * @param {Object} entityManager - The entity manager instance
 */
function saveItemChanges(itemKey, entityManager) {
    const itemCard = document.querySelector(`[data-item-key="${itemKey}"]`);
    if (!itemCard) return;
    
    // Get values from edit fields
    const nameEdit = itemCard.querySelector('.item-name-edit');
    const typeEdit = itemCard.querySelector('.item-type-edit');
    const descriptionEdit = itemCard.querySelector('.item-description-edit');
    const imageEdit = itemCard.querySelector('.item-image-edit');
    
    const newName = nameEdit ? nameEdit.value.trim() : '';
    const newType = typeEdit ? typeEdit.value.trim() : '';
    const newDescription = descriptionEdit ? descriptionEdit.value.trim() : '';
    const newImage = imageEdit ? imageEdit.value.trim() : '';
    
    // Update display elements
    const nameDisplay = itemCard.querySelector('.item-name');
    const typeDisplay = itemCard.querySelector('.item-type');
    const descriptionDisplay = itemCard.querySelector('.item-description');
    const imageDisplay = itemCard.querySelector('.item-image');
    
    if (nameDisplay) nameDisplay.textContent = newName;
    if (typeDisplay) {
        if (newType) {
            typeDisplay.textContent = newType;
            typeDisplay.style.display = 'block';
        } else {
            typeDisplay.style.display = 'none';
        }
    }
    if (descriptionDisplay) {
        if (newDescription) {
            descriptionDisplay.textContent = newDescription;
            descriptionDisplay.style.display = 'block';
        } else {
            descriptionDisplay.style.display = 'none';
        }
    }
    
    // Update image
    if (imageDisplay) {
        if (newImage) {
            const img = imageDisplay.querySelector('img');
            if (img) {
                img.src = `/images/${newImage}`;
                img.alt = newName;
            }
            imageDisplay.style.display = 'block';
        } else {
            imageDisplay.style.display = 'none';
        }
    }
    
    // Update entity manager's client data
    if (entityManager) {
        entityManager.updateClientData(itemKey, 'name', newName);
        entityManager.updateClientData(itemKey, 'type', newType);
        entityManager.updateClientData(itemKey, 'description', newDescription);
        entityManager.updateClientData(itemKey, 'image', newImage);
    }
    
    console.log('Saved changes for item:', itemKey, { name: newName, type: newType, description: newDescription, image: newImage });
}

/**
 * Save all items to the API
 * @param {Object} entityManager - The entity manager instance
 */
async function saveAllItems(entityManager) {
    const saveButton = document.getElementById('save-items-btn');
    const originalText = saveButton.textContent;
    
    try {
        setButtonState(saveButton, 'Saving...', true);
        
        // Collect all current items - use entity manager's client data if available
        const itemsData = entityManager ? 
            entityManager.clientData : 
            collectAllItemsData();
        
        // Get DM data ID if available
        const dmDataId = document.getElementById('dm-id-input')?.value || '';
        
        // Save to API
        const response = await postToApi(window.currentMultipleFormApiPath, itemsData, dmDataId);
        
        console.log('Save response:', response);
        setButtonState(saveButton, 'Saved!', false, '#4CAF50', 'white');
        
    } catch (error) {
        console.error('Save failed:', error);
        setButtonState(saveButton, 'Save Failed', false, '#f44336', 'white');
    }
    
    setTimeout(() => {
        resetButtonState(saveButton, originalText);
    }, 1000);
}

/**
 * Collect all items data from the current display
 */
function collectAllItemsData() {
    const itemsData = {};
    const itemCards = document.querySelectorAll('.item-card');
    
    itemCards.forEach(card => {
        const itemKey = card.dataset.itemKey;
        const nameElement = card.querySelector('.item-name');
        const typeElement = card.querySelector('.item-type');
        const descriptionElement = card.querySelector('.item-description');
        const imageElement = card.querySelector('.item-image img');
        
        const itemData = {
            name: nameElement ? nameElement.textContent : itemKey,
            type: typeElement ? typeElement.textContent : '',
            description: descriptionElement ? descriptionElement.textContent : '',
            image: imageElement ? imageElement.src.replace('/images/', '') : ''
        };
        
        itemsData[itemKey] = itemData;
    });
    
    return itemsData;
}

/**
 * Set button state for visual feedback
 */
function setButtonState(button, text, disabled, backgroundColor = '', color = '') {
    button.textContent = text;
    button.disabled = disabled;
    if (backgroundColor) button.style.backgroundColor = backgroundColor;
    if (color) button.style.color = color;
}

/**
 * Reset button state
 */
function resetButtonState(button, originalText) {
    button.textContent = originalText;
    button.disabled = false;
    button.style.backgroundColor = '';
    button.style.color = '';
}
