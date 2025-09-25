import pandas as pd
import numpy as np
import os

class PetDigitalTwin:
    def __init__(self, merged_data_path):
        """Pet Digital Twin sistemini başlat"""
        self.data = pd.read_csv(merged_data_path, index_col='Breed')
        self.breeds = self.data.index.unique().tolist()
        
    def get_breed_info(self, breed):
        """Belirli bir breed için temel bilgileri getir"""
        breed = breed.lower().strip()
        if breed not in self.breeds:
            return None
            
        breed_data = self.data.loc[breed].iloc[0] if len(self.data.loc[breed].shape) > 1 else self.data.loc[breed]
        return breed_data
    
    def health_risk_assessment(self, breed, age, weight):
        """Sağlık riski hesaplama"""
        breed_info = self.get_breed_info(breed)
        if breed_info is None:
            return {"error": "Breed not found"}
        
        # Yaş riski
        max_life = breed_info['max_life_expectancy']
        age_risk = (age / max_life) * 100
        
        # Kilo riski
        max_weight = breed_info['max_weight_male']
        weight_risk = abs(weight - max_weight) / max_weight * 100
        
        # Toplam risk skoru
        total_risk = (age_risk + weight_risk) / 2
        
        return {
            "age_risk": age_risk,
            "weight_risk": weight_risk,
            "total_risk": total_risk,
            "risk_level": "Low" if total_risk < 30 else "Medium" if total_risk < 60 else "High"
        }
    
    def analyze_pet(self, pet_profile):
        """Kapsamlı pet analizi"""
        breed = pet_profile.get('breed')
        age = pet_profile.get('age')
        weight = pet_profile.get('weight')
        
        breed_info = self.get_breed_info(breed)
        if breed_info is None:
            return {"error": "Breed not found"}
        
        risk_assessment = self.health_risk_assessment(breed, age, weight)
        
        return {
            "breed_info": {
                "life_expectancy": f"{breed_info['min_life_expectancy']}-{breed_info['max_life_expectancy']} years",
                "trainability": breed_info['trainability'],
                "energy_level": breed_info['energy']
            },
            "risk_assessment": risk_assessment
        }
    
    def aging_simulation(self, breed, current_age, current_weight, years_ahead=3):
        """Gelecekteki yaş ve sağlık durumu simülasyonu"""
        future_age = current_age + years_ahead
        breed_info = self.get_breed_info(breed)
        
        if breed_info is None:
            return {"error": "Breed not found"}
        
        # Yaşla birlikte kilo değişimi tahmini (genel olarak %5-10 artış)
        weight_change_factor = 1 + (years_ahead * 0.02)  # Yılda %2 artış
        estimated_future_weight = current_weight * weight_change_factor
        
        # Mevcut ve gelecek risk karşılaştırması
        current_risk = self.health_risk_assessment(breed, current_age, current_weight)
        future_risk = self.health_risk_assessment(breed, future_age, estimated_future_weight)
        
        # Yaşam süresi kalan yıl hesaplaması
        max_life = breed_info['max_life_expectancy']
        remaining_years = max_life - future_age
        
        return {
            "current_status": {
                "age": current_age,
                "weight": current_weight,
                "risk_level": current_risk["risk_level"]
            },
            "future_projection": {
                "age": future_age,
                "estimated_weight": round(estimated_future_weight, 1),
                "risk_level": future_risk["risk_level"],
                "remaining_lifespan": max(0, remaining_years)
            },
            "risk_comparison": {
                "current_total_risk": round(current_risk["total_risk"], 1),
                "future_total_risk": round(future_risk["total_risk"], 1),
                "risk_increase": round(future_risk["total_risk"] - current_risk["total_risk"], 1)
            },
            "recommendations": self.get_aging_recommendations(future_risk["risk_level"], remaining_years)
        }

    def get_aging_recommendations(self, risk_level, remaining_years):
        """Yaş ve risk seviyesine göre öneriler"""
        if risk_level == "Low":
            return ["Mevcut bakım rutininizi sürdürün", "Düzenli egzersiz yapın", "Yıllık vet kontrollerini ihmal etmeyin"]
        elif risk_level == "Medium":
            return ["6 ayda bir veteriner kontrolü", "Beslenme planını gözden geçirin", "Kilo kontrolü yapın"]
        else:  # High
            return ["3 ayda bir veteriner kontrolü", "Özel diyet programı", "Aktivite seviyesini artırın", "Sağlık takibini sıklaştırın"]

    def condition_specific_risk_assessment(self, breed, age, pet_type="dog"):
        """5 spesifik hastalık kategorisi için risk değerlendirmesi"""
        # Pet Health Symptoms dataset'inden elde edilen base risk oranları
        base_risks = {
            "Ear Infections": 0.25,      # En yaygın (182 kayıt)
            "Digestive Issues": 0.24,    # 181 kayıt
            "Skin Irritations": 0.23,    # 176 kayıt
            "Mobility Problems": 0.22,   # 176 kayıt
            "Parasites": 0.20           # En az (157 kayıt)
        }
        
        condition_risks = {}
        
        for condition, base_risk in base_risks.items():
            # Yaş faktörü (yaşla artış)
            age_multiplier = 1 + (age * 0.05)
            
            # Pet türü faktörü
            if condition == "Mobility Problems" and pet_type == "dog":
                type_multiplier = 1.2  # Köpeklerde daha yaygın (105 vs 71)
            elif condition == "Digestive Issues" and pet_type == "cat":
                type_multiplier = 1.1  # Kedilerde hafif yüksek (94 vs 87)
            else:
                type_multiplier = 1.0
            
            # Breed spesifik faktör
            breed_multiplier = self.get_breed_condition_multiplier(breed, condition)
            
            # Final risk hesaplama
            final_risk = min(1.0, base_risk * age_multiplier * type_multiplier * breed_multiplier)
            condition_risks[condition] = round(final_risk * 100, 1)  # Yüzde olarak
        
        return condition_risks

    def get_breed_condition_multiplier(self, breed, condition):
        """Breed bazlı hastalık risk çarpanları"""
        breed_risk_factors = {
            "labrador retriever": {
                "Ear Infections": 1.2,     # Floppy ears
                "Mobility Problems": 1.3,  # Hip dysplasia eğilimi
                "Digestive Issues": 1.0,
                "Skin Irritations": 1.1,   # Alerjiye eğilim
                "Parasites": 1.0
            },
            "golden retriever": {
                "Skin Irritations": 1.3,   # Alerjik dermatit
                "Ear Infections": 1.2,     # Floppy ears
                "Mobility Problems": 1.2,
                "Digestive Issues": 1.0,
                "Parasites": 1.0
            },
            "german shepherd": {
                "Mobility Problems": 1.4,  # Hip/elbow dysplasia
                "Digestive Issues": 1.2,   # Sensitive stomach
                "Skin Irritations": 1.1,
                "Ear Infections": 1.0,
                "Parasites": 1.0
            }
        }
        
        return breed_risk_factors.get(breed, {}).get(condition, 1.0)

    def condition_aging_simulation(self, breed, current_age, pet_type="dog", years_ahead=3):
        """5 hastalık kategorisi için yaşlanma simülasyonu"""
        current_risks = self.condition_specific_risk_assessment(breed, current_age, pet_type)
        future_risks = self.condition_specific_risk_assessment(breed, current_age + years_ahead, pet_type)
        
        risk_changes = {}
        for condition in current_risks.keys():
            change = future_risks[condition] - current_risks[condition]
            risk_changes[condition] = {
                "current_risk": current_risks[condition],
                "future_risk": future_risks[condition],
                "risk_increase": round(change, 1)
            }
        
        return {
            "current_condition_risks": current_risks,
            "future_condition_risks": future_risks,
            "risk_changes": risk_changes,
            "highest_risk_condition": max(future_risks, key=future_risks.get),
            "recommendations": self.get_condition_recommendations(future_risks)
        }

    def get_condition_recommendations(self, condition_risks):
        """Hastalık risklerine göre öneriler"""
        recommendations = []
        
        for condition, risk in condition_risks.items():
            if risk > 40:  # Yüksek risk
                if condition == "Ear Infections":
                    recommendations.append("Kulakları haftalık temizleyin, nem kontrolü yapın")
                elif condition == "Mobility Problems":
                    recommendations.append("Eklem destekleyici supplement, düzenli hafif egzersiz")
                elif condition == "Skin Irritations":
                    recommendations.append("Allerjen testi, özel şampuan kullanımı")
                elif condition == "Digestive Issues":
                    recommendations.append("Probiyotik desteği, hassas mide diyeti")
                elif condition == "Parasites":
                    recommendations.append("3 ayda bir parazit kontrolü, hijyen önlemleri")
        
        return recommendations

