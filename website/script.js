function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

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

function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

document.addEventListener('DOMContentLoaded', function() {
    const gameForm = document.getElementById('gameForm');

    const existingGameId = getCookie('gameId');
    if (existingGameId) {
        console.log('Found existing game ID in cookie:', existingGameId);
        document.getElementById('gameId').value = existingGameId;
    }
    
    const existingPlayerId = getCookie('playerId');
    if (existingPlayerId) {
        console.log('Found existing player ID in cookie:', existingPlayerId);
        document.getElementById('playerId').value = existingPlayerId;
    }
    
    if (gameForm) {
        gameForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const gameId = document.getElementById('gameId').value.trim();
            const playerId = document.getElementById('playerId').value.trim();
            
            if (gameId && playerId) {
                setCookie('gameId', gameId, 30);
                setCookie('playerId', playerId, 30);
                
                console.log('Game ID entered:', gameId);
                console.log('Player ID entered:', playerId);
                console.log('Cookies set successfully');

                window.location.href = 'game/index.html';
            }
        });
    }
});
