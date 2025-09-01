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
        populatePlayerForm(playerData.data);
    } else {
        console.log('No existing data to populate');
    }
    
    // Check if editing should be disabled (DM mode without valid DM ID)
    checkAndDisablePlayerEditing();
    
    // Attach form event listeners
    attachPlayerFormEventListeners(apiPath);
    
    // Initialize dynamic tables
    console.log('Initializing dynamic tables...');
    initializeWeaponsTable(playerData?.data || {});
    initializeSpellSlots(playerData?.data || {});
    initializeSpellsTable(playerData?.data || {});
    initializeAttunementsTable(playerData?.data || {});
    console.log('Dynamic tables initialized');
}

function buildPlayerForm(playerData, title) {
    return `
        <div id="player-container">
            <h2 id="player-title">${title}</h2>
            <form id="player-form">
                <!-- BASICS -->
                <section class="player-section">
                    <div class="form-grid">
                        <div class="form-field">
                            <label for="characterName">Character Name</label>
                            <input id="characterName" name="characterName" type="text" data-field="character.name" value="${playerData.character?.name || ''}" />
                        </div>
                        <div class="form-field">
                            <label for="background">Background</label>
                            <input id="background" name="background" type="text" data-field="character.background" value="${playerData.character?.background || ''}" />
                        </div>
                        <div class="form-field">
                            <label for="class">Class</label>
                            <input id="class" name="class" type="text" data-field="character.class" value="${playerData.character?.class || ''}" />
                        </div>
                        <div class="form-field">
                            <label for="subclass">Subclass</label>
                            <input id="subclass" name="subclass" type="text" data-field="character.subclass" value="${playerData.character?.subclass || ''}" />
                        </div>
                        <div class="form-field">
                            <label for="species">Species</label>
                            <input id="species" name="species" type="text" data-field="character.species" value="${playerData.character?.species || ''}" />
                        </div>
                        <div class="form-field">
                            <label for="level">Level</label>
                            <input id="level" name="level" type="text" data-field="progress.level" value="${playerData.progress?.level || ''}" />
                        </div>
                        <div class="form-field">
                            <label for="xp">XP</label>
                            <input id="xp" name="xp" type="text" data-field="progress.xp" value="${playerData.progress?.xp || ''}" />
                        </div>
                        <div class="form-field">
                            <label for="proficiencyBonus">Proficiency Bonus</label>
                            <input id="proficiencyBonus" name="proficiencyBonus" type="text" data-field="proficiency.bonus" value="${playerData.proficiency?.bonus || ''}" />
                        </div>
                        <div class="form-field">
                            <label for="size">Size</label>
                            <input id="size" name="size" type="text" data-field="combat.size" value="${playerData.combat?.size || ''}" />
                        </div>
                    </div>
                </section>

                <!-- COMBAT & SURVIVABILITY -->
                <section class="player-section">
                    <div class="combat-main-grid">
                        <!-- Core Combat Stats -->
                        <div class="combat-core-group">
                            <div class="form-field">
                                <label for="armorClass">Armor Class</label>
                                <input id="armorClass" name="armorClass" type="text" data-field="combat.ac" value="${playerData.combat?.ac || ''}" />
                            </div>
                            <div class="form-field checkbox-field">
                                <label>
                                    <input id="shield" name="shield" type="checkbox" data-field="combat.shield" ${playerData.combat?.shield ? 'checked' : ''} />
                                    Shield
                                </label>
                            </div>
                        </div>
                        
                        <!-- Hit Points Section -->
                        <div class="hit-points-section">
                            <h4>Hit Points</h4>
                            <div class="hp-grid">
                                <div class="form-field">
                                    <label for="hpCurrent">Current</label>
                                    <input id="hpCurrent" name="hpCurrent" type="text" data-field="hp.current" value="${playerData.hp?.current || ''}" />
                                </div>
                                <div class="form-field">
                                    <label for="hpTemp">Temporary</label>
                                    <input id="hpTemp" name="hpTemp" type="text" data-field="hp.temp" value="${playerData.hp?.temp || ''}" />
                                </div>
                                <div class="form-field">
                                    <label for="hpMax">Maximum</label>
                                    <input id="hpMax" name="hpMax" type="text" data-field="hp.max" value="${playerData.hp?.max || ''}" />
                                </div>
                            </div>
                        </div>
                        
                        <!-- Hit Dice Section -->
                        <div class="hit-dice-section">
                            <h4>Hit Dice</h4>
                            <div class="hit-dice-grid">
                                <div class="form-field">
                                    <label for="hitDiceSpent">Spent</label>
                                    <input id="hitDiceSpent" name="hitDiceSpent" type="text" data-field="hitDice.spent" value="${playerData.hitDice?.spent || ''}" />
                                </div>
                                <div class="form-field">
                                    <label for="hitDiceMax">Maximum</label>
                                    <input id="hitDiceMax" name="hitDiceMax" type="text" data-field="hitDice.max" value="${playerData.hitDice?.max || ''}" />
                                </div>
                                <div class="form-field">
                                    <label for="hitDiceType">HP Die</label>
                                    <input id="hitDiceType" name="hitDiceType" type="text" data-field="hitDice.type" value="${playerData.hitDice?.type || ''}" />
                                </div>
                            </div>
                        </div>
                        
                        <!-- Death Saves -->
                        <div class="death-saves">
                            <div class="death-save-group">
                                <label>Death Saves - Success (3)</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="deathSuccess1" data-field="death.success1" ${playerData.death?.success1 ? 'checked' : ''} /> 1</label>
                                    <label><input type="checkbox" id="deathSuccess2" data-field="death.success2" ${playerData.death?.success2 ? 'checked' : ''} /> 2</label>
                                    <label><input type="checkbox" id="deathSuccess3" data-field="death.success3" ${playerData.death?.success3 ? 'checked' : ''} /> 3</label>
                                </div>
                            </div>
                            <div class="death-save-group">
                                <label>Death Saves - Failures (3)</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="deathFail1" data-field="death.fail1" ${playerData.death?.fail1 ? 'checked' : ''} /> 1</label>
                                    <label><input type="checkbox" id="deathFail2" data-field="death.fail2" ${playerData.death?.fail2 ? 'checked' : ''} /> 2</label>
                                    <label><input type="checkbox" id="deathFail3" data-field="death.fail3" ${playerData.death?.fail3 ? 'checked' : ''} /> 3</label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Combat Stats Group -->
                        <div class="combat-stats-group">
                            <div class="form-field small-field">
                                <label for="initiative">Initiative</label>
                                <input id="initiative" name="initiative" type="text" data-field="combat.initiative" value="${playerData.combat?.initiative || ''}" />
                            </div>
                            <div class="form-field small-field">
                                <label for="speed">Speed</label>
                                <input id="speed" name="speed" type="text" data-field="combat.speed" value="${playerData.combat?.speed || ''}" />
                            </div>
                            <div class="form-field small-field">
                                <label for="passivePerception">Passive Perception</label>
                                <input id="passivePerception" name="passivePerception" type="text" data-field="skills.passivePerception" value="${playerData.skills?.passivePerception || ''}" />
                            </div>
                            <div class="form-field small-field">
                                <label for="passiveInvestigation">Passive Investigation</label>
                                <input id="passiveInvestigation" name="passiveInvestigation" type="text" data-field="skills.passiveInvestigation" value="${playerData.skills?.passiveInvestigation || ''}" />
                            </div>
                        </div>
                    </div>
                </section>



                <!-- ABILITIES & SKILLS -->
                <section class="player-section">
                    <div class="abilities-grid">
                        ${buildAbilitySection('Strength', 'str', ['athletics'], playerData)}
                        ${buildAbilitySection('Dexterity', 'dex', ['acrobatics', 'sleightOfHand', 'stealth'], playerData)}
                        ${buildAbilitySection('Constitution', 'con', [], playerData)}
                        ${buildAbilitySection('Intelligence', 'int', ['arcana', 'history', 'investigation', 'nature', 'religion'], playerData)}
                        ${buildAbilitySection('Wisdom', 'wis', ['animalHandling', 'insight', 'medicine', 'perception', 'survival'], playerData)}
                        ${buildAbilitySection('Charisma', 'cha', ['deception', 'intimidation', 'performance', 'persuasion'], playerData)}
                    </div>
                </section>

                <!-- TRAINING & PROFICIENCIES -->
                <section class="player-section">
                    <h3>Equipment Training & Proficiencies</h3>
                    <div class="form-grid">
                        <div class="armor-training">
                            <label>Armor Training</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" id="armorLight" data-field="proficiency.armor.light" ${playerData.proficiency?.armor?.light ? 'checked' : ''} /> Light</label>
                                <label><input type="checkbox" id="armorMedium" data-field="proficiency.armor.medium" ${playerData.proficiency?.armor?.medium ? 'checked' : ''} /> Medium</label>
                                <label><input type="checkbox" id="armorHeavy" data-field="proficiency.armor.heavy" ${playerData.proficiency?.armor?.heavy ? 'checked' : ''} /> Heavy</label>
                                <label><input type="checkbox" id="armorShields" data-field="proficiency.armor.shields" ${playerData.proficiency?.armor?.shields ? 'checked' : ''} /> Shields</label>
                            </div>
                        </div>
                        <div class="form-field">
                            <label for="weaponsText">Weapons</label>
                            <textarea id="weaponsText" name="weaponsText" data-field="proficiency.weapons">${playerData.proficiency?.weapons || ''}</textarea>
                        </div>
                        <div class="form-field">
                            <label for="toolsText">Tools</label>
                            <textarea id="toolsText" name="toolsText" data-field="proficiency.tools">${playerData.proficiency?.tools || ''}</textarea>
                        </div>
                    </div>
                </section>

                <!-- WEAPONS & CANTRIPS -->
                <section class="player-section">
                    <h3>Weapons & Damage Cantrips</h3>
                    <div class="table-container">
                        <div class="table-header">
                            <div>Name</div>
                            <div>Atk Bonus / DC</div>
                            <div>Damage & Type</div>
                            <div>Notes</div>
                        </div>
                        <div id="weaponsCantripsRows"></div>
                    </div>
                </section>

                <!-- FEATURES & TRAITS -->
                <section class="player-section">
                    <div class="form-grid">
                        <div class="form-field">
                            <label for="classFeatures">Class Features</label>
                            <textarea id="classFeatures" name="classFeatures" data-field="features.class">${playerData.features?.class || ''}</textarea>
                        </div>
                        <div class="form-field">
                            <label for="speciesTraits">Species Traits</label>
                            <textarea id="speciesTraits" name="speciesTraits" data-field="features.species">${playerData.features?.species || ''}</textarea>
                        </div>
                        <div class="form-field">
                            <label for="feats">Feats</label>
                            <textarea id="feats" name="feats" data-field="features.feats">${playerData.features?.feats || ''}</textarea>
                        </div>
                    </div>
                </section>

                <!-- SPELLCASTING -->
                <section class="player-section">
                    <h3>Spellcasting</h3>
                    <div class="form-grid">
                        <div class="form-field">
                            <label for="spellAbility">Spellcasting Ability</label>
                            <input id="spellAbility" name="spellAbility" type="text" data-field="spellcasting.ability" value="${playerData.spellcasting?.ability || ''}" />
                        </div>
                        <div class="form-field">
                            <label for="spellMod">Spellcasting Modifier</label>
                            <input id="spellMod" name="spellMod" type="text" data-field="spellcasting.modifier" value="${playerData.spellcasting?.modifier || ''}" />
                        </div>
                        <div class="form-field">
                            <label for="spellSaveDC">Spell Save DC</label>
                            <input id="spellSaveDC" name="spellSaveDC" type="text" data-field="spellcasting.saveDC" value="${playerData.spellcasting?.saveDC || ''}" />
                        </div>
                        <div class="form-field">
                            <label for="spellAtkBonus">Spell Attack Bonus</label>
                            <input id="spellAtkBonus" name="spellAtkBonus" type="text" data-field="spellcasting.attackBonus" value="${playerData.spellcasting?.attackBonus || ''}" />
                        </div>
                    </div>
                    
                    <div id="spellSlots"></div>
                </section>

                <!-- SPELLS TABLE -->
                <section class="player-section">
                    <h3>Cantrips & Prepared Spells</h3>
                    <div class="table-container spells-table">
                        <div class="table-header">
                            <div>Level</div>
                            <div>Name</div>
                            <div>Casting Time</div>
                            <div>Range</div>
                            <div>Conc.</div>
                            <div>Ritual</div>
                            <div>Req. Mat.</div>
                            <div>Notes</div>
                        </div>
                        <div id="spellsTableRows"></div>
                    </div>
                </section>

                <!-- PERSONAL -->
                <section class="player-section">
                    <div class="form-grid">
                        <div class="form-field">
                            <label for="appearance">Appearance</label>
                            <textarea id="appearance" name="appearance" data-field="bio.appearance">${playerData.bio?.appearance || ''}</textarea>
                        </div>
                        <div class="form-field">
                            <label for="backstory">Backstory & Personality</label>
                            <textarea id="backstory" name="backstory" data-field="bio.backstory">${playerData.bio?.backstory || ''}</textarea>
                        </div>
                        <div class="form-field">
                            <label for="alignment">Alignment</label>
                            <select id="alignment" name="alignment" data-field="character.alignment">
                                <option value="">—</option>
                                <option value="Lawful Good" ${playerData.character?.alignment === 'Lawful Good' ? 'selected' : ''}>Lawful Good</option>
                                <option value="Neutral Good" ${playerData.character?.alignment === 'Neutral Good' ? 'selected' : ''}>Neutral Good</option>
                                <option value="Chaotic Good" ${playerData.character?.alignment === 'Chaotic Good' ? 'selected' : ''}>Chaotic Good</option>
                                <option value="Lawful Neutral" ${playerData.character?.alignment === 'Lawful Neutral' ? 'selected' : ''}>Lawful Neutral</option>
                                <option value="True Neutral" ${playerData.character?.alignment === 'True Neutral' ? 'selected' : ''}>True Neutral</option>
                                <option value="Chaotic Neutral" ${playerData.character?.alignment === 'Chaotic Neutral' ? 'selected' : ''}>Chaotic Neutral</option>
                                <option value="Lawful Evil" ${playerData.character?.alignment === 'Lawful Evil' ? 'selected' : ''}>Lawful Evil</option>
                                <option value="Neutral Evil" ${playerData.character?.alignment === 'Neutral Evil' ? 'selected' : ''}>Neutral Evil</option>
                                <option value="Chaotic Evil" ${playerData.character?.alignment === 'Chaotic Evil' ? 'selected' : ''}>Chaotic Evil</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label for="languages">Languages</label>
                            <textarea id="languages" name="languages" data-field="bio.languages">${playerData.bio?.languages || ''}</textarea>
                        </div>
                    </div>
                </section>

                <!-- EQUIPMENT & COINS -->
                <section class="player-section">
                    <div class="form-grid">
                        <div class="form-field">
                            <label for="equipment">Equipment</label>
                            <textarea id="equipment" name="equipment" data-field="gear.equipment">${playerData.gear?.equipment || ''}</textarea>
                        </div>
                        <div class="attunements">
                            <label>Magic Item Attunement (3)</label>
                            <div class="table-container attunements-table">
                                <div class="table-header">
                                    <div>Item</div>
                                    <div>Notes</div>
                                </div>
                                <div id="attunementRows"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="coins-section">
                        <label>Coins</label>
                        <div class="coins-grid">
                            <div class="form-field">
                                <label for="cp">CP</label>
                                <input id="cp" name="cp" type="text" data-field="coins.cp" value="${playerData.coins?.cp || ''}" />
                            </div>
                            <div class="form-field">
                                <label for="sp">SP</label>
                                <input id="sp" name="sp" type="text" data-field="coins.sp" value="${playerData.coins?.sp || ''}" />
                            </div>
                            <div class="form-field">
                                <label for="ep">EP</label>
                                <input id="ep" name="ep" type="text" data-field="coins.ep" value="${playerData.coins?.ep || ''}" />
                            </div>
                            <div class="form-field">
                                <label for="gp">GP</label>
                                <input id="gp" name="gp" type="text" data-field="coins.gp" value="${playerData.coins?.gp || ''}" />
                            </div>
                            <div class="form-field">
                                <label for="pp">PP</label>
                                <input id="pp" name="pp" type="text" data-field="coins.pp" value="${playerData.coins?.pp || ''}" />
                            </div>
                        </div>
                    </div>
                </section>

                <div class="form-actions">
                    <button type="submit">Save Character</button>
                </div>
            </form>
        </div>
    `;
}

