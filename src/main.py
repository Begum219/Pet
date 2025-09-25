from data_loader import DataLoader
from preprocessing import Preprocessor
from model import PetModel
from clinical_recommendation import ClinicalRecommendation
from risk_calculator import RiskCalculator
import pandas as pd
import re

if __name__ == "__main__":
    print("🚀 IMPROVED HONEST PET DIAGNOSIS SYSTEM")
    
    # Initialize components
    loader = DataLoader()
    preprocessor = Preprocessor()
    model = PetModel()
    clinical = ClinicalRecommendation()
    risk = RiskCalculator()
    
    # Load datasets
    if not loader.load_real_datasets():
        print("❌ No datasets loaded")
        exit(1)
    
    # Extract clinical recommendations
    clinical.extract_real_clinical_recommendations(loader.symptoms_data)
    
    # Train model
    if model.train_improved_model(loader.symptoms_data, preprocessor):
        print(f"\n🎯 Model Accuracy (Overall): {model.actual_accuracy:.3f}\n")
        
        # Condition bazlı başarı
        print("📊 Condition bazlı başarı (f1-score):")
        for condition, metrics in model.actual_classification_report.items():
            if condition in loader.symptoms_data['condition'].unique():
                print(f" - {condition}: {metrics.get('f1-score', 0):.2f}")
        
        # Test cases
        test_cases = [
            "dog vomiting and diarrhea for 3 days not eating",
            "cat difficulty walking limping back leg",
            "visible worms in stool weight loss",
            "excessive scratching red skin patches",
            "The cat has had no appetite for a few days.",
            "the dog cannot walk."
        ]
        
        for i, case in enumerate(test_cases, 1):
            result = model.multi_label_diagnosis(case, preprocessor)
            print(f"\nTest {i}: '{case}'")
            
            primary = result.get('primary_diagnosis', {})
            print(f"   🎯 Primary Diagnosis: {primary.get('condition', 'Unknown')} ({primary.get('percentage', 0)}%)")
            print(f"   📊 Confidence: {primary.get('confidence_level', 'Unknown')}")
            print(f"   💡 Interpretation: {result.get('confidence_interpretation', 'N/A')}")
            
            # Diğer olası tanılar
            if result.get('multiple_possibilities', False) and len(result.get('possible_diagnoses', [])) > 1:
                print(f"   🔍 Other Possible Diagnoses:")
                for alt in result['possible_diagnoses'][1:]:
                    print(f"      - {alt.get('condition', 'Unknown')}: {alt.get('percentage', 0)}% ({alt.get('confidence_level', 'Unknown')})")
            
            # Klinikte öneriler
            if 'recommendations' in result and result['recommendations']:
                print(f"   💊 Clinical Recommendations: {', '.join(result['recommendations'])}")
            
    else:
        print("❌ Model training failed")
