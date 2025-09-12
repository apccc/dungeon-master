// Monster-specific entity manager
class MonsterManager extends EntityManager {
    constructor() {
        super('monster', 'game/monsters', 'Game Monsters', window.monsterFieldPopulator);
    }

    // Initialize monster form with monster-specific field populator
    initializeEntityForm(containerId, monsterData, title, apiPath) {
        initializeMonsterForm(containerId, monsterData, title, apiPath);
    }
}

// Initialize monster manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.monsterManager = new MonsterManager();
    window.monsterManager.initialize();
});

// Legacy function names for backward compatibility
async function loadMonsterForm(monsterId) {
    if (window.monsterManager) {
        return await window.monsterManager.loadEntityForm(monsterId);
    }
    console.warn('Monster manager not initialized');
}

// Legacy function names for backward compatibility
async function loadMonstersList() {
    if (window.monsterManager) {
        return await window.monsterManager.loadEntitiesList();
    }
    console.warn('Monster manager not initialized');
}

// Legacy function for backward compatibility
function setupMonsterPageReloadOverride() {
    if (window.monsterManager) {
        return window.monsterManager.setupPageReloadOverride();
    }
    console.warn('Monster manager not initialized');
}
