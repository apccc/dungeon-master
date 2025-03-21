import datetime
import os

def get_human_characters() -> list[str]:
  files_path = "../human-characters"
  files_in_dir = os.listdir(files_path)
  human_characters = []
  for file in files_in_dir:
    with open(f"{files_path}/{file}", "r") as f:
      human_characters.append(f.read())
  return human_characters

def get_story() -> list[str]:
  files_path = "../story"
  files_in_dir = sorted(os.listdir(files_path))
  stories = []
  for file in files_in_dir:
    with open(f"{files_path}/{file}", "r") as f:
      stories.append(f.read())
  return stories

def save_story(dm_says: str):
  now_timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
  with open(f"../story/{now_timestamp}.txt", "a") as f:
    f.write(dm_says)
