from data.base_datastore import BaseData, BaseDatastore


class MonsterData(BaseData):
    """
    A data class representing monster data with a last_updated timestamp.
    """
    pass


class Monster(BaseDatastore):
    """
    A Monster class backed by the data store for persistence.
    """
    
    def __init__(self, monster_id: str, database: str = 'monsters', table: str = 'monster-data'):
        """
        Initialize the Monster with a specific monster ID and datastore configuration.
        
        Args:
            monster_id: Unique identifier for the monster
            database: Database name for the datastore (default: 'monsters')
            table: Table name for the datastore (default: 'monster-data')
        """
        super().__init__(monster_id, database, table)
    
    def upsert_monster_data(self, monster_data: MonsterData) -> bool:
        """
        Upsert (insert or update) monster data to the data store.
        The last_updated property is automatically set to the current time.
        
        Args:
            monster_data: MonsterData object to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        return self.upsert_data(monster_data)
    
    def upsert_monster_data_dict(self, data: dict) -> bool:
        """
        Convenience method to upsert monster data directly from a dictionary.
        Creates a new MonsterData object and sets last_updated automatically.
        
        Args:
            data: Dictionary containing the monster data
            
        Returns:
            bool: True if successful, False otherwise
        """
        monster_data = MonsterData(data=data)
        return self.upsert_monster_data(monster_data)
    
    def get_monster_data(self) -> MonsterData:
        """
        Retrieve monster data from the data store.
        
        Returns:
            Optional[MonsterData]: The retrieved monster data, or None if not found
        """
        return self.get_data()
    
    def get_monster_data_dict(self) -> dict:
        """
        Convenience method to get monster data as a dictionary.
        
        Returns:
            Optional[Dict]: The monster data dictionary, or None if not found
        """
        return self.get_data_dict()
    
    def monster_exists(self) -> bool:
        """
        Check if monster data exists in the data store.
        
        Returns:
            bool: True if monster exists, False otherwise
        """
        return self.exists()
    
    def delete_monster_data(self) -> bool:
        """
        Delete monster data from the data store.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return self.delete_data()
