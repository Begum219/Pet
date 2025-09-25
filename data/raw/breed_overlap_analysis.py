import pandas as pd
import numpy as np
from difflib import SequenceMatcher
import re

class BreedOverlapAnalyzer:
    def __init__(self, ranked_df, akc_df):
        """
        ranked_df: Dog Breeds Ranked dataset (87 breeds)
        akc_df: AKC Dog Breeds dataset (277 breeds)
        """
        self.ranked_df = ranked_df
        self.akc_df = akc_df
        
    def normalize_breed_name(self, name):
        """Breed isimlerini standardize et"""
        if pd.isna(name):
            return ""
        
        # String'e çevir ve küçük harfe
        name = str(name).lower().strip()
        
        # Yaygın kelime değişimlerini standartlaştır
        replacements = {
            'retriever': 'retriever',
            'shepherd': 'shepherd', 
            'terrier': 'terrier',
            'spaniel': 'spaniel',
            'pointer': 'pointer',
            'setter': 'setter',
            'mastiff': 'mastiff',
            'bulldog': 'bulldog',
            'hound': 'hound'
        }
        
        # Özel karakterleri temizle
        name = re.sub(r'[^\w\s]', '', name)
        
        # Ekstra boşlukları temizle
        name = ' '.join(name.split())
        
        return name
    
    def calculate_similarity(self, name1, name2):
        """İki breed ismi arasındaki benzerlik oranını hesapla"""
        return SequenceMatcher(None, name1, name2).ratio()
    
    def find_exact_matches(self):
        """Tam eşleşen breed isimlerini bul"""
        ranked_breeds = set(self.ranked_df.iloc[:, 0].apply(self.normalize_breed_name))
        akc_breeds = set(self.akc_df.iloc[:, 0].apply(self.normalize_breed_name))
        
        # Boş stringleri çıkar
        ranked_breeds.discard("")
        akc_breeds.discard("")
        
        exact_matches = ranked_breeds.intersection(akc_breeds)
        
        return {
            'exact_matches': exact_matches,
            'ranked_only': ranked_breeds - akc_breeds,
            'akc_only': akc_breeds - ranked_breeds,
            'total_ranked': len(ranked_breeds),
            'total_akc': len(akc_breeds),
            'match_count': len(exact_matches)
        }
    
    def find_fuzzy_matches(self, threshold=0.8):
        """Benzer isimleri bul (fuzzy matching)"""
        ranked_breeds = [self.normalize_breed_name(name) for name in self.ranked_df.iloc[:, 0] if pd.notna(name)]
        akc_breeds = [self.normalize_breed_name(name) for name in self.akc_df.iloc[:, 0] if pd.notna(name)]
        
        fuzzy_matches = []
        
        for ranked_breed in ranked_breeds:
            best_match = None
            best_score = 0
            
            for akc_breed in akc_breeds:
                similarity = self.calculate_similarity(ranked_breed, akc_breed)
                if similarity > best_score and similarity >= threshold:
                    best_score = similarity
                    best_match = akc_breed
            
            if best_match:
                fuzzy_matches.append({
                    'ranked_breed': ranked_breed,
                    'akc_breed': best_match,
                    'similarity': best_score
                })
        
        return fuzzy_matches
    
    def comprehensive_analysis(self):
        """Kapsamlı overlap analizi"""
        print("🔍 DOG BREEDS DATASET OVERLAP ANALİZİ")
        print("=" * 50)
        
        # Exact matches
        exact_results = self.find_exact_matches()
        
        print(f"📊 TEMEL İSTATİSTİKLER:")
        print(f"   • Dog Breeds Ranked: {exact_results['total_ranked']} breed")
        print(f"   • AKC Dataset: {exact_results['total_akc']} breed")
        print(f"   • Tam Eşleşme: {exact_results['match_count']} breed")
        print(f"   • Overlap Oranı: {exact_results['match_count']/exact_results['total_ranked']*100:.1f}%")
        print()
        
        # Fuzzy matches
        fuzzy_results = self.find_fuzzy_matches(threshold=0.8)
        
        print(f"🔍 BENZER İSİMLER (≥80% benzerlik):")
        print(f"   • Ek Eşleşme: {len(fuzzy_results)} breed")
        print()
        
        # Toplam overlap
        total_matches = exact_results['match_count'] + len(fuzzy_results)
        total_overlap_rate = total_matches / exact_results['total_ranked'] * 100
        
        print(f"📈 TOPLAM OVERLAP:")
        print(f"   • Toplam Eşleşme: {total_matches} breed")
        print(f"   • Toplam Overlap Oranı: {total_overlap_rate:.1f}%")
        print()
        
        # Karar önerisi
        print("🎯 ÖNERİ:")
        if total_overlap_rate >= 70:
            print("   ✅ YÜKSEK OVERLAP - Veri setlerini birleştirin!")
            print("   • Zengin breed profilleri oluşturabilirsiniz")
            print("   • Cross-validation yapabilirsiniz")
        elif total_overlap_rate >= 50:
            print("   🟡 ORTA OVERLAP - Dikkatli birleştirme yapın")
            print("   • Sadece eşleşen breedler için birleştirin")
            print("   • Diğerlerini ayrı tutun")
        else:
            print("   ❌ DÜŞÜK OVERLAP - Ayrı ayrı kullanın")
            print("   • Her dataset'i kendi amaçları için kullanın")
            print("   • Birleştirme yapmayın")
        
        print()
        
        # Detaylı sonuçlar
        if exact_results['match_count'] > 0:
            print("📋 TAM EŞLEŞEN BREEDS (ilk 10):")
            for i, breed in enumerate(list(exact_results['exact_matches'])[:10]):
                print(f"   {i+1:2d}. {breed}")
            if len(exact_results['exact_matches']) > 10:
                print(f"   ... ve {len(exact_results['exact_matches'])-10} tane daha")
            print()
        
        if len(fuzzy_results) > 0:
            print("🔍 BENZER İSİMLER (ilk 5):")
            for i, match in enumerate(fuzzy_results[:5]):
                print(f"   {i+1}. {match['ranked_breed']} ≈ {match['akc_breed']} ({match['similarity']:.2f})")
            print()
        
        return {
            'exact_matches': exact_results,
            'fuzzy_matches': fuzzy_results,
            'total_overlap_rate': total_overlap_rate,
            'recommendation': 'merge' if total_overlap_rate >= 70 else 'separate' if total_overlap_rate < 50 else 'partial'
        }