function buildAbilitySection(abilityName, abilityKey, skills, playerData) {
    const ability = playerData.abilities?.[abilityKey] || {};
    const saves = playerData.saves?.[abilityKey] || {};
    
    let skillsHtml = '';
    skills.forEach(skill => {
        const skillData = playerData.skills?.[skill] || {};
        skillsHtml += `
            <div class="skill-row">
                <div class="skill-input">
                    <label for="${skill}">${skill.charAt(0).toUpperCase() + skill.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                    <input id="${skill}" type="text" data-field="skills.${skill}.value" value="${skillData.value || ''}" />
                </div>
                <label class="skill-checkbox">
                    <input type="checkbox" data-field="skills.${skill}.prof" ${skillData.prof ? 'checked' : ''} />
                    <span>proficient</span>
                </label>
            </div>
        `;
    });

    return `
        <div class="ability-section">
            <h4>${abilityName}</h4>
            <div class="ability-scores">
                <div class="form-field">
                    <label for="${abilityKey}Mod">Modifier</label>
                    <input id="${abilityKey}Mod" type="text" data-field="abilities.${abilityKey}.mod" value="${ability.mod || ''}" />
                </div>
                <div class="form-field">
                    <label for="${abilityKey}Score">Score</label>
                    <input id="${abilityKey}Score" type="text" data-field="abilities.${abilityKey}.score" value="${ability.score || ''}" />
                </div>
            </div>
            <div class="skill-row">
                <div class="skill-input">
                    <label for="${abilityKey}Save">Saving Throw</label>
                    <input id="${abilityKey}Save" type="text" data-field="saves.${abilityKey}.value" value="${saves.value || ''}" />
                </div>
                <label class="skill-checkbox">
                    <input type="checkbox" data-field="saves.${abilityKey}.prof" ${saves.prof ? 'checked' : ''} />
                    <span>proficient</span>
                </label>
            </div>
            ${skillsHtml}
        </div>
    `;
}

