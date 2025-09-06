import asyncio
from data.game import Game
from ui.navigation import get_navigation
from data.dnd_5e_srd.resource import get_resource_data
from data.locations import Locations
from data.players import Players
from data.events import Events
from data.player import Player
from handler_headers import get_data_from_headers


def get_current_data(data_dict):
    """
    Extract current data from a data dictionary.
    Filters data to only include items marked as 'current: True'.
    
    Args:
        data_dict: Dictionary containing data with 'current' flags
        
    Returns:
        Dictionary with only current data
    """
    if 'data' in data_dict and isinstance(data_dict['data'], dict):
        filtered_data = {}
        for key, value in data_dict['data'].items():
            if isinstance(value, dict) and value.get('current', False):
                filtered_data[key] = value
        data_dict['data'] = filtered_data
    return data_dict


def get_raw_path(event):
    raw_path= event.get('rawPath', '')
    if raw_path.startswith('//'):
        raw_path = raw_path[1:]
    return raw_path

async def handle_get(event, context):
    raw_path = get_raw_path(event)
    request_headers = event.get('headers', {})
    game_metadata = get_data_from_headers(request_headers)
    game_id = game_metadata.get('game_id', '')
    player_id = game_metadata.get('player_id', '')
    dm_data_id = game_metadata.get('dm_data_id', '')

    if not game_id or not player_id:
        return {
            'statusCode': 400,
            'body': 'Bad Request: invalid request'
        }

    game = Game(game_id).get_game_data()

    if not game:
        return {
            'statusCode': 404,
            'body': 'Not Found: game not found'
        }

    game_players = game.data.get('players', [])
    if player_id not in game_players:
        return {
            'statusCode': 400,
            'body': 'Bad Request: player not in game'
        }

    player = Player(player_id).get_player_data_dict()
    is_dm = player.get('dungeon_master', False)

    if raw_path == '/loadgame':
        locations, players, events = await asyncio.gather(
            asyncio.to_thread(Locations(game_id).get_locations_data),
            asyncio.to_thread(Players(game_id).get_players_data),
            asyncio.to_thread(Events(game_id).get_events_data)
        )
        
        current_locations = get_current_data(locations.to_dict())
        current_events = get_current_data(events.to_dict())
        current_players = get_current_data(players.to_dict())

        body_response = {
            'game': game.to_dict(),
            'navigation': get_navigation(is_dm),
            'locations': current_locations,
            'players': current_players,
            'events': current_events,
        }

        if is_dm == True:
            body_response['is_dm'] = is_dm

        return {
            'statusCode': 200,
            'body': body_response
        }

    if raw_path == '/game':
        return {
            'statusCode': 200,
            'body': game.to_dict()
        }

    if raw_path == '/navigation':
        return {
            'statusCode': 200,
            'body': get_navigation(is_dm)
        }

    if is_dm and raw_path == '/game/settings':
        return {
            'statusCode': 200,
            'body': game.to_dict()
        }

    if is_dm and raw_path == '/game/npcs':
        from data.npcs import NPCs
        npcs = NPCs(game_id).get_npcs_data()
        return {
            'statusCode': 200,
            'body': npcs.to_dict()
        }

    if is_dm and raw_path == '/game/quests':
        from data.quests import Quests
        quests = Quests(game_id).get_quests_data()
        return {
            'statusCode': 200,
            'body': quests.to_dict()
        }

    if is_dm and raw_path == '/game/events':
        events = Events(game_id).get_events_data()
        return {
            'statusCode': 200,
            'body': events.to_dict()
        }

    if is_dm and raw_path == '/game/locations':
        locations = Locations(game_id).get_locations_data()
        return {
            'statusCode': 200,
            'body': locations.to_dict()
        }

    if is_dm and raw_path == '/game/items':
        from data.items import Items
        items = Items(game_id).get_items_data()
        return {
            'statusCode': 200,
            'body': items.to_dict()
        }

    if is_dm and raw_path == '/game/monsters':
        if dm_data_id and is_dm:
            from data.monster import Monster
            monsters = Monster(dm_data_id).get_monster_data()
        else:
            from data.monsters import Monsters
            monsters = Monsters(game_id).get_monsters_data()

        return {
            'statusCode': 200,
            'body': monsters.to_dict()
        }

    if is_dm and raw_path == '/game/players':
        players = Players(game_id).get_players_data()
        return {
            'statusCode': 200,
            'body': players.to_dict()
        }

    if is_dm and raw_path == '/game/notes':
        from data.notes import Notes
        notes = Notes(game_id).get_notes_data()
        return {
            'statusCode': 200,
            'body': notes.to_dict()
        }

    if raw_path == '/game/player':
        player_id_to_load = player_id
        if dm_data_id and is_dm:
            player_id_to_load = dm_data_id
        player_data = Player(player_id_to_load).get_player_data()
        return {
            'statusCode': 200,
            'body': player_data.to_dict() if player_data else {}
        }

    if raw_path == '/reference':
        reference_database = event.get('queryStringParameters', {}).get('database', 'index')
        reference_table = event.get('queryStringParameters', {}).get('table', 'index')
        reference_resource = event.get('queryStringParameters', {}).get('resource', 'index')
        return {
            'statusCode': 200,
            'body': {
                'data': get_resource_data(reference_database, reference_table, reference_resource)
            }
        }

    return {
        'statusCode': 400,
        'body': 'Bad Request: Request not supported'
    }