# GERÇEK VERİ İLE KULLANIM:
def analyze_real_data():
    """Gerçek veri dosyalarıyla overlap analizi"""
    try:
        # Veri dosyalarını yükle
        dogs_demographics = pd.read_csv(r'C:\Users\w11\Desktop\pet_digital_twin\data\raw\breed_demographics\dogs_dataset.csv')
        dog_breeds = pd.read_csv(r'C:\Users\w11\Desktop\pet_digital_twin\data\raw\dog_breeds.csv')
        
        print("📁 VERİ DOSYALARI YÜKLENDİ:")
        print(f"   • Dogs Demographics: {len(dogs_demographics)} kayıt")
        print(f"   • Dog Breeds: {len(dog_breeds)} kayıt")
        print()
        
        # Kolon isimlerini kontrol et
        print("📋 KOLON İSİMLERİ:")
        print(f"   • Dogs Demographics: {list(dogs_demographics.columns)}")
        print(f"   • Dog Breeds: {list(dog_breeds.columns)}")
        print()
        
        # Breed kolon ismini bul
        demo_breed_col = None
        breeds_breed_col = None
        
        for col in dogs_demographics.columns:
            if 'breed' in col.lower():
                demo_breed_col = col
                break
        
        for col in dog_breeds.columns:
            if 'breed' in col.lower() or 'name' in col.lower():
                breeds_breed_col = col
                break
        
        if demo_breed_col and breeds_breed_col:
            print(f"✅ BREED KOLONLARI BULUNDU:")
            print(f"   • Demographics breed kolonu: '{demo_breed_col}'")
            print(f"   • Breeds breed kolonu: '{breeds_breed_col}'")
            print()
            
            # Analizi çalıştır
            analyzer = BreedOverlapAnalyzer(
                dogs_demographics[[demo_breed_col]].rename(columns={demo_breed_col: 'Breed'}),
                dog_breeds[[breeds_breed_col]].rename(columns={breeds_breed_col: 'Breed'})
            )
            
            results = analyzer.comprehensive_analysis()
            return results
        else:
            print("❌ BREED KOLONLARI BULUNAMADI")
            print("Lütfen dosyalardaki kolon isimlerini kontrol edin")
            
    except FileNotFoundError as e:
        print(f"❌ DOSYA BULUNAMADI: {e}")
        print("Dosya yollarını kontrol edin")
    except Exception as e:
        print(f"❌ HATA OLUŞTU: {e}")

# Gerçek analizi çalıştır
if __name__ == "__main__":
    print("🚀 PET DIGITAL TWIN - BREED OVERLAP ANALİZİ")
    print("=" * 60)
    print()
    
    analyze_real_data()

# Manuel test için örnek veri
def create_sample_data():
    """Test için örnek veri oluştur"""
    
    # Örnek Ranked dataset
    ranked_sample = pd.DataFrame({
        'Breed': [
            'Golden Retriever', 'Labrador Retriever', 'German Shepherd',
            'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier',
            'Dachshund', 'Siberian Husky', 'Great Dane', 'Chihuahua'
        ]
    })
    
    # Örnek AKC dataset  
    akc_sample = pd.DataFrame({
        'name': [
            'golden retriever', 'labrador retriever', 'german shepherd dog',
            'bulldog', 'poodle', 'beagle', 'rottweiler', 'yorkshire terrier',
            'dachshund', 'siberian husky', 'great dane', 'chihuahua',
            'border collie', 'australian shepherd', 'boston terrier',
            'shih tzu', 'boxer', 'cocker spaniel'
        ]
    })
    
    print("🧪 TEST VERISI İLE OVERLAP ANALİZİ:")
    print("=" * 50)
    
    analyzer = BreedOverlapAnalyzer(ranked_sample, akc_sample)
    results = analyzer.comprehensive_analysis()
    
    return results

# Test çalıştır
if __name__ == "__main__":
    create_sample_data()