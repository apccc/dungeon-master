from data.base_datastore import BaseData, BaseDatastore


class EventsData(BaseData):
    """
    A data class representing Events data with a last_updated timestamp.
    """
    pass


class Events(BaseDatastore):
    """
    An Events class backed by the data store for persistence.
    """
    
    def __init__(self, game_id: str, database: str = 'events', table: str = 'events-data'):
        """
        Initialize the Events with a specific Game ID and datastore configuration.
        
        Args:
            game_id: Unique identifier for the Game
            database: Database name for the datastore (default: 'events')
            table: Table name for the datastore (default: 'events-data')
        """
        super().__init__(game_id, database, table)
    
    def upsert_events_data(self, events_data: EventsData) -> bool:
        """
        Upsert (insert or update) Events data to the data store.
        The last_updated property is automatically set to the current time.
        
        Args:
            events_data: EventsData object to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        return self.upsert_data(events_data)
    
    def upsert_events_data_dict(self, data: dict) -> bool:
        """
        Convenience method to upsert Events data directly from a dictionary.
        Creates a new EventsData object and sets last_updated automatically.
        
        Args:
            data: Dictionary containing the Events data
            
        Returns:
            bool: True if successful, False otherwise
        """
        events_data = EventsData(data=data)
        return self.upsert_events_data(events_data)
    
    def get_events_data(self) -> EventsData:
        """
        Retrieve Events data from the data store.
        
        Returns:
            Optional[EventsData]: The retrieved Events data, or None if not found
        """
        return self.get_data()
    
    def get_events_data_dict(self) -> dict:
        """
        Convenience method to get Events data as a dictionary.
        
        Returns:
            Optional[Dict]: The Events data dictionary, or None if not found
        """
        return self.get_data_dict()
    
    def events_exists(self) -> bool:
        """
        Check if Events data exists in the data store.
        
        Returns:
            bool: True if Events exists, False otherwise
        """
        return self.exists()
    
    def delete_events_data(self) -> bool:
        """
        Delete Events data from the data store.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return self.delete_data()
