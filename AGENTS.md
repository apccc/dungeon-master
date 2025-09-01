- Use small files, small functions, small classes, and concise syntax to improve readability.
- Do not add comments in code. Remove comments unless the comment is absolutely necessary for clarity.
- Implementing a new database dm game object API control:
   - Ensure an appropriate website/game/ file is created, such as examples.html and examples.js. Use npcs.html and npcs.js as a template.
   - Ensure an appropriate webapi/data/ file is created, such as examples.py. Use npcs.py as a template.
   - Ensure the handlers are implemented:
      `webapi/handler_get.py`
      ```py
        if is_dm and raw_path == '/game/npcs':
            from data.npcs import NPCs
            npcs = NPCs(game_id).get_npcs_data()
            return {
                'statusCode': 200,
                'body': npcs.to_dict()
            }
      ```
      and
      `webapi/handler_post.py`
      ```py
        if is_dm and raw_path == '/game/npcs':
            from data.npcs import NPCs
            return {
                'statusCode': 200,
                'body': NPCs(game_id).upsert_npcs_data_dict(body)
            }
      ```
