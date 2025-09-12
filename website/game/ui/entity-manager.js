// Generic Entity Manager for handling different entity types
class EntityManager {
    constructor(entityType, apiPath, title, fieldPopulator) {
        this.entityType = entityType;
        this.apiPath = apiPath;
        this.title = title;
        this.fieldPopulator = fieldPopulator;
        this.clientData = {}; // Store client-side data representation
    }

    // Initialize the entity manager
    initialize() {
        loadApiController(this.apiPath, 'middle', this.title, initializeMultipleForm);
        this.setupPageReloadOverride();
    }

    // Load individual entity form when an entity is selected
    async loadEntityForm(entityId) {
        if (!entityId) {
            console.warn(`No ${this.entityType} ID provided to loadEntityForm`);
            return;
        }
        
        console.log(`Loading ${this.entityType} form for ID:`, entityId);
        
        try {
            // Load the specific entity data using the same API path but with dm_data_id
            const entityData = await getFromApi(this.apiPath, entityId);
            console.log(`Loaded ${this.entityType} data:`, entityData);
            console.log(`${this.entityType} data type:`, typeof entityData);
            console.log(`${this.entityType} data keys:`, entityData ? Object.keys(entityData) : 'null/undefined');
            
            // Check if we got valid data
            if (!entityData) {
                throw new Error(`No ${this.entityType} data returned from API`);
            }
            
            // Wait for field populator to be available before initializing
            const waitForFieldPopulator = (callback) => {
                if (this.fieldPopulator && typeof this.fieldPopulator.populateForm === 'function') {
                    console.log(`${this.entityType}FieldPopulator is ready for ${this.entityType} form`);
                    callback();
                } else {
                    console.log(`Waiting for ${this.entityType}FieldPopulator to load for ${this.entityType} form...`);
                    setTimeout(() => waitForFieldPopulator(callback), 100);
                }
            };
            
            waitForFieldPopulator(() => {
                // Initialize the entity form with the loaded data
                this.initializeEntityForm('middle', entityData, `Edit ${this.title}`, this.apiPath);
            });
            
        } catch (error) {
            console.error(`Failed to load ${this.entityType} form:`, error);
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
            alert(`Failed to load ${this.entityType} data: ${error.message}. Please try again.`);
        }
    }

    // Initialize entity form (to be overridden by specific entity types)
    initializeEntityForm(containerId, entityData, title, apiPath) {
        // This should be overridden by specific entity managers
        console.warn('initializeEntityForm not implemented for this entity type');
    }

    // Load the entities list (go back from individual entity form)
    async loadEntitiesList() {
        try {
            // Clear the dm-id-input to load all entities
            const dmIdInput = document.getElementById('dm-id-input');
            if (dmIdInput) {
                dmIdInput.value = '';
            }
            
            // Load the entities list
            await loadApiController(this.apiPath, 'middle', this.title, initializeMultipleForm);
            
            // Re-setup the reload override for future Load button clicks
            this.setupPageReloadOverride();
            
        } catch (error) {
            console.error(`Failed to load ${this.entityType} list:`, error);
            alert(`Failed to load ${this.entityType} list. Please try again.`);
        }
    }

    // Setup override for reloadApiController on entity page
    setupPageReloadOverride() {
        // Store the original reloadApiController function
        const originalReloadApiController = window.reloadApiController;
        
        // Override reloadApiController to check if we're on entity page with an entity ID
        window.reloadApiController = async () => {
            const dmIdInput = document.getElementById('dm-id-input');
            const entityId = dmIdInput?.value?.trim();
            
            // If we're on the entity page and have a valid entity ID, load the individual entity form
            if (entityId && entityId !== '' && window.location.pathname.includes(`/${this.entityType}s.html`)) {
                console.log(`${this.title} page detected with ${this.entityType} ID:`, entityId);
                await this.loadEntityForm(entityId);
            } else {
                // Otherwise, use the original reloadApiController
                console.log('Using original reloadApiController');
                return await originalReloadApiController();
            }
        };
    }

    // Update client-side data representation
    updateClientData(entityId, fieldName, newValue) {
        if (!this.clientData[entityId]) {
            this.clientData[entityId] = {};
        }
        
        // Update the specific field
        this.setNestedValue(this.clientData[entityId], fieldName, newValue);
        
        // Update the display in the multiple items view
        this.updateItemDisplay(entityId, fieldName, newValue);
        
        console.log(`Updated client data for ${this.entityType} ${entityId}:`, fieldName, '=', newValue);
    }

    // Set nested value in object using dot notation
    setNestedValue(obj, path, value) {
        if (!path) return obj;
        
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
        return obj;
    }

    // Update item display in the multiple items view
    updateItemDisplay(entityId, fieldName, newValue) {
        const itemCard = document.querySelector(`[data-item-key="${entityId}"]`);
        if (!itemCard) return;

        // Update specific display elements based on field name
        switch (fieldName) {
            case 'name':
                const nameDisplay = itemCard.querySelector('.item-name');
                if (nameDisplay) nameDisplay.textContent = newValue;
                break;
            case 'type':
                const typeDisplay = itemCard.querySelector('.item-type');
                if (typeDisplay) {
                    typeDisplay.textContent = newValue;
                }
                break;
            case 'description':
                const descriptionDisplay = itemCard.querySelector('.item-description');
                if (descriptionDisplay) {
                    descriptionDisplay.textContent = newValue;
                }
                break;
            case 'image':
                const imageDisplay = itemCard.querySelector('.item-image');
                if (imageDisplay) {
                    const img = imageDisplay.querySelector('img');
                    if (img) {
                        img.src = `/images/${newValue}`;
                        img.alt = this.clientData[entityId]?.name || entityId;
                    }
                }
                break;
        }
    }
}
