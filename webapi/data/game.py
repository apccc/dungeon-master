from data.base_datastore import BaseData, BaseDatastore


class GameData(BaseData):
    """
    A data class representing game data with a last_updated timestamp.
    """
    pass


class Game(BaseDatastore):
    """
    A Game class backed by the data store for persistence.
    """
    
    def __init__(self, game_id: str, database: str = 'games', table: str = 'game-data'):
        """
        Initialize the Game with a specific game ID and datastore configuration.
        
        Args:
            game_id: Unique identifier for the game
            database: Database name for the datastore (default: 'games')
            table: Table name for the datastore (default: 'game-data')
        """
        super().__init__(game_id, database, table)
    
    def upsert_game_data(self, game_data: GameData) -> bool:
        """
        Upsert (insert or update) game data to the data store.
        The last_updated property is automatically set to the current time.
        
        Args:
            game_data: GameData object to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        return self.upsert_data(game_data)
    
    def upsert_game_data_dict(self, data: dict) -> bool:
        """
        Convenience method to upsert game data directly from a dictionary.
        Creates a new GameData object and sets last_updated automatically.
        
        Args:
            data: Dictionary containing the game data
            
        Returns:
            bool: True if successful, False otherwise
        """
        game_data = GameData(data=data)
        return self.upsert_game_data(game_data)
    
    def get_game_data(self) -> GameData:
        """
        Retrieve game data from the data store.
        
        Returns:
            Optional[GameData]: The retrieved game data, or None if not found
        """
        return self.get_data()
    
    def get_game_data_dict(self) -> dict:
        """
        Convenience method to get game data as a dictionary.
        
        Returns:
            Optional[Dict]: The game data dictionary, or None if not found
        """
        return self.get_data_dict()
    
    def game_exists(self) -> bool:
        """
        Check if game data exists in the data store.
        
        Returns:
            bool: True if game exists, False otherwise
        """
        return self.exists()
    
    def delete_game_data(self) -> bool:
        """
        Delete game data from the data store.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return self.delete_data()
