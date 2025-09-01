from data.base_datastore import BaseData, BaseDatastore


class LocationsData(BaseData):
    """
    A data class representing locations data with a last_updated timestamp.
    """
    pass


class Locations(BaseDatastore):
    """
    A Locations class backed by the data store for persistence.
    """
    
    def __init__(self, game_id: str, database: str = 'locations', table: str = 'locations-data'):
        """
        Initialize the Locations with a specific Game ID and datastore configuration.
        
        Args:
            game_id: Unique identifier for the Game
            database: Database name for the datastore (default: 'locations')
            table: Table name for the datastore (default: 'locations-data')
        """
        super().__init__(game_id, database, table)
    
    def upsert_locations_data(self, locations_data: LocationsData) -> bool:
        """
        Upsert (insert or update) locations data to the data store.
        The last_updated property is automatically set to the current time.
        
        Args:
            locations_data: LocationsData object to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        return self.upsert_data(locations_data)
    
    def upsert_locations_data_dict(self, data: dict) -> bool:
        """
        Convenience method to upsert locations data directly from a dictionary.
        Creates a new LocationsData object and sets last_updated automatically.
        
        Args:
            data: Dictionary containing the locations data
            
        Returns:
            bool: True if successful, False otherwise
        """
        locations_data = LocationsData(data=data)
        return self.upsert_locations_data(locations_data)
    
    def get_locations_data(self) -> LocationsData:
        """
        Retrieve locations data from the data store.
        
        Returns:
            Optional[LocationsData]: The retrieved locations data, or None if not found
        """
        return self.get_data()
    
    def get_locations_data_dict(self) -> dict:
        """
        Convenience method to get locations data as a dictionary.
        
        Returns:
            Optional[Dict]: The locations data dictionary, or None if not found
        """
        return self.get_data_dict()
    
    def locations_exists(self) -> bool:
        """
        Check if locations data exists in the data store.
        
        Returns:
            bool: True if locations exists, False otherwise
        """
        return self.exists()
    
    def delete_locations_data(self) -> bool:
        """
        Delete locations data from the data store.
        
        Returns:
            bool: True if successful, False otherwise
        """
        return self.delete_data()
