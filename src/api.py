from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import sys
import os
from typing import Optional, List, Dict, Any

# Bir üst klasördeki dosyalara erişmek için
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Gerçek kodlarınızı import edin
from data_loader import DataLoader
from preprocessing import Preprocessor
from model import PetModel
from clinical_recommendation import ClinicalRecommendation
from risk_calculator import RiskCalculator

app = FastAPI(title="Pet Health Diagnosis API", version="1.0.0")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global components
loader = None
preprocessor = None
model = None
clinical = None
risk = None

class SymptomRequest(BaseModel):
    symptoms: str
    pet_type: str = "dog"

class DiagnosisResponse(BaseModel):
    primary_diagnosis: Dict[str, Any]
    possible_diagnoses: List[Dict[str, Any]]
    multiple_possibilities: bool
    confidence_interpretation: str
    recommendations: List[str]
    risk_level: Optional[str] = None

def initialize_model():
    """Model ve veriyi yükle"""
    global loader, preprocessor, model, clinical, risk
    
    print("🚀 LOADING PET DIAGNOSIS SYSTEM...")
    
    try:
        # Initialize components
        loader = DataLoader()
        preprocessor = Preprocessor()
        model = PetModel()
        clinical = ClinicalRecommendation()
        risk = RiskCalculator()
        
        print("📦 Components initialized...")
        
        # Load datasets
        if not loader.load_real_datasets():
            print("❌ No datasets loaded")
            return False
        
        print("📊 Datasets loaded...")
        
        # Extract clinical recommendations
        clinical.extract_real_clinical_recommendations(loader.symptoms_data)
        print("💊 Clinical recommendations extracted...")
        
        # Train model
        if model.train_improved_model(loader.symptoms_data, preprocessor):
            print(f"✅ Model loaded successfully! Accuracy: {model.actual_accuracy:.3f}")
            return True
        else:
            print("❌ Model training failed")
            return False
            
    except Exception as e:
        print(f"❌ Initialization error: {str(e)}")
        return False

@app.post("/predict", response_model=DiagnosisResponse)
async def predict_diagnosis(request: SymptomRequest):
    """Ana tanı fonksiyonu"""
    try:
        if not model or not preprocessor:
            raise HTTPException(status_code=500, detail="Model not initialized")
        
        # Gerçek model ile tanı yap
        result = model.multi_label_diagnosis(request.symptoms, preprocessor)
        
        # Risk hesapla (eğer risk_calculator'da böyle bir fonksiyon varsa)
        risk_level = None
        try:
            # Bu kısmı risk_calculator.py'deki gerçek fonksiyona göre ayarlayın
            # risk_level = risk.calculate_risk(result)
            pass
        except:
            risk_level = "Unknown"
        
        # API response formatına dönüştür
        api_response = DiagnosisResponse(
            primary_diagnosis=result.get('primary_diagnosis', {}),
            possible_diagnoses=result.get('possible_diagnoses', []),
            multiple_possibilities=result.get('multiple_possibilities', False),
            confidence_interpretation=result.get('confidence_interpretation', ''),
            recommendations=result.get('recommendations', []),
            risk_level=risk_level
        )
        
        return api_response
        
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/")
async def root():
    """API durumu"""
    return {
        "message": "🐾 Pet Health Diagnosis API is running!",
        "version": "1.0.0",
        "model_loaded": model is not None,
        "accuracy": model.actual_accuracy if model else None
    }

@app.get("/health")
async def health_check():
    """Sistem sağlık kontrolü"""
    return {
        "status": "healthy",
        "components": {
            "data_loader": loader is not None,
            "preprocessor": preprocessor is not None,
            "model": model is not None,
            "clinical": clinical is not None,
            "risk": risk is not None
        }
    }

@app.post("/test")
async def test_diagnosis():
    """Test tanı - birkaç örnek case"""
    test_cases = [
        "dog vomiting and diarrhea for 3 days not eating",
        "cat difficulty walking limping back leg",
        "visible worms in stool weight loss"
    ]
    
    results = []
    for case in test_cases:
        try:
            result = model.multi_label_diagnosis(case, preprocessor)
            results.append({
                "input": case,
                "diagnosis": result.get('primary_diagnosis', {}).get('condition', 'Unknown'),
                "confidence": result.get('primary_diagnosis', {}).get('percentage', 0)
            })
        except Exception as e:
            results.append({
                "input": case,
                "error": str(e)
            })
    
    return {"test_results": results}

if __name__ == "__main__":
    print("🎯 Starting Pet Diagnosis API...")
    
    # Önce modeli yükle
    if initialize_model():
        print("🚀 Starting API server on http://localhost:8000")
        print("📋 Available endpoints:")
        print("   • GET  /          - API status")  
        print("   • GET  /health    - System health")
        print("   • POST /predict   - Diagnosis prediction")
        print("   • POST /test      - Test diagnosis")
        uvicorn.run(app, host="0.0.0.0", port=8000)
    else:
        print("❌ Failed to initialize model. Cannot start API.")
        print("🔍 Check if these files exist in src folder:")
        print("   • data/raw/pet-health-symptoms-dataset.csv")
        print("   • model.py, data_loader.py, preprocessing.py")
        exit(1)