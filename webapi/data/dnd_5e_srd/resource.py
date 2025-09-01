import requests
from typing import Optional, Dict, Any
from data.base_datastore import BaseDatastore, BaseData

dnd_5e_src_api_url = 'https://www.dnd5eapi.co/api/2014'


class Dnd5eResource(BaseDatastore):
    """
    A resource class for D&D 5e SRD data that follows the base_datastore pattern.
    Supports three levels of input parameters: database, table, and resource.
    """
    
    def __init__(self, database: str = 'index', table: str = 'index', resource: str = 'index'):
        """
        Initialize the D&D 5e resource with database, table, and resource parameters.
        
        Args:
            database: The database level (e.g., 'classes', 'subclasses', 'ability-scores')
            table: The table level (e.g., 'ranger', 'hunter', 'con')
            resource: The resource level (e.g., 'multi-classing', 'features', 'index')
        """
        database_with_prefix = f'dnd-5e-srd-2014-{database}'
        self.database = database
        self.table = table
        self.resource = resource
        self.entity_path = f'{database_with_prefix}/{table}/{resource}'
        super().__init__(entity_id=resource, database=database_with_prefix, table=table)
    
    def get_resource_data(self) -> Dict[str, Any]:
        """
        Get resource data, first trying the datastore, then falling back to API.
        
        Returns:
            Dict containing the resource data
        """
        data_obj = self.get_data()
        if data_obj and data_obj.data:
            print(f"Data found in datastore for {self.entity_path}")
            return data_obj.data
        
        api_data = self._fetch_from_api()
        if api_data:
            print(f"Data fetched from API and stored in datastore for {self.entity_path}")
            self.upsert_data_dict(api_data)
            return api_data
        
        return {}
    
    def _fetch_from_api(self) -> Optional[Dict[str, Any]]:
        """
        Fetch data from the D&D 5e API based on the current parameters.
        
        Returns:
            Optional[Dict] containing the API response data, or None if failed
        """
        try:
            url_parts = [dnd_5e_src_api_url]
            
            if self.database != 'index':
                url_parts.append(self.database)
            
            if self.database != 'index' and self.table != 'index':
                url_parts.append(self.table)
            
            if self.database != 'index' and self.table != 'index' and self.resource != 'index':
                url_parts.append(self.resource)
            
            api_url = '/'.join(url_parts)
            print(f"Fetching data from API {api_url}")
            response = requests.get(api_url, timeout=30)
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            print(f"Error fetching data from API {api_url}: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error during API fetch: {e}")
            return None


def get_resource_data(database: str = 'index', table: str = 'index', resource: str = 'index') -> dict:
    """
    Convenience function to get D&D 5e resource data.
    
    Args:
        database: The database level (e.g., 'classes', 'subclasses', 'ability-scores')
        table: The table level (e.g., 'ranger', 'hunter', 'con')
        resource: The resource level (e.g., 'multi-classing', 'features', 'index')
    
    Returns:
        Dict containing the resource data
        
    Examples:
        # Get base index
        get_resource_data()  # Requests to https://www.dnd5eapi.co/api/2014
        
        # Get ability score data
        get_resource_data('ability-scores', 'con')  # Requests to https://www.dnd5eapi.co/api/2014/ability-scores/con
        
        # Get ranger multi-classing data
        get_resource_data('classes', 'ranger', 'multi-classing')  # Requests to https://www.dnd5eapi.co/api/2014/classes/ranger/multi-classing
        
        # Get hunter subclass features
        get_resource_data('subclasses', 'hunter', 'features')  # Requests to https://www.dnd5eapi.co/api/2014/subclasses/hunter/features
    """
    resource_instance = Dnd5eResource(database, table, resource)
    return resource_instance.get_resource_data() 