function initializeWeaponsTable(playerData = {}) {
    const container = document.getElementById('weaponsCantripsRows');
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'table-row';
        
        // Get existing weapon data
        const weapon = playerData.weapons?.[i] || {};
        
        row.innerHTML = `
            <input type="text" placeholder="Name" data-field="weapons.${i}.name" value="${weapon.name || ''}" />
            <input type="text" placeholder="Atk Bonus / DC" data-field="weapons.${i}.bonus" value="${weapon.bonus || ''}" />
            <input type="text" placeholder="Damage & Type" data-field="weapons.${i}.damage" value="${weapon.damage || ''}" />
            <input type="text" placeholder="Notes" data-field="weapons.${i}.notes" value="${weapon.notes || ''}" />
        `;
        container.appendChild(row);
    }
}

function initializeSpellSlots(playerData = {}) {
    const container = document.getElementById('spellSlots');
    const slotsSpec = {1:4, 2:3, 3:3, 4:3, 5:2, 6:2, 7:2, 8:1, 9:1};
    
    Object.entries(slotsSpec).forEach(([level, checks]) => {
        const slotSection = document.createElement('div');
        slotSection.className = 'spell-slot-section';
        
        // Get existing data for this level
        const existingData = playerData.spellSlots?.[level] || {};
        const totalValue = existingData.total || '';
        
        slotSection.innerHTML = `
            <h4>Level ${level} Slots</h4>
            <div class="spell-slot-controls">
                <div class="form-field">
                    <label for="slots_${level}_total">Total</label>
                    <input id="slots_${level}_total" type="text" data-field="spellSlots.${level}.total" value="${totalValue}" />
                </div>
                <div class="spell-slot-checkboxes">
                    <label>Expended:</label>
                    <div class="checkbox-group">
                        ${Array.from({length: checks}, (_, i) => {
                            const slotIndex = i + 1;
                            const isChecked = existingData.spent?.[slotIndex] ? 'checked' : '';
                            return `<label><input type="checkbox" data-field="spellSlots.${level}.spent.${slotIndex}" ${isChecked} /> ${slotIndex}</label>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(slotSection);
    });
}

