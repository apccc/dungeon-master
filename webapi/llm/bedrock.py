import boto3
import json
from config import BEDROCK_MODEL_ID

bedrock_client = boto3.client('bedrock-runtime', region_name='us-west-2')

def get_inference_bedrock(system_message: str, user_text: str) -> str:
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
            'text': user_text
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
