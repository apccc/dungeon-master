/**
 * Automated Field Population Library
 * 
 * This module provides reusable logic for building and populating form fields
 * dynamically, reducing code duplication across different game pages.
 */

class FieldPopulator {
    constructor() {
        this.fieldTypes = {
            text: this.createTextField,
            number: this.createNumberField,
            checkbox: this.createCheckboxField,
            textarea: this.createTextareaField,
            select: this.createSelectField,
            section: this.createSection,
            abilitySection: this.createAbilitySection,
            table: this.createTable,
            spellSlots: this.createSpellSlots,
            coins: this.createCoinsSection,
            combatSection: this.createCombatSection,
            deathSaves: this.createDeathSaves,
            armorTraining: this.createArmorTraining,
            attunements: this.createAttunements
        };
    }

    /**
     * Builds a complete form based on a field configuration object
     */
    buildForm(fieldConfig, existingData = {}) {
        // Ensure existingData is always an object
        const data = existingData || {};
        
        let html = '';
        
        fieldConfig.forEach(section => {
            html += this.buildSection(section, data);
        });
        
        return html;
    }

    /**
     * Builds a form section with fields
     */
    buildSection(section, existingData = {}) {
        // Ensure existingData is always an object
        const data = existingData || {};
        const self = this; // Capture 'this' context
        
        if (section.type === 'abilitySection') {
            return self.fieldTypes.abilitySection.call(self, section, data);
        }
        
        if (section.type === 'table') {
            return self.fieldTypes.table.call(self, section, data);
        }
        
        if (section.type === 'spellSlots') {
            return self.fieldTypes.spellSlots.call(self, section, data);
        }
        


        if (section.type === 'combatSection') {
            return self.fieldTypes.combatSection.call(self, section, data);
        }

        if (section.type === 'deathSaves') {
            return self.fieldTypes.deathSaves.call(self, section, data);
        }

        if (section.type === 'armorTraining') {
            return self.fieldTypes.armorTraining.call(self, section, data);
        }

        if (section.type === 'attunements') {
            return self.fieldTypes.attunements.call(self, section, data);
        }

        // Special handling for abilities section
        if (section.title === 'Abilities & Skills') {
            let html = `
                <section class="player-section">
                    <h3>${section.title}</h3>
                    <div class="abilities-grid">
            `;
            
            section.fields.forEach(field => {
                html += self.fieldTypes.abilitySection.call(self, field, data);
            });
            
            html += `
                    </div>
                </section>
            `;
            
            return html;
        }

        let html = `
            <section class="player-section">
                <h3>${section.title}</h3>
                <div class="form-grid">
        `;
        
        section.fields.forEach(field => {
            let fieldData;
            if (field.type === 'coins' || field.type === 'attunements') {
                // Special field types that don't use dataPath
                fieldData = data;
            } else {
                fieldData = self.getNestedValue(data, field.dataPath);
            }
            html += self.fieldTypes[field.type].call(self, field, fieldData);
        });
        
        html += `
                </div>
            </section>
        `;
        
        return html;
    }

    /**
     * Creates a text input field
     */
    createTextField(field, value = '') {
        return `
            <div class="form-field">
                <label for="${field.id}">${field.label}</label>
                <input id="${field.id}" name="${field.name}" type="text" 
                       data-field="${field.dataPath}" value="${value || ''}" />
            </div>
        `;
    }

    /**
     * Creates a number input field
     */
    createNumberField(field, value = '') {
        return `
            <div class="form-field">
                <label for="${field.id}">${field.label}</label>
                <input id="${field.id}" name="${field.name}" type="number" 
                       data-field="${field.dataPath}" value="${value || ''}" />
            </div>
        `;
    }

    /**
     * Creates a checkbox field
     */
    createCheckboxField(field, value = false) {
        return `
            <div class="form-field checkbox-field">
                <label>
                    <input id="${field.id}" name="${field.name}" type="checkbox" 
                           data-field="${field.dataPath}" ${value ? 'checked' : ''} />
                    ${field.label}
                </label>
            </div>
        `;
    }

    /**
     * Creates a textarea field
     */
    createTextareaField(field, value = '') {
        return `
            <div class="form-field">
                <label for="${field.id}">${field.label}</label>
                <textarea id="${field.id}" name="${field.name}" 
                          data-field="${field.dataPath}">${value || ''}</textarea>
            </div>
        `;
    }

