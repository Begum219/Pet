from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
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

app = FastAPI(
    title="🐾 Pet Health Diagnosis API", 
    version="1.0.0",
    description="AI-powered pet health diagnosis system with symptom analysis"
)

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
    
    class Config:
        schema_extra = {
            "example": {
                "symptoms": "dog vomiting and diarrhea for 3 days not eating",
                "pet_type": "dog"
            }
        }

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

@app.get("/", include_in_schema=False)
async def root():
    """Ana sayfa - Swagger'a yönlendir"""
    return RedirectResponse(url="/docs")

@app.post("/predict", response_model=DiagnosisResponse, summary="Pet Health Diagnosis", 
          description="Analyze pet symptoms and provide diagnosis with recommendations")
async def predict_diagnosis(request: SymptomRequest):
    """Ana tanı fonksiyonu - Pet semptomlarını analiz eder ve tanı önerir"""
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

@app.get("/status", summary="API Status", description="Get API status and model information")
async def api_status():
    """API durumu ve model bilgileri"""
    return {
        "message": "🐾 Pet Health Diagnosis API is running!",
        "version": "1.0.0",
        "model_loaded": model is not None,
        "model_accuracy": round(model.actual_accuracy, 3) if model else None,
        "total_conditions": len(loader.symptoms_data['condition'].unique()) if loader else None,
        "total_records": len(loader.symptoms_data) if loader else None
    }

@app.get("/health", summary="Health Check", description="System health and component status")
async def health_check():
    """Sistem sağlık kontrolü"""
    return {
        "status": "healthy" if all([loader, preprocessor, model, clinical, risk]) else "unhealthy",
        "components": {
            "data_loader": loader is not None,
            "preprocessor": preprocessor is not None,
            "model": model is not None,
            "clinical": clinical is not None,
            "risk": risk is not None
        },
        "model_accuracy": round(model.actual_accuracy, 3) if model else None
    }

@app.post("/test", summary="Test Diagnosis", description="Run predefined test cases for diagnosis")
async def test_diagnosis():
    """Test tanı - birkaç örnek case"""
    test_cases = [
        "dog vomiting and diarrhea for 3 days not eating",
        "cat difficulty walking limping back leg", 
        "visible worms in stool weight loss",
        "excessive scratching red skin patches",
        "cat has had no appetite for a few days"
    ]
    
    results = []
    for case in test_cases:
        try:
            result = model.multi_label_diagnosis(case, preprocessor)
            primary = result.get('primary_diagnosis', {})
            results.append({
                "input": case,
                "diagnosis": primary.get('condition', 'Unknown'),
                "confidence": primary.get('percentage', 0),
                "confidence_level": primary.get('confidence_level', 'Unknown'),
                "recommendations": result.get('recommendations', [])
            })
        except Exception as e:
            results.append({
                "input": case,
                "error": str(e)
            })
    
    return {
        "test_results": results,
        "total_tests": len(test_cases),
        "successful_tests": len([r for r in results if 'error' not in r])
    }

@app.get("/nearby_vets", summary="Get Nearby Veterinarians")
async def get_nearby_vets(lat: float, lng: float, radius: int = 10000):
    """OpenStreetMap Overpass API - Ücretsiz gerçek veteriner verileri"""
    try:
        import requests
        
        # Overpass API query
        overpass_url = "https://overpass-api.de/api/interpreter"
        
        # Radius'u metre cinsinden kullan
        query = f"""
        [out:json];
        (
          node["amenity"="veterinary"](around:{radius},{lat},{lng});
          way["amenity"="veterinary"](around:{radius},{lat},{lng});
          relation["amenity"="veterinary"](around:{radius},{lat},{lng});
        );
        out center;
        """
        
        response = requests.post(overpass_url, data={"data": query}, timeout=30)
        data = response.json()
        
        results = []
        for element in data.get("elements", []):
            # Koordinatları al
            if element["type"] == "node":
                coords_lat = element["lat"]
                coords_lng = element["lon"]
            else:
                coords_lat = element.get("center", {}).get("lat")
                coords_lng = element.get("center", {}).get("lon")
            
            if not coords_lat or not coords_lng:
                continue
                
            tags = element.get("tags", {})
            
            result = {
                "place_id": f"osm_{element['type']}_{element['id']}",
                "name": tags.get("name", "İsimsiz Veteriner"),
                "vicinity": tags.get("addr:street", "") + " " + tags.get("addr:city", ""),
                "geometry": {
                    "location": {
                        "lat": coords_lat,
                        "lng": coords_lng
                    }
                },
                "rating": None,
                "opening_hours": {
                    "open_now": None
                }
            }
            results.append(result)
        
        return {
            "status": "OK",
            "results": results[:20]
        }
            
    except Exception as e:
        print(f"Overpass API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/vet_details", summary="Get Vet Details")
async def get_vet_details(place_id: str):
    """OpenStreetMap'ten detay bilgileri"""
    try:
        import requests
        
        # place_id formatı: osm_node_123456
        parts = place_id.split("_")
        if len(parts) != 3:
            return {"status": "OK", "result": {"formatted_phone_number": "Telefon bilgisi yok"}}
        
        element_type = parts[1]
        element_id = parts[2]
        
        # OSM'den detay çek
        osm_url = f"https://www.openstreetmap.org/api/0.6/{element_type}/{element_id}.json"
        response = requests.get(osm_url, timeout=10)
        data = response.json()
        
        tags = data.get("elements", [{}])[0].get("tags", {})
        phone = tags.get("phone", tags.get("contact:phone", "Telefon bilgisi yok"))
        
        return {
            "status": "OK",
            "result": {"formatted_phone_number": phone}
        }
            
    except Exception as e:
        return {"status": "OK", "result": {"formatted_phone_number": "Telefon bilgisi yok"}}

if __name__ == "__main__":
    print("🎯 Starting Pet Diagnosis API...")
    
    # Önce modeli yükle
    if initialize_model():
        
        print("📋 API will automatically open Swagger UI documentation")
        print("📋 Available endpoints:")
        print("   • GET  /docs      - Swagger UI (opens automatically)")
        print("   • GET  /status    - API status")  
        print("   • GET  /health    - System health")
        print("   • POST /predict   - Diagnosis prediction")
        print("   • POST /test      - Test diagnosis")
        print("   • GET  /nearby_vets - Nearby veterinarians (OpenStreetMap)")
        print("   • GET  /vet_details - Veterinarian details")
        print("api için tıklayabilirsiniz: http://10.212.87.189:8001")
        uvicorn.run(app, host="0.0.0.0", port=8001)

    else:
        print("❌ Failed to initialize model. Cannot start API.")
        print("🔍 Check if these files exist in src folder:")
        print("   • data/raw/pet-health-symptoms-dataset.csv")
        print("   • model.py, data_loader.py, preprocessing.py")
        exit(1)