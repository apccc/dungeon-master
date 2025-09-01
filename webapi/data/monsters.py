from data.base_datastore import BaseData, BaseDatastore


class MonstersData(BaseData):
    pass


class Monsters(BaseDatastore):
    
    def __init__(self, game_id: str, database: str = 'monsters', table: str = 'monsters-data'):
        super().__init__(game_id, database, table)
    
    def upsert_monsters_data(self, monsters_data: MonstersData) -> bool:
        return self.upsert_data(monsters_data)
    
    def upsert_monsters_data_dict(self, data: dict) -> bool:
        monsters_data = MonstersData(data=data)
        return self.upsert_monsters_data(monsters_data)
    
    def get_monsters_data(self) -> MonstersData:
        return self.get_data()
    
    def get_monsters_data_dict(self) -> dict:
        return self.get_data_dict()
    
    def monsters_exists(self) -> bool:
        return self.exists()
    
    def delete_monsters_data(self) -> bool:
        return self.delete_data()
