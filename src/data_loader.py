import pandas as pd

class DataLoader:
    def __init__(self):
        self.symptoms_data = None
        self.dog_genetics_data = None
        self.cat_data = None

    def load_real_datasets(self):
        datasets_loaded = 0
        
        # Pet Health Symptoms
        try:
            path = r"C:\Users\w11\Desktop\pet_digital_twin\data\raw\pet-health-symptoms-dataset.csv"
            self.symptoms_data = pd.read_csv(path)
            print(f"✅ Symptoms dataset: {len(self.symptoms_data)} kayıt")
            
            if 'condition' in self.symptoms_data.columns:
                condition_counts = self.symptoms_data['condition'].value_counts()
                print("   Condition dağılımı:")
                for condition, count in condition_counts.head().items():
                    print(f"     {condition}: {count}")
            
            datasets_loaded += 1
        except Exception as e:
            print(f"❌ Symptoms dataset yüklenemedi: {e}")
        
        # Dog Genetics
        try:
            path = r"C:\Users\w11\Desktop\pet_digital_twin\data\raw\dogs_filtrelenmişgenetik.csv"
            self.dog_genetics_data = pd.read_csv(path)
            print(f"✅ Dog genetics: {len(self.dog_genetics_data)} kayıt")
            datasets_loaded += 1
        except Exception as e:
            print(f"❌ Dog genetics yüklenemedi: {e}")
        
        # Cat Data
        try:
            path = r"C:\Users\w11\Desktop\pet_digital_twin\data\raw\dataset_stats.csv"
            self.cat_data = pd.read_csv(path)
            print(f"✅ Cat dataset: {len(self.cat_data)} kayıt")
            datasets_loaded += 1
        except Exception as e:
            print(f"❌ Cat dataset yüklenemedi: {e}")
        
        return datasets_loaded > 0
