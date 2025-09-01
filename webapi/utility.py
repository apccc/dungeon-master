from data.game import Game
from data.player import Player
from config import DM_PLAYER_ID, GAME_ID
from data.dnd_5e_srd.resource import get_resource_data

def get_game():
    game = Game(GAME_ID).get_game_data_dict()
    return game

def get_player():
    player = Player(DM_PLAYER_ID).get_player_data_dict()
    return player

def get_dnd_5e_srd_resource(database: str = 'index', table: str = 'index', resource: str = 'index'):
    return get_resource_data(database, table, resource)

def upsert_game():
    game = Game(GAME_ID)
    return game.upsert_game_data_dict({
        "name": "Fand",
        "description": "A DnD world ruled by the sea goddess Fand, fairy queen, and the wife of Manannán mac Lir. She is renowned for her beauty and her role in the tale 'Serglige Con Culainn' (The Sickbed of Cúchulainn), where she becomes the lover of the hero Cúchulainn.",
        "players": [DM_PLAYER_ID]
    })

def upsert_player(player_id: str):
    player = Player(player_id)
    return player.upsert_player_data_dict({
        "name": "Remmie"
    })