# Test kodu
if __name__ == "__main__":
    data_path = r"C:\Users\w11\Desktop\pet_digital_twin\data\processed\merged_dog_data.csv"
    twin = PetDigitalTwin(data_path)
    
    # Test pet
    test_pet = {
        "breed": "labrador retriever",
        "age": 5,
        "weight": 20
    }
    
    # Mevcut analiz
    current_result = twin.analyze_pet(test_pet)
    print("=== MEVCUT DURUM ===")
    print(current_result)
    print()
    
    # Yaşlanma simülasyonu
    aging_result = twin.aging_simulation(
        test_pet["breed"], 
        test_pet["age"], 
        test_pet["weight"], 
        years_ahead=3
    )
    print("=== 3 YIL SONRASI PROJEKSIYON ===")
    print(aging_result)
    print()
    
    # 5 Hastalık riski analizi
    condition_result = twin.condition_specific_risk_assessment(
        test_pet["breed"], 
        test_pet["age"], 
        "dog"
    )
    print("=== 5 HASTALIK KATEGORİSİ RİSK ANALİZİ ===")
    for condition, risk in condition_result.items():
        print(f"{condition}: %{risk} risk")
    print()

    # Hastalık bazlı yaşlanma simülasyonu
    condition_aging = twin.condition_aging_simulation(
        test_pet["breed"], 
        test_pet["age"], 
        "dog", 
        years_ahead=3
    )
    print("=== HASTALIK BAZLI YAŞLANMA SİMÜLASYONU ===")
    print(condition_aging)