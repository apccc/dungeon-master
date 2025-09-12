document.addEventListener('DOMContentLoaded', () => {
    loadApiController('game/monsters', 'middle', 'Game Monsters', initializeMultipleForm);
    
    // Override the reloadApiController behavior for monsters page
    setupMonsterPageReloadOverride();
});

// Function to load individual monster form when a monster is selected
async function loadMonsterForm(monsterId) {
    if (!monsterId) {
        console.warn('No monster ID provided to loadMonsterForm');
        return;
    }
    
    console.log('Loading monster form for ID:', monsterId);
    
    try {
        // Load the specific monster data using the same API path but with dm_data_id
        const monsterData = await getFromApi('game/monsters', monsterId);
        console.log('Loaded monster data:', monsterData);
        console.log('Monster data type:', typeof monsterData);
        console.log('Monster data keys:', monsterData ? Object.keys(monsterData) : 'null/undefined');
        
        // Check if we got valid data
        if (!monsterData) {
            throw new Error('No monster data returned from API');
        }
        
        // Wait for monsterFieldPopulator to be available before initializing
        const waitForMonsterFieldPopulator = (callback) => {
            if (window.monsterFieldPopulator && typeof window.monsterFieldPopulator.populateForm === 'function') {
                console.log('monsterFieldPopulator is ready for monster form');
                callback();
            } else {
                console.log('Waiting for monsterFieldPopulator to load for monster form...');
                setTimeout(() => waitForMonsterFieldPopulator(callback), 100);
            }
        };
        
        waitForMonsterFieldPopulator(() => {
            // Initialize the monster form with the loaded data
            initializeMonsterForm('middle', monsterData, 'Edit Monster', 'game/monsters');
        });
        
    } catch (error) {
        console.error('Failed to load monster form:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        alert(`Failed to load monster data: ${error.message}. Please try again.`);
    }
}

// Function to load the monsters list (go back from individual monster form)
async function loadMonstersList() {
    try {
        // Clear the dm-id-input to load all monsters
        const dmIdInput = document.getElementById('dm-id-input');
        if (dmIdInput) {
            dmIdInput.value = '';
        }
        
        // Load the monsters list
        await loadApiController('game/monsters', 'middle', 'Game Monsters', initializeMultipleForm);
        
        // Re-setup the reload override for future Load button clicks
        setupMonsterPageReloadOverride();
        
    } catch (error) {
        console.error('Failed to load monsters list:', error);
        alert('Failed to load monsters list. Please try again.');
    }
}

// Setup override for reloadApiController on monsters page
function setupMonsterPageReloadOverride() {
    // Store the original reloadApiController function
    const originalReloadApiController = window.reloadApiController;
    
    // Override reloadApiController to check if we're on monsters page with a monster ID
    window.reloadApiController = async function() {
        const dmIdInput = document.getElementById('dm-id-input');
        const monsterId = dmIdInput?.value?.trim();
        
        // If we're on the monsters page and have a valid monster ID, load the individual monster form
        if (monsterId && monsterId !== '' && window.location.pathname.includes('/monsters.html')) {
            console.log('Monsters page detected with monster ID:', monsterId);
            await loadMonsterForm(monsterId);
        } else {
            // Otherwise, use the original reloadApiController
            console.log('Using original reloadApiController');
            return await originalReloadApiController();
        }
    };
}