    /**
     * Creates a select dropdown field
     */
    createSelectField(field, value = '') {
        let options = '<option value="">—</option>';
        field.options.forEach(option => {
            const selected = option.value === value ? 'selected' : '';
            options += `<option value="${option.value}" ${selected}>${option.label}</option>`;
        });
        
        return `
            <div class="form-field">
                <label for="${field.id}">${field.label}</label>
                <select id="${field.id}" name="${field.name}" data-field="${field.dataPath}">
                    ${options}
                </select>
            </div>
        `;
    }

    /**
     * Creates an ability section with skills
     */
    createAbilitySection(section, playerData) {
        const abilityName = section.abilityName;
        const abilityKey = section.abilityKey;
        const skills = section.skills || [];
        
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

    /**
     * Creates a combat section with complex layout
     */
    createCombatSection(section, playerData) {
        const self = this;
        let html = `
            <section class="player-section">
                <div class="combat-main-grid">
        `;
        
        // Core Combat Stats
        html += `
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
        `;
        
        // Hit Points Section
        html += `
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
        `;
        
        // Hit Dice Section
        html += `
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
        `;
        
        // Death Saves
        html += `
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
        `;
        
        // Combat Stats Group
        html += `
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
        `;
        
        html += `
                </div>
            </section>
        `;
        
        return html;
    }

    /**
     * Creates death saves section
     */
    createDeathSaves(section, playerData) {
        const death = playerData?.death || {};
        return `
            <div class="death-saves">
                <div class="death-save-group">
                    <label>Death Saves - Success (3)</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" id="deathSuccess1" data-field="death.success1" ${death.success1 ? 'checked' : ''} /> 1</label>
                        <label><input type="checkbox" id="deathSuccess2" data-field="death.success2" ${death.success2 ? 'checked' : ''} /> 2</label>
                        <label><input type="checkbox" id="deathSuccess3" data-field="death.success3" ${death.success3 ? 'checked' : ''} /> 3</label>
                    </div>
                </div>
                <div class="death-save-group">
                    <label>Death Saves - Failures (3)</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" id="deathFail1" data-field="death.fail1" ${death.fail1 ? 'checked' : ''} /> 1</label>
                        <label><input type="checkbox" id="deathFail2" data-field="death.fail2" ${death.fail2 ? 'checked' : ''} /> 2</label>
                        <label><input type="checkbox" id="deathFail3" data-field="death.fail3" ${death.fail3 ? 'checked' : ''} /> 3</label>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Creates armor training section
     */
    createArmorTraining(section, playerData) {
        const proficiency = playerData?.proficiency?.armor || {};
        return `
            <div class="armor-training">
                <label>Armor Training</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" id="armorLight" data-field="proficiency.armor.light" ${proficiency.light ? 'checked' : ''} /> Light</label>
                    <label><input type="checkbox" id="armorMedium" data-field="proficiency.armor.medium" ${proficiency.medium ? 'checked' : ''} /> Medium</label>
                    <label><input type="checkbox" id="armorHeavy" data-field="proficiency.armor.heavy" ${proficiency.heavy ? 'checked' : ''} /> Heavy</label>
                    <label><input type="checkbox" id="armorShields" data-field="proficiency.armor.shields" ${proficiency.shields ? 'checked' : ''} /> Shields</label>
                </div>
            </div>
        `;
    }

    /**
     * Creates attunements section
     */
    createAttunements(section, playerData) {
        return `
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
        `;
    }

    /**
     * Creates a dynamic table
     */
    createTable(section, playerData) {
        const containerId = section.containerId;
        const rows = section.rows || 6;
        const fields = section.fields || [];
        
        let tableHtml = `
            <section class="player-section">
                <h3>${section.title}</h3>
                <div class="table-container">
                    <div class="table-header">
        `;
        
        fields.forEach(field => {
            tableHtml += `<div>${field.header}</div>`;
        });
        
        tableHtml += `
                    </div>
                    <div id="${containerId}"></div>
                </div>
            </section>
        `;
        
        // Store table configuration for later initialization
        if (!window.tableConfigs) window.tableConfigs = {};
        window.tableConfigs[containerId] = {
            rows: rows,
            fields: fields,
            dataPath: section.dataPath
        };
        
        return tableHtml;
    }

    /**
     * Creates spell slots section
     */
    createSpellSlots(section, playerData) {
        const self = this; // Capture 'this' context
        const slotsSpec = section.slotsSpec || {1:4, 2:3, 3:3, 4:3, 5:2, 6:2, 7:2, 8:1, 9:1};
        
        let html = `
            <section class="player-section">
                <h3>Spellcasting</h3>
                <div class="form-grid">
        `;
        
        // Add spellcasting ability fields
        if (section.spellcastingFields) {
            section.spellcastingFields.forEach(field => {
                const fieldData = self.getNestedValue(playerData, field.dataPath);
                html += self.fieldTypes[field.type].call(self, field, fieldData);
            });
        }
        
        html += `
                </div>
                <div id="spellSlots"></div>
            </section>
        `;
        
        // Store spell slots configuration
        if (!window.spellSlotsConfig) window.spellSlotsConfig = slotsSpec;
        
        return html;
    }

    /**
     * Creates coins section
     */
    createCoinsSection(section, playerData) {
        const coins = ['cp', 'sp', 'ep', 'gp', 'pp'];
        const coinsData = playerData?.coins || {};
        
        let html = `
            <div class="coins-section">
                <label>Coins</label>
                <div class="coins-grid">
        `;
        
        coins.forEach(coin => {
            const value = coinsData[coin] || '';
            html += `
                <div class="form-field">
                    <label for="${coin}">${coin.toUpperCase()}</label>
                    <input id="${coin}" name="${coin}" type="text" data-field="coins.${coin}" value="${value}" />
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * Gets a nested value from an object using dot notation
     */
    getNestedValue(obj, path) {
        if (!path) return null;
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    /**
     * Populates form fields with data
     */
    populateForm(data) {
        const self = this; // Capture 'this' context
        Object.entries(data).forEach(([path, value]) => {
            const field = document.querySelector(`[data-field="${path}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = Boolean(value);
                } else {
                    field.value = value || '';
                }
            }
        });
    }

    /**
     * Collects form data into a structured object
     */
    collectFormData() {
        const self = this; // Capture 'this' context
        const formData = {};
        
        document.querySelectorAll('[data-field]').forEach(field => {
            const path = field.dataset.field;
            let value;
            
            if (field.type === 'checkbox') {
                value = field.checked;
            } else {
                value = field.value;
            }
            
            self.setNestedValue(formData, path, value);
        });
        
        return formData;
    }

    /**
     * Sets a nested value in an object using dot notation
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        let current = obj;
        keys.forEach(key => {
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        });
        
        current[lastKey] = value;
    }

    /**
     * Initializes dynamic tables after form is built
     */
    initializeTables(playerData = {}) {
        const self = this; // Capture 'this' context
        const data = playerData || {};
        if (!window.tableConfigs) return;
        
        Object.entries(window.tableConfigs).forEach(([containerId, config]) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            for (let i = 0; i < config.rows; i++) {
                const row = document.createElement('div');
                row.className = 'table-row';
                
                const rowData = self.getNestedValue(data, `${config.dataPath}.${i}`) || {};
                
                let rowHtml = '';
                config.fields.forEach(field => {
                    const value = rowData[field.key] || '';
                    if (field.type === 'checkbox') {
                        rowHtml += `<input type="checkbox" data-field="${config.dataPath}.${i}.${field.key}" ${value ? 'checked' : ''} />`;
                    } else {
                        rowHtml += `<input type="text" placeholder="${field.placeholder || ''}" data-field="${config.dataPath}.${i}.${field.key}" value="${value}" />`;
                    }
                });
                
                row.innerHTML = rowHtml;
                container.appendChild(row);
            }
        });
    }

    /**
     * Initializes spell slots after form is built
     */
    initializeSpellSlots(playerData = {}) {
        const self = this; // Capture 'this' context
        const data = playerData || {};
        if (!window.spellSlotsConfig) return;
        
        const container = document.getElementById('spellSlots');
        if (!container) return;
        
        Object.entries(window.spellSlotsConfig).forEach(([level, checks]) => {
            const slotSection = document.createElement('div');
            slotSection.className = 'spell-slot-section';
            
            const existingData = data.spellSlots?.[level] || {};
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

    /**
     * Initializes attunements table
     */
    initializeAttunements(playerData = {}) {
        const data = playerData || {};
        const container = document.getElementById('attunementRows');
        if (!container) return;
        
        for (let i = 0; i < 3; i++) {
            const row = document.createElement('div');
            row.className = 'table-row';
            
            const attunement = data.attunements?.[i] || {};
            
            row.innerHTML = `
                <input type="text" placeholder="Item" data-field="attunements.${i}.item" value="${attunement.item || ''}" />
                <input type="text" placeholder="Notes" data-field="attunements.${i}.notes" value="${attunement.notes || ''}" />
            `;
            container.appendChild(row);
        }
    }

    /**
     * Gets the complete player form field configuration
     */
    getPlayerFormConfig() {
        return [
            {
                title: 'Basics',
                type: 'section',
                fields: [
                    { id: 'characterName', name: 'characterName', label: 'Character Name', type: 'text', dataPath: 'character.name' },
                    { id: 'background', name: 'background', label: 'Background', type: 'text', dataPath: 'character.background' },
                    { id: 'class', name: 'class', label: 'Class', type: 'text', dataPath: 'character.class' },
                    { id: 'subclass', name: 'subclass', label: 'Subclass', type: 'text', dataPath: 'character.subclass' },
                    { id: 'species', name: 'species', label: 'Species', type: 'text', dataPath: 'character.species' },
                    { id: 'level', name: 'level', label: 'Level', type: 'text', dataPath: 'progress.level' },
                    { id: 'xp', name: 'xp', label: 'XP', type: 'text', dataPath: 'progress.xp' },
                    { id: 'proficiencyBonus', name: 'proficiencyBonus', label: 'Proficiency Bonus', type: 'text', dataPath: 'proficiency.bonus' },
                    { id: 'size', name: 'size', label: 'Size', type: 'text', dataPath: 'combat.size' }
                ]
            },
            {
                type: 'combatSection'
            },
            {
                title: 'Abilities & Skills',
                type: 'section',
                fields: [
                    { type: 'abilitySection', abilityName: 'Strength', abilityKey: 'str', skills: ['athletics'] },
                    { type: 'abilitySection', abilityName: 'Dexterity', abilityKey: 'dex', skills: ['acrobatics', 'sleightOfHand', 'stealth'] },
                    { type: 'abilitySection', abilityName: 'Constitution', abilityKey: 'con', skills: [] },
                    { type: 'abilitySection', abilityName: 'Intelligence', abilityKey: 'int', skills: ['arcana', 'history', 'investigation', 'nature', 'religion'] },
                    { type: 'abilitySection', abilityName: 'Wisdom', abilityKey: 'wis', skills: ['animalHandling', 'insight', 'medicine', 'perception', 'survival'] },
                    { type: 'abilitySection', abilityName: 'Charisma', abilityKey: 'cha', skills: ['deception', 'intimidation', 'performance', 'persuasion'] }
                ]
            },
            {
                title: 'Equipment Training & Proficiencies',
                type: 'section',
                fields: [
                    { type: 'armorTraining' },
                    { id: 'weaponsText', name: 'weaponsText', label: 'Weapons', type: 'textarea', dataPath: 'proficiency.weapons' },
                    { id: 'toolsText', name: 'toolsText', label: 'Tools', type: 'textarea', dataPath: 'proficiency.tools' }
                ]
            },
            {
                title: 'Weapons & Damage Cantrips',
                type: 'table',
                containerId: 'weaponsCantripsRows',
                rows: 6,
                dataPath: 'weapons',
                fields: [
                    { key: 'name', header: 'Name', placeholder: 'Name' },
                    { key: 'bonus', header: 'Atk Bonus / DC', placeholder: 'Atk Bonus / DC' },
                    { key: 'damage', header: 'Damage & Type', placeholder: 'Damage & Type' },
                    { key: 'notes', header: 'Notes', placeholder: 'Notes' }
                ]
            },
            {
                title: 'Features & Traits',
                type: 'section',
                fields: [
                    { id: 'classFeatures', name: 'classFeatures', label: 'Class Features', type: 'textarea', dataPath: 'features.class' },
                    { id: 'speciesTraits', name: 'speciesTraits', label: 'Species Traits', type: 'textarea', dataPath: 'features.species' },
                    { id: 'feats', name: 'feats', label: 'Feats', type: 'textarea', dataPath: 'features.feats' }
                ]
            },
            {
                type: 'spellSlots',
                spellcastingFields: [
                    { id: 'spellAbility', name: 'spellAbility', label: 'Spellcasting Ability', type: 'text', dataPath: 'spellcasting.ability' },
                    { id: 'spellMod', name: 'spellMod', label: 'Spellcasting Modifier', type: 'text', dataPath: 'spellcasting.modifier' },
                    { id: 'spellSaveDC', name: 'spellSaveDC', label: 'Spell Save DC', type: 'text', dataPath: 'spellcasting.saveDC' },
                    { id: 'spellAtkBonus', name: 'spellAtkBonus', label: 'Spell Attack Bonus', type: 'text', dataPath: 'spellcasting.attackBonus' }
                ]
            },
            {
                title: 'Cantrips & Prepared Spells',
                type: 'table',
                containerId: 'spellsTableRows',
                rows: 30,
                dataPath: 'spells',
                fields: [
                    { key: 'level', header: 'Level', placeholder: 'Lvl' },
                    { key: 'name', header: 'Name', placeholder: 'Name' },
                    { key: 'castTime', header: 'Casting Time', placeholder: 'Casting Time' },
                    { key: 'range', header: 'Range', placeholder: 'Range' },
                    { key: 'concentration', header: 'Conc.', type: 'checkbox' },
                    { key: 'ritual', header: 'Ritual', type: 'checkbox' },
                    { key: 'material', header: 'Req. Mat.', type: 'checkbox' },
                    { key: 'notes', header: 'Notes', placeholder: 'Notes' }
                ]
            },
            {
                title: 'Personal',
                type: 'section',
                fields: [
                    { id: 'appearance', name: 'appearance', label: 'Appearance', type: 'textarea', dataPath: 'bio.appearance' },
                    { id: 'backstory', name: 'backstory', label: 'Backstory & Personality', type: 'textarea', dataPath: 'bio.backstory' },
                    { 
                        id: 'alignment', 
                        name: 'alignment', 
                        label: 'Alignment', 
                        type: 'select', 
                        dataPath: 'character.alignment',
                        options: [
                            { value: 'Lawful Good', label: 'Lawful Good' },
                            { value: 'Neutral Good', label: 'Neutral Good' },
                            { value: 'Chaotic Good', label: 'Chaotic Good' },
                            { value: 'Lawful Neutral', label: 'Lawful Neutral' },
                            { value: 'True Neutral', label: 'True Neutral' },
                            { value: 'Chaotic Neutral', label: 'Chaotic Neutral' },
                            { value: 'Lawful Evil', label: 'Lawful Evil' },
                            { value: 'Neutral Evil', label: 'Neutral Evil' },
                            { value: 'Chaotic Evil', label: 'Chaotic Evil' }
                        ]
                    },
                    { id: 'languages', name: 'languages', label: 'Languages', type: 'textarea', dataPath: 'bio.languages' }
                ]
            },
            {
                title: 'Equipment & Coins',
                type: 'section',
                fields: [
                    { id: 'equipment', name: 'equipment', label: 'Equipment', type: 'textarea', dataPath: 'gear.equipment' },
                    { type: 'attunements' },
                    { type: 'coins' }
                ]
            }
        ];
    }
}

// Create global instance
window.fieldPopulator = new FieldPopulator();

// Bind methods to ensure proper 'this' context
const methodsToBind = ['buildForm', 'buildSection', 'createTextField', 'createNumberField', 
                      'createCheckboxField', 'createTextareaField', 'createSelectField', 
                      'createAbilitySection', 'createTable', 'createSpellSlots', 'createCoinsSection',
                      'createCombatSection', 'createDeathSaves', 'createArmorTraining', 'createAttunements',
                      'getNestedValue', 'populateForm', 'collectFormData', 'setNestedValue',
                      'initializeTables', 'initializeSpellSlots', 'initializeAttunements', 'getPlayerFormConfig'];

methodsToBind.forEach(method => {
    window.fieldPopulator[method] = window.fieldPopulator[method].bind(window.fieldPopulator);
});
