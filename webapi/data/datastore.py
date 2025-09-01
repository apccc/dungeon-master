import json
import re
import boto3
from botocore.exceptions import ClientError
from typing import Optional, Dict, Any

bucket_name = 'dungeon-master-data'
aws_region = 'us-west-2'

class Datastore:
    """
    A datastore class that handles upsert and get requests with S3 backing.
    
    Objects are stored in S3 at the path: /datastore/{database}/{table}/{id}/data.json
    where database, table, and id are provided during class initialization.
    """
    
    def __init__(self, database: str, table: str, id: str):
        """
        Initialize the Datastore with S3 configuration and object path.
        
        Args:
            database: The database name for the object path
            table: The table name for the object path
            id: The object ID for the object path
        """
        self.bucket_name = bucket_name

        if not re.match(r'^[a-z0-9-]+$', database):
            raise ValueError(f"Database name must contain only lowercase letters, numbers, and hyphens: {database}")
        self.database = database

        if not re.match(r'^[a-z0-9-]+$', table):
            raise ValueError(f"Table name must contain only lowercase letters, numbers, and hyphens: {table}")
        self.table = table

        if not re.match(r'^[a-z0-9-]+$', id):
            raise ValueError(f"ID must contain only lowercase letters, numbers, and hyphens: {id}")
        self.id = id
        
        self.s3_key = f"datastore/{database}/{table}/{id}/data.json"
        
        self.s3_client = boto3.client('s3', region_name=aws_region)
    
    def upsert(self, data: Dict[str, Any]) -> bool:
        """
        Upsert (insert or update) data to the S3 object.
        
        Args:
            data: Dictionary containing the data to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            json_data = json.dumps(data, indent=2, default=str)
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=self.s3_key,
                Body=json_data,
                ContentType='application/json'
            )
            return True
            
        except ClientError as e:
            print(f"Error upserting data to S3: {e}")
            return False
        except Exception as e:
            print(f"Unexpected error during upsert: {e}")
            return False
    
    def get(self) -> Optional[Dict[str, Any]]:
        """
        Retrieve data from the S3 object.
        
        Returns:
            Optional[Dict[str, Any]]: The retrieved data as a dictionary, 
            or None if the object doesn't exist or an error occurs
        """
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=self.s3_key
            )
            json_data = response['Body'].read().decode('utf-8')
            data = json.loads(json_data)
            
            return data

        except ClientError as e:
            print(f"Error retrieving data from S3 {self.s3_key}: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error during get {self.s3_key}: {e}")
            return None
    
    def exists(self) -> bool:
        """
        Check if the S3 object exists.
        
        Returns:
            bool: True if the object exists, False otherwise
        """
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=self.s3_key
            )
            return True
        except NoSuchKey:
            return False
        except ClientError:
            return False
    
    def delete(self) -> bool:
        """
        Delete the S3 object.
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=self.s3_key
            )
            return True
        except ClientError as e:
            print(f"Error deleting object from S3: {e}")
            return False
        except Exception as e:
            print(f"Unexpected error during delete: {e}")
            return False
    
    def get_s3_key(self) -> str:
        """
        Get the S3 key path for this datastore object.
        
        Returns:
            str: The S3 key path
        """
        return self.s3_key
