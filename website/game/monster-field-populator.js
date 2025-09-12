/**
 * Monster Field Population Library
 * 
 * This module provides reusable logic for building and populating monster form fields
 * dynamically, specifically designed for monster management in the D&D game.
 */

console.log('MonsterFieldPopulator script starting to load...');

class MonsterFieldPopulator {
    constructor() {
        this.fieldTypes = {
            text: this.createTextField,
            number: this.createNumberField,
            checkbox: this.createCheckboxField,
            textarea: this.createTextareaField,
            select: this.createSelectField,
            section: this.createSection
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
        
        if (section.type === 'section') {
            let sectionHtml = `<div class="form-section">
                <h3>${section.title}</h3>
                <div class="form-fields">`;
            
            if (section.fields) {
                section.fields.forEach(field => {
                    sectionHtml += this.buildField(field, data);
                });
            }
            
            sectionHtml += '</div></div>';
            return sectionHtml;
        }
        
        return this.buildField(section, data);
    }

    /**
     * Builds an individual field
     */
    buildField(field, existingData = {}) {
        const data = existingData || {};
        const fieldType = field.type || 'text';
        const fieldBuilder = this.fieldTypes[fieldType];
        
        if (fieldBuilder) {
            return fieldBuilder.call(this, field, data);
        }
        
        console.warn(`Unknown field type: ${fieldType}`);
        return '';
    }

    /**
     * Creates a text input field
     */
    createTextField(field, data) {
        const value = this.getNestedValue(data, field.dataPath) || '';
        return `
            <div class="form-field">
                <label for="${field.id}">${field.label}</label>
                <input type="text" id="${field.id}" name="${field.name}" value="${this.escapeHtml(value)}" />
            </div>
        `;
    }

    /**
     * Creates a number input field
     */
    createNumberField(field, data) {
        const value = this.getNestedValue(data, field.dataPath) || '';
        return `
            <div class="form-field">
                <label for="${field.id}">${field.label}</label>
                <input type="number" id="${field.id}" name="${field.name}" value="${this.escapeHtml(value)}" />
            </div>
        `;
    }

    /**
     * Creates a checkbox field
     */
    createCheckboxField(field, data) {
        const value = this.getNestedValue(data, field.dataPath);
        const checked = value ? 'checked' : '';
        return `
            <div class="form-field">
                <label>
                    <input type="checkbox" id="${field.id}" name="${field.name}" ${checked} />
                    ${field.label}
                </label>
            </div>
        `;
    }

    /**
     * Creates a textarea field
     */
    createTextareaField(field, data) {
        const value = this.getNestedValue(data, field.dataPath) || '';
        const displayValue = this.formatComplexValue(value);
        return `
            <div class="form-field">
                <label for="${field.id}">${field.label}</label>
                <textarea id="${field.id}" name="${field.name}" rows="4">${this.escapeHtml(displayValue)}</textarea>
            </div>
        `;
    }

    /**
     * Creates a select dropdown field
     */
    createSelectField(field, data) {
        const value = this.getNestedValue(data, field.dataPath) || '';
        let optionsHtml = '';
        
        if (field.options) {
            field.options.forEach(option => {
                const selected = option.value === value ? 'selected' : '';
                optionsHtml += `<option value="${this.escapeHtml(option.value)}" ${selected}>${this.escapeHtml(option.label)}</option>`;
            });
        }
        
        return `
            <div class="form-field">
                <label for="${field.id}">${field.label}</label>
                <select id="${field.id}" name="${field.name}">
                    ${optionsHtml}
                </select>
            </div>
        `;
    }

    /**
     * Creates a section header
     */
    createSection(field, data) {
        return `<div class="form-section">
            <h3>${field.title}</h3>
            <div class="form-fields">
                ${field.fields ? field.fields.map(subField => this.buildField(subField, data)).join('') : ''}
            </div>
        </div>`;
    }

    /**
     * Gets a nested value from an object using dot notation
     */
    getNestedValue(obj, path) {
        if (!path || !obj) return '';
        
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : '';
        }, obj);
    }

    /**
     * Sets a nested value in an object using dot notation
     */
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

    /**
     * Escapes HTML characters to prevent XSS
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Formats complex values (arrays, objects) for display in textarea fields
     */
    formatComplexValue(value) {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (Array.isArray(value)) {
            return value.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return JSON.stringify(item, null, 2);
                }
                return item.toString();
            }).join('\n');
        }
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return value.toString();
    }

    /**
     * Populates form fields with data
     */
    populateForm(data) {
        if (!data) return;
        
        // Find all form fields and populate them
        const form = document.querySelector('form');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            const fieldName = input.name;
            if (fieldName) {
                const value = this.getNestedValue(data, fieldName);
                if (value !== undefined && value !== null) {
                    if (input.type === 'checkbox') {
                        input.checked = Boolean(value);
                    } else if (input.tagName === 'TEXTAREA') {
                        input.value = this.formatComplexValue(value);
                    } else {
                        input.value = value;
                    }
                }
            }
        });
    }

    /**
     * Collects form data into an object
     */
    collectFormData() {
        const form = document.querySelector('form');
        if (!form) return {};
        
        const data = {};
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const fieldName = input.name;
            if (fieldName) {
                let value;
                if (input.type === 'checkbox') {
                    value = input.checked;
                } else if (input.type === 'number') {
                    value = input.value ? parseInt(input.value, 10) : 0;
                } else if (input.tagName === 'TEXTAREA') {
                    // Try to parse JSON for complex fields, fallback to string
                    try {
                        value = JSON.parse(input.value);
                    } catch (e) {
                        value = input.value;
                    }
                } else {
                    value = input.value;
                }
                
                this.setNestedValue(data, fieldName, value);
            }
        });
        
        return data;
    }

    /**
     * Gets the complete monster form field configuration
     */
    getMonsterFormConfig() {
        return [
            {
                title: 'Basic Information',
                type: 'section',
                fields: [
                    { id: 'name', name: 'name', label: 'Monster Name', type: 'text', dataPath: 'name' },
                    { id: 'type', name: 'type', label: 'Type', type: 'text', dataPath: 'type' },
                    { id: 'subtype', name: 'subtype', label: 'Subtype', type: 'text', dataPath: 'subtype' },
                    { id: 'size', name: 'size', label: 'Size', type: 'select', dataPath: 'size',
                        options: [
                            { value: 'Tiny', label: 'Tiny' },
                            { value: 'Small', label: 'Small' },
                            { value: 'Medium', label: 'Medium' },
                            { value: 'Large', label: 'Large' },
                            { value: 'Huge', label: 'Huge' },
                            { value: 'Gargantuan', label: 'Gargantuan' }
                        ]
                    },
                    { id: 'alignment', name: 'alignment', label: 'Alignment', type: 'text', dataPath: 'alignment' },
                    { id: 'challenge_rating', name: 'challenge_rating', label: 'Challenge Rating', type: 'text', dataPath: 'challenge_rating' },
                    { id: 'xp', name: 'xp', label: 'XP', type: 'number', dataPath: 'xp' }
                ]
            },
            {
                title: 'Combat Stats',
                type: 'section',
                fields: [
                    { id: 'armor_class', name: 'armor_class', label: 'Armor Class', type: 'number', dataPath: 'armor_class.0.value' },
                    { id: 'hit_points', name: 'hit_points', label: 'Hit Points', type: 'number', dataPath: 'hit_points' },
                    { id: 'hit_dice', name: 'hit_dice', label: 'Hit Dice', type: 'text', dataPath: 'hit_dice' },
                    { id: 'hit_points_roll', name: 'hit_points_roll', label: 'Hit Points Roll', type: 'text', dataPath: 'hit_points_roll' },
                    { id: 'speed', name: 'speed', label: 'Speed', type: 'text', dataPath: 'speed.walk' },
                    { id: 'proficiency_bonus', name: 'proficiency_bonus', label: 'Proficiency Bonus', type: 'number', dataPath: 'proficiency_bonus' },
                    { id: 'initiative', name: 'initiative', label: 'Initiative', type: 'number', dataPath: 'initiative' }
                ]
            },
            {
                title: 'Ability Scores',
                type: 'section',
                fields: [
                    { id: 'strength', name: 'strength', label: 'STR', type: 'number', dataPath: 'strength' },
                    { id: 'dexterity', name: 'dexterity', label: 'DEX', type: 'number', dataPath: 'dexterity' },
                    { id: 'constitution', name: 'constitution', label: 'CON', type: 'number', dataPath: 'constitution' },
                    { id: 'intelligence', name: 'intelligence', label: 'INT', type: 'number', dataPath: 'intelligence' },
                    { id: 'wisdom', name: 'wisdom', label: 'WIS', type: 'number', dataPath: 'wisdom' },
                    { id: 'charisma', name: 'charisma', label: 'CHA', type: 'number', dataPath: 'charisma' }
                ]
            },
            {
                title: 'Defenses & Resistances',
                type: 'section',
                fields: [
                    { id: 'damage_resistances', name: 'damage_resistances', label: 'Damage Resistances', type: 'textarea', dataPath: 'damage_resistances' },
                    { id: 'damage_immunities', name: 'damage_immunities', label: 'Damage Immunities', type: 'textarea', dataPath: 'damage_immunities' },
                    { id: 'damage_vulnerabilities', name: 'damage_vulnerabilities', label: 'Damage Vulnerabilities', type: 'textarea', dataPath: 'damage_vulnerabilities' },
                    { id: 'condition_immunities', name: 'condition_immunities', label: 'Condition Immunities', type: 'textarea', dataPath: 'condition_immunities' }
                ]
            },
            {
                title: 'Skills & Senses',
                type: 'section',
                fields: [
                    { id: 'saving_throws', name: 'saving_throws', label: 'Saving Throws', type: 'textarea', dataPath: 'saving_throws' },
                    { id: 'skills', name: 'skills', label: 'Skills', type: 'textarea', dataPath: 'skills' },
                    { id: 'senses', name: 'senses', label: 'Senses', type: 'textarea', dataPath: 'senses' },
                    { id: 'languages', name: 'languages', label: 'Languages', type: 'textarea', dataPath: 'languages' }
                ]
            },
            {
                title: 'Actions & Abilities',
                type: 'section',
                fields: [
                    { id: 'special_abilities', name: 'special_abilities', label: 'Special Abilities', type: 'textarea', dataPath: 'special_abilities' },
                    { id: 'actions', name: 'actions', label: 'Actions', type: 'textarea', dataPath: 'actions' },
                    { id: 'legendary_actions', name: 'legendary_actions', label: 'Legendary Actions', type: 'textarea', dataPath: 'legendary_actions' },
                    { id: 'reactions', name: 'reactions', label: 'Reactions', type: 'textarea', dataPath: 'reactions' }
                ]
            },
            {
                title: 'Description',
                type: 'section',
                fields: [
                    { id: 'desc', name: 'desc', label: 'Description', type: 'textarea', dataPath: 'desc' }
                ]
            }
        ];
    }
}

// Create global instance
window.monsterFieldPopulator = new MonsterFieldPopulator();
console.log('MonsterFieldPopulator created and assigned to window.monsterFieldPopulator');

// Bind methods to ensure proper 'this' context
const methodsToBind = ['buildForm', 'buildSection', 'buildField', 'createTextField', 'createNumberField', 
                      'createCheckboxField', 'createTextareaField', 'createSelectField', 'createSection',
                      'getNestedValue', 'setNestedValue', 'escapeHtml', 'formatComplexValue', 'populateForm', 'collectFormData', 'getMonsterFormConfig'];

methodsToBind.forEach(method => {
    window.monsterFieldPopulator[method] = window.monsterFieldPopulator[method].bind(window.monsterFieldPopulator);
});

console.log('MonsterFieldPopulator methods bound successfully');
console.log('Available methods:', Object.getOwnPropertyNames(window.monsterFieldPopulator).filter(name => typeof window.monsterFieldPopulator[name] === 'function'));
console.log('MonsterFieldPopulator script fully loaded and ready!');
