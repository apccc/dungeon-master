import json
import base64

def get_data_from_headers(headers):
    x_api_key = headers.get('x-api-key', '')
    if x_api_key:
        parsed_x_api = json.loads(base64.b64decode(x_api_key).decode('utf-8'))
        return parsed_x_api

    return {
        'game_id': headers.get('game_id', ''),
        'player_id': headers.get('player_id', ''),
        'dm_data_id': headers.get('dm_data_id', ''),
    }
