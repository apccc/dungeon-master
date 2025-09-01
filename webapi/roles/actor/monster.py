from llm.bedrock import get_inference_bedrock
from data.monster import Monster

def get_monster_dialogue(monster_info: str, story_string: str) -> str:
  system_message = get_system_message()
  user_message = get_user_message(monster_info, story_string)
  return get_inference_bedrock(system_message, user_message)

def get_system_message() -> str:
  return "You are a monster. You are playing the role of a monster in a game of Dungeons & Dragons."

def get_user_message(monster_info: str, story_string: str) -> str:
  return f"Monster info: {monster_info}\nStory: {story_string}\n\nWhat do you say?"

def get_monster(monster_id: str) -> dict:
    monster = Monster(monster_id)
    monster_data = monster.get_monster_data_dict()
    return monster_data or {}

def upsert_monster(monster_id: str, monster_data: dict) -> bool:
    monster = Monster(monster_id)
    return monster.upsert_monster_data_dict(monster_data)
