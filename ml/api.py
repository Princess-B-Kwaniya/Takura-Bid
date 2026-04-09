import pandas as pd
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os

# Initialize FastAPI app
app = FastAPI(
    title="TakuraBid ML API",
    description="Intelligent Pricing Engine for Zimbabwean Logistics",
    version="1.0.0"
)

# Define file paths
ARTIFACT_PATH = os.path.join(os.path.dirname(__file__), 'data', 'takurabid_model_artifacts.pkl')

# Global variables for model and artifacts
model_artifacts = None

def load_artifacts():
    global model_artifacts
    if not os.path.exists(ARTIFACT_PATH):
        raise FileNotFoundError(f"Artifacts not found at {ARTIFACT_PATH}. Please run the notebook export cell first.")
    model_artifacts = joblib.load(ARTIFACT_PATH)

# Request Schema
class BidRequest(BaseModel):
    Route: str
    Distance_KM: float
    Toll_Count: int
    Border_Fee: float
    Vehicle_Class: str  # e.g., '5t', '14t', '30t'
    Urgency: int        # 1-5
    Is_Backhaul: int      # 0 or 1
    Road_Quality: int     # 1-5
    Fuel_Price: float = 1.68
    Demand_Signal: float = 0.72

@app.on_event("startup")
async def startup_event():
    try:
        load_artifacts()
        print("Model and artifacts loaded successfully.")
    except Exception as e:
        print(f"Error loading artifacts: {e}")

@app.get("/")
def read_root():
    return {"status": "online", "model": "TakuraBid-Stacking-Ensemble", "usage": "/docs"}

@app.post("/predict")
def predict_bid(request: BidRequest):
    if model_artifacts is None:
        raise HTTPException(status_code=500, detail="Model artifacts not loaded.")

    try:
        # 1. Convert request into DataFrame
        input_dict = request.dict()
        df = pd.DataFrame([input_dict])

        # 2. Extract needed components
        encoder = model_artifacts['encoder']
        scaler = model_artifacts['scaler']
        model = model_artifacts['model']
        feature_cols = model_artifacts['feature_cols']

        # 3. Pre-processing (Reproduce standardized pipeline)
        
        # Target Encoding for Route
        df_encoded = encoder.transform(df)

        # One-Hot Encoding for Vehicle_Class
        df_final = pd.get_dummies(df_encoded, columns=['Vehicle_Class'])
        
        # Ensure all training columns exist (handling missing Vehicle classes)
        for col in feature_cols:
            if col not in df_final.columns:
                df_final[col] = 0
        
        # Reorder to match training set exactly
        df_final = df_final[feature_cols]

        # 4. Scaling
        df_scaled = scaler.transform(df_final)

        # 5. Inference
        prediction = model.predict(df_scaled)[0]

        return {
            "suggested_bid_usd": round(float(prediction), 2),
            "currency": "USD",
            "model_version": "1.0.0"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
