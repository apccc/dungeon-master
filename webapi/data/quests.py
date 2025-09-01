from data.base_datastore import BaseData, BaseDatastore


class QuestsData(BaseData):
    pass


class Quests(BaseDatastore):
    
    def __init__(self, game_id: str, database: str = 'quests', table: str = 'quests-data'):
        super().__init__(game_id, database, table)
    
    def upsert_quests_data(self, quests_data: QuestsData) -> bool:
        return self.upsert_data(quests_data)
    
    def upsert_quests_data_dict(self, data: dict) -> bool:
        quests_data = QuestsData(data=data)
        return self.upsert_quests_data(quests_data)
    
    def get_quests_data(self) -> QuestsData:
        return self.get_data()
    
    def get_quests_data_dict(self) -> dict:
        return self.get_data_dict()
    
    def quests_exists(self) -> bool:
        return self.exists()
    
    def delete_quests_data(self) -> bool:
        return self.delete_data()