function initializeSpellsTable(playerData = {}) {
    const container = document.getElementById('spellsTableRows');
    if (!container) {
        console.error('Spells table container not found');
        return;
    }
    
    console.log('Initializing spells table with data:', playerData.spells);
    
    for (let i = 0; i < 30; i++) {
        const row = document.createElement('div');
        row.className = 'table-row';
        
        // Get existing spell data
        const spell = playerData.spells?.[i] || {};
        
        row.innerHTML = `
            <input type="text" placeholder="Lvl" data-field="spells.${i}.level" value="${spell.level || ''}" />
            <input type="text" placeholder="Name" data-field="spells.${i}.name" value="${spell.name || ''}" />
            <input type="text" placeholder="Casting Time" data-field="spells.${i}.castTime" value="${spell.castTime || ''}" />
            <input type="text" placeholder="Range" data-field="spells.${i}.range" value="${spell.range || ''}" />
            <input type="checkbox" data-field="spells.${i}.concentration" ${spell.concentration ? 'checked' : ''} />
            <input type="checkbox" data-field="spells.${i}.ritual" ${spell.ritual ? 'checked' : ''} />
            <input type="checkbox" data-field="spells.${i}.material" ${spell.material ? 'checked' : ''} />
            <input type="text" placeholder="Notes" data-field="spells.${i}.notes" value="${spell.notes || ''}" />
        `;
        container.appendChild(row);
    }
    
    console.log(`Created ${container.children.length} spell rows`);
}

