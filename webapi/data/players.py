from data.base_datastore import BaseData, BaseDatastore


class PlayersData(BaseData):
    """
    A data class representing Players data with a last_updated timestamp.
    """
    pass


class Players(BaseDatastore):
    """
    A Players class backed by the data store for persistence.
    """
    
    def __init__(self, game_id: str, database: str = 'players', table: str = 'players-data'):
        """
        Initialize the Players with a specific Game ID and datastore configuration.
        
        Args:
            game_id: Unique identifier for the Game
            database: Database name for the datastore (default: 'players')
            table: Table name for the datastore (default: 'players-data')
        """
        super().__init__(game_id, database, table)
    
    def upsert_players_data(self, players_data: PlayersData) -> bool:
        """
        Upsert (insert or update) Players data to the data store.
        The last_updated property is automatically set to the current time.
        
        Args:
            players_data: PlayersData object to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        return self.upsert_data(players_data)
    
    def upsert_players_data_dict(self, data: dict) -> bool:
        """
        Convenience method to upsert Players data directly from a dictionary.
        Creates a new PlayersData object and sets last_updated automatically.
        
        Args:
            data: Dictionary containing the Players data
            
        Returns:
            bool: True if successful, False otherwise
        """
        players_data = PlayersData(data=data)
        return self.upsert_players_data(players_data)
    
    def get_players_data(self) -> PlayersData:
        """
        Retrieve Players data from the data store.
        
        Returns:
            Optional[PlayersData]: The retrieved Players data, or None if not found
        """
        return self.get_data()
    
    def get_players_data_dict(self) -> dict:
        """
        Convenience method to get Players data as a dictionary.
        
        Returns:
            Optional[Dict]: The Players data dictionary, or None if not found
        """
        return self.get_data_dict()
    
    def players_exists(self) -> bool:
        """
        Check if Players data exists in the data store.
        
        Returns:
            bool: True if Players exists, False otherwise
        """
        return self.exists()
    
    def delete_players_data(self) -> bool:
        """
        Delete Players data from the data store.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return self.delete_data()
