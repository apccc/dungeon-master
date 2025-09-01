from llm.bedrock import get_inference_bedrock
from data.npc import NPC

def get_npc_dialogue(npc_info: str, story_string: str) -> str:
  system_message = get_system_message()
  user_message = get_user_message(npc_info, story_string)
  return get_inference_bedrock(system_message, user_message)

def get_system_message() -> str:
  return "You are an NPC (Non-Player Character). You are playing the role of a character in a game of Dungeons & Dragons."

def get_user_message(npc_info: str, story_string: str) -> str:
  return f"NPC info: {npc_info}\nStory: {story_string}\n\nWhat do you say?"

def get_npc(npc_id: str) -> dict:
    npc = NPC(npc_id)
    npc_data = npc.get_npc_data_dict()
    return npc_data or {}

def upsert_npc(npc_id: str, npc_data: dict) -> bool:
    npc = NPC(npc_id)
    return npc.upsert_npc_data_dict(npc_data)
