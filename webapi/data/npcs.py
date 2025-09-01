from data.base_datastore import BaseData, BaseDatastore


class NPCsData(BaseData):
    """
    A data class representing NPC data with a last_updated timestamp.
    """
    pass


class NPCs(BaseDatastore):
    """
    An NPCs class backed by the data store for persistence.
    """
    
    def __init__(self, game_id: str, database: str = 'npcs', table: str = 'npcs-data'):
        """
        Initialize the NPCs with a specific Game ID and datastore configuration.
        
        Args:
            game_id: Unique identifier for the Game
            database: Database name for the datastore (default: 'npcs')
            table: Table name for the datastore (default: 'npc-data')
        """
        super().__init__(game_id, database, table)
    
    def upsert_npcs_data(self, npcs_data: NPCsData) -> bool:
        """
        Upsert (insert or update) NPCs data to the data store.
        The last_updated property is automatically set to the current time.
        
        Args:
            npcs_data: NPCsData object to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        return self.upsert_data(npcs_data)
    
    def upsert_npcs_data_dict(self, data: dict) -> bool:
        """
        Convenience method to upsert NPCs data directly from a dictionary.
        Creates a new NPCsData object and sets last_updated automatically.
        
        Args:
            data: Dictionary containing the NPCs data
            
        Returns:
            bool: True if successful, False otherwise
        """
        npcs_data = NPCsData(data=data)
        return self.upsert_npcs_data(npcs_data)
    
    def get_npcs_data(self) -> NPCsData:
        """
        Retrieve NPCs data from the data store.
        
        Returns:
            Optional[NPCsData]: The retrieved NPCs data, or None if not found
        """
        return self.get_data()
    
    def get_npcs_data_dict(self) -> dict:
        """
        Convenience method to get NPCs data as a dictionary.
        
        Returns:
            Optional[Dict]: The NPCs data dictionary, or None if not found
        """
        return self.get_data_dict()
    
    def npcs_exists(self) -> bool:
        """
        Check if NPCs data exists in the data store.
        
        Returns:
            bool: True if NPCs exists, False otherwise
        """
        return self.exists()
    
    def delete_npcs_data(self) -> bool:
        """
        Delete NPCs data from the data store.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return self.delete_data()