function initializeAttunementsTable(playerData = {}) {
    const container = document.getElementById('attunementRows');
    for (let i = 0; i < 3; i++) {
        const row = document.createElement('div');
        row.className = 'table-row';
        
        // Get existing attunement data
        const attunement = playerData.attunements?.[i] || {};
        
        row.innerHTML = `
            <input type="text" placeholder="Item" data-field="attunements.${i}.item" value="${attunement.item || ''}" />
            <input type="text" placeholder="Notes" data-field="attunements.${i}.notes" value="${attunement.notes || ''}" />
        `;
        container.appendChild(row);
    }
}

function populatePlayerForm(playerData) {
    // This function is no longer needed as data is populated during initialization
    // Keeping for backward compatibility
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
    const formData = {};
    
    // Collect all form inputs
    const inputs = document.querySelectorAll('#player-form input, #player-form textarea, #player-form select');
    inputs.forEach(input => {
        if (input.dataset.field) {
            const fieldPath = input.dataset.field.split('.');
            let current = formData;
            
            // Navigate to the nested location
            for (let i = 0; i < fieldPath.length - 1; i++) {
                if (!current[fieldPath[i]]) {
                    current[fieldPath[i]] = {};
                }
                current = current[fieldPath[i]];
            }
            
            // Set the value
            if (input.type === 'checkbox') {
                current[fieldPath[fieldPath.length - 1]] = input.checked;
            } else {
                current[fieldPath[fieldPath.length - 1]] = input.value;
            }
        }
    });
    
    return formData;
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
