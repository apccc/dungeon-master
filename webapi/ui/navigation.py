def get_navigation(is_dm: bool) -> dict:
    navigation = [
        {
            "name": "Home",
            "path": "/",
        },
        {
            "name": "Game",
            "path": "/game/index.html",
        },
        {
            "name": "Player",
            "path": "/game/player.html",
        },
        {
            "name": "Reference",
            "path": "/reference/index.html",
        }
    ]
    if is_dm:
        navigation.append({
            "name": "Game Players",
            "path": "/game/players.html",
        })
        navigation.append({
            "name": "Game Monsters",
            "path": "/game/monsters.html",
        })
        navigation.append({
            "name": "Game Items",
            "path": "/game/items.html",
        })
        navigation.append({
            "name": "Game Locations",
            "path": "/game/locations.html",
        })
        navigation.append({
            "name": "Game Events",
            "path": "/game/events.html",
        })
        navigation.append({
            "name": "Game Quests",
            "path": "/game/quests.html",
        })
        navigation.append({
            "name": "Game NPCs",
            "path": "/game/npcs.html",
        })
        navigation.append({
            "name": "Game Settings",
            "path": "/game/settings.html",
        })
    return {
        "navigation": navigation
    }
