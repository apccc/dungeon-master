from data.base_datastore import BaseData, BaseDatastore


class NPCData(BaseData):
    """
    A data class representing NPC data with a last_updated timestamp.
    """
    pass


class NPC(BaseDatastore):
    """
    An NPC class backed by the data store for persistence.
    """
    
    def __init__(self, npc_id: str, database: str = 'npcs', table: str = 'npc-data'):
        """
        Initialize the NPC with a specific NPC ID and datastore configuration.
        
        Args:
            npc_id: Unique identifier for the NPC
            database: Database name for the datastore (default: 'npcs')
            table: Table name for the datastore (default: 'npc-data')
        """
        super().__init__(npc_id, database, table)
    
    def upsert_npc_data(self, npc_data: NPCData) -> bool:
        """
        Upsert (insert or update) NPC data to the data store.
        The last_updated property is automatically set to the current time.
        
        Args:
            npc_data: NPCData object to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        return self.upsert_data(npc_data)
    
    def upsert_npc_data_dict(self, data: dict) -> bool:
        """
        Convenience method to upsert NPC data directly from a dictionary.
        Creates a new NPCData object and sets last_updated automatically.
        
        Args:
            data: Dictionary containing the NPC data
            
        Returns:
            bool: True if successful, False otherwise
        """
        npc_data = NPCData(data=data)
        return self.upsert_npc_data(npc_data)
    
    def get_npc_data(self) -> NPCData:
        """
        Retrieve NPC data from the data store.
        
        Returns:
            Optional[NPCData]: The retrieved NPC data, or None if not found
        """
        return self.get_data()
    
    def get_npc_data_dict(self) -> dict:
        """
        Convenience method to get NPC data as a dictionary.
        
        Returns:
            Optional[Dict]: The NPC data dictionary, or None if not found
        """
        return self.get_data_dict()
    
    def npc_exists(self) -> bool:
        """
        Check if NPC data exists in the data store.
        
        Returns:
            bool: True if NPC exists, False otherwise
        """
        return self.exists()
    
    def delete_npc_data(self) -> bool:
        """
        Delete NPC data from the data store.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return self.delete_data()
