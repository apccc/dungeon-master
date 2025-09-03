import json
import base64
from data.game import Game
from data.player import Player

def get_body(event):
    if event.get('isBase64Encoded', False):
        body = event.get('body', '')
        return json.loads(base64.b64decode(body).decode('utf-8'))

    body = event.get('body', {})
    if isinstance(body, str):
        return json.loads(body)
    return body

def handle_post(event, context):
    raw_path = event.get('rawPath', '')
    request_headers = event.get('headers', {})
    game_id = request_headers.get('game_id', '')
    player_id = request_headers.get('player_id', '')
    dm_data_id = request_headers.get('dm_data_id', '')
    body = get_body(event)

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

    if is_dm and raw_path == '/game/settings':
        return {
            'statusCode': 200,
            'body': Game(game_id).upsert_game_data_dict(body)
        }

    if is_dm and raw_path == '/game/npcs':
        from data.npcs import NPCs
        return {
            'statusCode': 200,
            'body': NPCs(game_id).upsert_npcs_data_dict(body)
        }

    if is_dm and raw_path == '/game/quests':
        from data.quests import Quests
        return {
            'statusCode': 200,
            'body': Quests(game_id).upsert_quests_data_dict(body)
        }

    if is_dm and raw_path == '/game/events':
        from data.events import Events
        return {
            'statusCode': 200,
            'body': Events(game_id).upsert_events_data_dict(body)
        }

    if is_dm and raw_path == '/game/locations':
        from data.locations import Locations
        return {
            'statusCode': 200,
            'body': Locations(game_id).upsert_locations_data_dict(body)
        }

    if is_dm and raw_path == '/game/items':
        from data.items import Items
        return {
            'statusCode': 200,
            'body': Items(game_id).upsert_items_data_dict(body)
        }

    if is_dm and raw_path == '/game/monsters':
        if dm_data_id and is_dm:
            from data.monster import Monster
            response = Monster(dm_data_id).upsert_monster_data_dict(body)
        else:
            from data.monsters import Monsters
            response = Monsters(game_id).upsert_monsters_data_dict(body)
        return {
            'statusCode': 200,
            'body': response
        }

    if is_dm and raw_path == '/game/players':
        from data.players import Players
        return {
            'statusCode': 200,
            'body': Players(game_id).upsert_players_data_dict(body)
        }

    if is_dm and raw_path == '/game/notes':
        from data.notes import Notes
        return {
            'statusCode': 200,
            'body': Notes(game_id).upsert_notes_data_dict(body)
        }

    if raw_path == '/game/player':
        player_id_to_target = player_id
        if dm_data_id and is_dm:
            player_id_to_target = dm_data_id
        return {
            'statusCode': 200,
            'body': Player(player_id_to_target).upsert_player_data_dict(body)
        }

    return {
        'statusCode': 400,
        'body': 'Bad Request: Request not supported'
    }
