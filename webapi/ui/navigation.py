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
            "name": "Players",
            "path": "/game/players.html",
        })
        navigation.append({
            "name": "Monsters",
            "path": "/game/monsters.html",
        })
        navigation.append({
            "name": "Items",
            "path": "/game/items.html",
        })
        navigation.append({
            "name": "Locations",
            "path": "/game/locations.html",
        })
        navigation.append({
            "name": "Events",
            "path": "/game/events.html",
        })
        navigation.append({
            "name": "Quests",
            "path": "/game/quests.html",
        })
        navigation.append({
            "name": "NPCs",
            "path": "/game/npcs.html",
        })
        navigation.append({
            "name": "Settings",
            "path": "/game/settings.html",
        })
        navigation.append({
            "name": "Notes",
            "path": "/game/notes.html",
        })
    return {
        "navigation": navigation
    }
