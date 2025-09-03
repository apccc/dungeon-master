from data.base_datastore import BaseData, BaseDatastore


class NotesData(BaseData):
    """
    A data class representing Notes data with a last_updated timestamp.
    """
    pass


class Notes(BaseDatastore):
    """
    A Notes class backed by the data store for persistence.
    """
    
    def __init__(self, game_id: str, database: str = 'notes', table: str = 'notes-data'):
        """
        Initialize the Notes with a specific Game ID and datastore configuration.
        
        Args:
            game_id: Unique identifier for the Game
            database: Database name for the datastore (default: 'notes')
            table: Table name for the datastore (default: 'notes-data')
        """
        super().__init__(game_id, database, table)
    
    def upsert_notes_data(self, notes_data: NotesData) -> bool:
        """
        Upsert (insert or update) Notes data to the data store.
        The last_updated property is automatically set to the current time.
        
        Args:
            notes_data: NotesData object to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        return self.upsert_data(notes_data)
    
    def upsert_notes_data_dict(self, data: dict) -> bool:
        """
        Convenience method to upsert Notes data directly from a dictionary.
        Creates a new NotesData object and sets last_updated automatically.
        
        Args:
            data: Dictionary containing the Notes data
            
        Returns:
            bool: True if successful, False otherwise
        """
        notes_data = NotesData(data=data)
        return self.upsert_notes_data(notes_data)
    
    def get_notes_data(self) -> NotesData:
        """
        Retrieve Notes data from the data store.
        
        Returns:
            Optional[NotesData]: The retrieved Notes data, or None if not found
        """
        return self.get_data()
    
    def get_notes_data_dict(self) -> dict:
        """
        Convenience method to get Notes data as a dictionary.
        
        Returns:
            Optional[Dict]: The Notes data dictionary, or None if not found
        """
        return self.get_data_dict()
    
    def notes_exists(self) -> bool:
        """
        Check if Notes data exists in the data store.
        
        Returns:
            bool: True if Notes exists, False otherwise
        """
        return self.exists()
    
    def delete_notes_data(self) -> bool:
        """
        Delete Notes data from the data store.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return self.delete_data()
