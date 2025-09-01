from data.base_datastore import BaseData, BaseDatastore


class PlayerData(BaseData):
    """
    A data class representing player data with a last_updated timestamp.
    """
    pass


class Player(BaseDatastore):
    """
    A Player class backed by the data store for persistence.
    """
    
    def __init__(self, player_id: str, database: str = 'players', table: str = 'player-data'):
        """
        Initialize the Player with a specific player ID and datastore configuration.
        
        Args:
            player_id: Unique identifier for the player
            database: Database name for the datastore (default: 'players')
            table: Table name for the datastore (default: 'player-data')
        """
        super().__init__(player_id, database, table)
    
    def upsert_player_data(self, player_data: PlayerData) -> bool:
        """
        Upsert (insert or update) player data to the data store.
        The last_updated property is automatically set to the current time.
        
        Args:
            player_data: PlayerData object to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        return self.upsert_data(player_data)
    
    def upsert_player_data_dict(self, data: dict) -> bool:
        """
        Convenience method to upsert player data directly from a dictionary.
        Creates a new PlayerData object and sets last_updated automatically.
        
        Args:
            data: Dictionary containing the player data
            
        Returns:
            bool: True if successful, False otherwise
        """
        player_data = PlayerData(data=data)
        return self.upsert_player_data(player_data)
    
    def get_player_data(self) -> PlayerData:
        """
        Retrieve player data from the data store.
        
        Returns:
            Optional[PlayerData]: The retrieved player data, or None if not found
        """
        return self.get_data()
    
    def get_player_data_dict(self) -> dict:
        """
        Convenience method to get player data as a dictionary.
        
        Returns:
            Optional[Dict]: The player data dictionary, or None if not found
        """
        return self.get_data_dict()
    
    def player_exists(self) -> bool:
        """
        Check if player data exists in the data store.
        
        Returns:
            bool: True if player exists, False otherwise
        """
        return self.exists()
    
    def delete_player_data(self) -> bool:
        """
        Delete player data from the data store.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return self.delete_data()
