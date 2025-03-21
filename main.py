import context
import dm

def main():
  human_characters = context.get_human_characters()
  human_characters_string = "\n".join(human_characters)
  story = context.get_story()
  story_string = "\n".join(story)
  dm_says = dm.get_next(human_characters_string, story_string)
  context.save_story(dm_says)
  print(dm_says)

if __name__ == "__main__":
  main()
