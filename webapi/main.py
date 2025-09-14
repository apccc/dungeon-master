import asyncio
from handler_get import handle_get
from handler_post import handle_post
from utility import upsert_player

def lambda_handler(event, context):
    print(f"Event: {event}")
    print(f"Context: {context}")

    if event.get('requestContext', {}).get('http', {}).get('method') == 'GET':
        return asyncio.run(handle_get(event, context))
    elif event.get('requestContext', {}).get('http', {}).get('method') == 'POST':
        return handle_post(event, context)
    else:
        return {
            'statusCode': 400,
            'body': 'Bad Request: Method not supported'
        }


if __name__ == "__main__":
    ret = upsert_player('daryl')
    print(ret)
    print("Done")
