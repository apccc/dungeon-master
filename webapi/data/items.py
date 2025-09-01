from data.base_datastore import BaseData, BaseDatastore


class ItemsData(BaseData):
    pass


class Items(BaseDatastore):
    
    def __init__(self, game_id: str, database: str = 'items', table: str = 'items-data'):
        super().__init__(game_id, database, table)
    
    def upsert_items_data(self, items_data: ItemsData) -> bool:
        return self.upsert_data(items_data)
    
    def upsert_items_data_dict(self, data: dict) -> bool:
        items_data = ItemsData(data=data)
        return self.upsert_items_data(items_data)
    
    def get_items_data(self) -> ItemsData:
        return self.get_data()
    
    def get_items_data_dict(self) -> dict:
        return self.get_data_dict()
    
    def items_exists(self) -> bool:
        return self.exists()
    
    def delete_items_data(self) -> bool:
        return self.delete_data()
