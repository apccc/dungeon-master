async function gameLoad() {
    const allGameDataJson = await getFromApi('loadgame');
    console.log('All game Data:', allGameDataJson);
    
    // Store game data globally so other scripts can access it
    window.allGameDataJson = allGameDataJson;
    
    const gameDataJson = allGameDataJson.game;
    const gameNavigation = allGameDataJson.navigation;
    const gameName = gameDataJson?.data?.name || 'Unknown Game';
    let topNavHtml = `
        <div id="game-container">
            <div id="game-header">
                <h2 id="game-header-title">${gameName}</h2>
                ${buildNavigationBar(gameNavigation.navigation)}
            </div>
        </div>
    `;
    if (allGameDataJson.is_dm && !isCurrentPage('/game/index.html')) {
        topNavHtml += `
            <div id="dm-id-form">
                <input type="text" id="dm-id-input" name="dm-id" placeholder="Id" autocomplete="off" autocorrect="off" />
                <button type="button" id="dm-load-btn" onclick="reloadApiController()">Load</button>
            </div>
        `;
    }
    document.getElementById('top').innerHTML = topNavHtml;
    if (isCurrentPage('/game/index.html')) {
        document.getElementById('middle').innerHTML = buildGameBody(allGameDataJson);
    }
}

function buildGameBody(allGameDataJson) {
    const gameDataJson = allGameDataJson.game;
    const locations = allGameDataJson.locations.data;
    const events = allGameDataJson.events.data;
    const players = allGameDataJson.players.data;
    return `
        <div id="game-body">
            ${gameDataJson.data.description}
            ${buildDiceBox()}
            ${buildGameSectionList('Current Locations', locations, 'location-item')}
            ${buildGameSectionList('Current Events', events, 'event-item')}
            ${buildGameSectionList('Current Players', players, 'player-item')}
        </div>
    `;
}

function buildGameSectionList(sectionTitle, data, itemClass) {
    if (!data || Object.keys(data).length === 0) {
        return `<div id="section-${sectionTitle.toLowerCase().replace(/\s+/g, '-')}">
            <h3>${sectionTitle}</h3>
            <p>No ${sectionTitle.toLowerCase()} available</p>
        </div>`;
    }
    const listItems = Object.entries(data).map(([itemName, itemData]) => {
        const image = itemData.image ? ` [<a href="/images/${itemData.image}" alt="${itemData.name}">image</a>]` : '';
        const descriptionText = itemData.description  ? `<br />${itemData.description}` : '';
        const typeText = itemData.type  ? `${itemData.type}: ` : '';
        return `<li class="${itemClass} game-item" 
            data-description="${itemData.description}"
            title="${itemData.description}">${typeText}${itemData.name}${descriptionText}${image}</li>`
    }).join('');
    return `<div id="section-${sectionTitle.toLowerCase().replace(/\s+/g, '-')}">
        <h3>${sectionTitle}</h3>
        <ul>
            ${listItems}
        </ul>
    </div>`;
}

function buildNavigationBar(navigationItems) {
    if (!navigationItems || navigationItems.length === 0) {
        return '';
    }
    
    const navigationHtml = navigationItems.map(item => createNavigationItem(item)).join('');
    return `<nav id="game-navigation">${navigationHtml}</nav>`;
}

function createNavigationItem(item) {
    const isActive = isCurrentPage(item.path);
    const activeClass = isActive ? 'active' : '';
    
    return `<a href="${item.path}" class="nav-item ${activeClass}">${item.name}</a>`;
}

function isCurrentPage(path) {
    const currentPath = window.location.pathname;
    return currentPath === path || (path !== '/' && currentPath.startsWith(path));
}

function buildDiceBox() {
    const diceTypes = [
        { type: 'd4', max: 4 },
        { type: 'd6', max: 6 },
        { type: 'd8', max: 8 },
        { type: 'd10', max: 10 },
        { type: 'd12', max: 12 },
        { type: 'd20', max: 20 },
        { type: 'd100', max: 100 }
    ];
    
    const diceHtml = diceTypes.map(dice => buildSingleDice(dice.type, dice.max)).join('');
    
    return `
        <div id="dice-container" class="dice-box">
            ${diceHtml}
        </div>
    `;
}

function buildSingleDice(diceType, maxValue) {
    return `
        <div class="dice-wrapper">
            <div id="dice-${diceType}" class="dice ${diceType}-dice" onclick="rollDice('${diceType}', ${maxValue})">
                <div id="dice-result-${diceType}" class="dice-result"></div>
            </div>
            <div class="dice-label">${diceType}</div>
        </div>
    `;
}


const diceTimers = {};

function rollDice(diceType, maxValue) {
    const diceResult = document.getElementById(`dice-result-${diceType}`);
    const randomNumber = generateRandomNumber(1, maxValue);

    if (diceTimers[diceType]) {
        clearTimeout(diceTimers[diceType]);
    }
    
    displayDiceResult(diceResult, randomNumber, diceType);
}

function rollD20() {
    rollDice('d20', 20);
}

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function displayDiceResult(resultElement, number, diceType) {
    resultElement.textContent = number;
    resultElement.style.display = 'block';
    
    diceTimers[diceType] = setTimeout(() => {
        resultElement.style.display = 'none';
        delete diceTimers[diceType];
    }, 60000);
}

document.addEventListener('DOMContentLoaded', gameLoad);
