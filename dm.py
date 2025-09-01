import boto3
import json
import ollama

bedrock_client = boto3.client('bedrock-runtime', region_name='us-west-2')
ollama_client = ollama.Client()
BEDROCK_MODEL_ID='anthropic.claude-3-7-sonnet-20250219-v1:0'

def get_next(human_characters_string: str, story_string: str) -> str:
  print("The DM is thinking...")
  return get_next_bedrock(human_characters_string, story_string)

def get_next_bedrock(human_characters_string: str, story_string: str) -> str:
  system_message = get_system_message()
  user_message = get_user_message(human_characters_string, story_string)
  json_prompt = json.dumps({
    'anthropic_version': 'bedrock-2023-05-31',
    'max_tokens': 4096,
    'system': system_message,
    'temperature': 0.5,
    'messages': [
      {
        'role': 'user',
        'content': [
          {
            'type': 'text',
            'text': user_message
          }
        ]
      }
    ]
  })
  response = bedrock_client.invoke_model(
    body=json_prompt,
    modelId=BEDROCK_MODEL_ID,
    accept='application/json',
    contentType='application/json'
  )
  response_body = json.loads(response['body'].read())
  response_text = response_body['content'][0]['text']
  return response_text

def get_next_ollama(human_characters_string: str, story_string: str) -> str:
  system_message = get_system_message()
  user_message = get_user_message(human_characters_string, story_string)
  messages = [
    {'role': 'system', 'content': system_message },
    {'role': 'user', 'content': user_message},
  ]
  response = ollama_client.chat(model='llama3', messages=messages)
  return response['message']['content']

def get_system_message() -> str:
  return 'You are a DnD 5e dungeon master. Use the provided data to facilitate the next step of game play,'

def get_user_message(human_characters_string: str, story_string: str) -> str:
  return f"{human_characters_string}\n{story_string}\n\nWhat happens next?"
