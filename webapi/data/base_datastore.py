from datetime import datetime, timezone
from typing import Optional, Dict, Any
from data.datastore import Datastore


class BaseData:
    """
    A base data class representing data with a last_updated timestamp.
    """
    
    def __init__(self, data: Dict[str, Any] = None, last_updated: Optional[str] = None):
        """
        Initialize BaseData with optional data and last_updated timestamp.
        
        Args:
            data: Dictionary containing the data
            last_updated: ISO format timestamp string, defaults to current time
        """
        self.data = data or {}
        self.last_updated = last_updated or datetime.now(timezone.utc).isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert BaseData to a dictionary for storage.
        
        Returns:
            Dict containing the data and last_updated timestamp
        """
        return {
            'data': self.data,
            'last_updated': self.last_updated
        }
    
    @classmethod
    def from_dict(cls, data_dict: Dict[str, Any]) -> 'BaseData':
        """
        Create BaseData from a dictionary.
        
        Args:
            data_dict: Dictionary containing data and last_updated
            
        Returns:
            BaseData instance
        """
        return cls(
            data=data_dict.get('data', {}),
            last_updated=data_dict.get('last_updated')
        )


class BaseDatastore:
    """
    A base class backed by the data store for persistence.
    """
    
    def __init__(self, entity_id: str, database: str, table: str):
        """
        Initialize the base class with a specific entity ID and datastore configuration.
        
        Args:
            entity_id: Unique identifier for the entity
            database: Database name for the datastore
            table: Table name for the datastore
        """
        self.entity_id = entity_id
        self.datastore = Datastore(database, table, entity_id)
    
    def upsert_data(self, data_obj: BaseData) -> bool:
        """
        Upsert (insert or update) data to the data store.
        The last_updated property is automatically set to the current time.
        
        Args:
            data_obj: BaseData object to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        data_obj.last_updated = datetime.now(timezone.utc).isoformat()
        data_dict = data_obj.to_dict()
        return self.datastore.upsert(data_dict)
    
    def upsert_data_dict(self, data: Dict[str, Any]) -> bool:
        """
        Convenience method to upsert data directly from a dictionary.
        Creates a new BaseData object and sets last_updated automatically.
        
        Args:
            data: Dictionary containing the data
            
        Returns:
            bool: True if successful, False otherwise
        """
        data_obj = BaseData(data=data)
        return self.upsert_data(data_obj)
    
    def get_data(self) -> Optional[BaseData]:
        """
        Retrieve data from the data store.
        
        Returns:
            Optional[BaseData]: The retrieved data, or None if not found
        """
        data_dict = self.datastore.get()
        if data_dict is None:
            return BaseData().from_dict({})
        
        return BaseData.from_dict(data_dict)
    
    def get_data_dict(self) -> Dict[str, Any]:
        """
        Convenience method to get data as a dictionary.
        
        Returns:
            Optional[Dict]: The data dictionary, or None if not found
        """
        data_obj = self.get_data()
        if data_obj is None:
            return {}
        
        return data_obj.data
    
    def exists(self) -> bool:
        """
        Check if data exists in the data store.
        
        Returns:
            bool: True if entity exists, False otherwise
        """
        return self.datastore.exists()
    
    def delete_data(self) -> bool:
        """
        Delete data from the data store.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return self.datastore.delete()
