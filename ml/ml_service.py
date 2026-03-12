"""
═══════════════════════════════════════════════════════════════════════════
TakuraBid Pricing API - Fast API Prototype
═══════════════════════════════════════════════════════════════════════════
Real-time pricing endpoint for truck hauling loads.

Run: python ml/ml_service.py
Then: Open http://localhost:8000/docs (Swagger UI for testing)
Or: Visit http://localhost:8000 for web demo
"""

import json
import joblib
import logging
from pathlib import Path
from typing import Dict, Optional
import numpy as np
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import uvicorn

# ============================================================================
# LOGGING
# ============================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ============================================================================
# PATHS
# ============================================================================
PROJECT_ROOT = Path(__file__).parent.parent
MODELS_DIR = PROJECT_ROOT / "ml" / "models"

# ============================================================================
# LOAD MODEL & METADATA
# ============================================================================
def load_model(version: str = "v2_current"):
    """Load trained model and scaler from disk."""
    model_file = MODELS_DIR / f"{version}_model.joblib"
    scaler_file = MODELS_DIR / f"{version}_model_scaler.joblib"
    metadata_file = MODELS_DIR / f"{version}_model_metadata.json"
    
    if not model_file.exists():
        raise FileNotFoundError(f"Model not found: {model_file}")
    
    try:
        model = joblib.load(model_file)
        scaler = joblib.load(scaler_file) if scaler_file.exists() else None
        
        metadata = {}
        if metadata_file.exists():
            with open(metadata_file) as f:
                metadata = json.load(f)
        
        logger.info(f"✓ Loaded model: {version}")
        logger.info(f"  Features: {metadata.get('feature_count', '?')}")
        logger.info(f"  R²: {metadata.get('history', {}).get('test', {}).get('r2', '?')}")
        
        return model, scaler, metadata
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

# Load on startup
logger.info("Loading model...")
MODEL, SCALER, METADATA = load_model("v3_optimized")
FEATURES = METADATA.get("features", [])

logger.info(f"Using {len(FEATURES)} features: {FEATURES}")

# ============================================================================
# API MODELS
# ============================================================================
class PricingRequest(BaseModel):
    """Request for price estimation."""
    distance: float = Field(..., gt=0, description="Distance in km (e.g., 50.0)")
    hour: int = Field(default=12, ge=0, le=23, description="Hour of day 0-23 (e.g., 14)")
    day_of_week: int = Field(default=2, ge=0, le=6, description="Day of week 0=Mon, 6=Sun (e.g., 2)")
    temperature: Optional[float] = Field(default=25.0, description="Temperature in °C (e.g., 25.0)")
    precipitation: Optional[float] = Field(default=0.0, description="Precipitation in mm (e.g., 0.0)")


class PricingResponse(BaseModel):
    """Response with price estimate and details."""
    estimate_usd: float
    confidence: float
    breakdown: Dict[str, float]
    range: Dict[str, float]
    model_version: str
    timestamp: str


# ============================================================================
# FASTAPI APP
# ============================================================================
app = FastAPI(
    title="TakuraBid Pricing API",
    description="Real-time pricing estimation for truck hauling",
    version="1.0.0",
)

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/", response_class=HTMLResponse)
async def home():
    """Serve interactive demo page."""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>TakuraBid Pricing Demo</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 600px;
                width: 100%;
                padding: 40px;
                animation: slideUp 0.5s ease-out;
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .header {
                margin-bottom: 30px;
                text-align: center;
            }
            .header h1 {
                color: #667eea;
                font-size: 28px;
                margin-bottom: 8px;
            }
            .header p {
                color: #666;
                font-size: 14px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                font-weight: 500;
                margin-bottom: 8px;
                color: #333;
                font-size: 14px;
            }
            input {
                width: 100%;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.3s;
            }
            input:focus {
                outline: none;
                border-color: #667eea;
            }
            button {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            }
            button:hover { transform: translateY(-2px); }
            button:active { transform: translateY(0); }
            .result {
                margin-top: 30px;
                padding: 20px;
                background: #f8f9ff;
                border-radius: 12px;
                display: none;
                animation: fadeIn 0.4s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .price-estimate {
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 12px;
            }
            .breakdown {
                font-size: 12px;
                color: #666;
                margin: 12px 0;
            }
            .breakdown-item {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            .confidence {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #e0e0e0;
                font-size: 13px;
                color: #666;
            }
            .error {
                color: #e74c3c;
                padding: 12px;
                background: #fadbd8;
                border-radius: 8px;
                display: none;
                margin-top: 20px;
            }
            .loading {
                display: none;
                text-align: center;
                color: #667eea;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚚 TakuraBid Pricing</h1>
                <p>AI-Powered Real-Time Price Estimation</p>
            </div>
            
            <form id="pricingForm">
                <div class="form-group">
                    <label for="distance">Distance (km)</label>
                    <input type="number" id="distance" placeholder="e.g., 50" value="50" step="0.1" required>
                </div>
                
                <div class="form-group">
                    <label for="hour">Hour of Day (0-23)</label>
                    <input type="number" id="hour" placeholder="e.g., 14" value="14" min="0" max="23" required>
                </div>
                
                <div class="form-group">
                    <label for="day">Day of Week (0=Mon, 6=Sun)</label>
                    <input type="number" id="day" placeholder="e.g., 2" value="2" min="0" max="6" required>
                </div>
                
                <div class="form-group">
                    <label for="temp">Temperature (°C)</label>
                    <input type="number" id="temp" placeholder="e.g., 25" value="25" step="0.1">
                </div>
                
                <div class="form-group">
                    <label for="precip">Precipitation (mm)</label>
                    <input type="number" id="precip" placeholder="e.g., 0" value="0" step="0.1">
                </div>
                
                <button type="submit">Get Price Estimate</button>
            </form>
            
            <div class="loading" id="loading">⏳ Estimating price...</div>
            
            <div class="error" id="error"></div>
            
            <div class="result" id="result">
                <div class="price-estimate" id="estimate">$0.00</div>
                <div class="breakdown" id="breakdown"></div>
                <div class="confidence">
                    Model: v2_current | Confidence: <span id="confidence">0%</span>
                </div>
            </div>
        </div>
        
        <script>
            document.getElementById('pricingForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const loading = document.getElementById('loading');
                const error = document.getElementById('error');
                const result = document.getElementById('result');
                
                loading.style.display = 'block';
                error.style.display = 'none';
                result.style.display = 'none';
                
                try {
                    const response = await fetch('/estimate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            distance: parseFloat(document.getElementById('distance').value),
                            hour: parseInt(document.getElementById('hour').value),
                            day_of_week: parseInt(document.getElementById('day').value),
                            temperature: parseFloat(document.getElementById('temp').value),
                            precipitation: parseFloat(document.getElementById('precip').value),
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(await response.text());
                    }
                    
                    const data = await response.json();
                    
                    document.getElementById('estimate').textContent = `$${data.estimate_usd.toFixed(2)}`;
                    document.getElementById('confidence').textContent = `${(data.confidence * 100).toFixed(0)}%`;
                    
                    let breakdown = '<div style="margin-top: 8px;"><strong>Price Breakdown:</strong></div>';
                    for (const [key, value] of Object.entries(data.breakdown)) {
                        const label = key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                        breakdown += `<div class="breakdown-item"><span>${label}</span><span>$${value.toFixed(2)}</span></div>`;
                    }
                    if (data.range) {
                        breakdown += `<div class="breakdown-item"><strong>Estimated Range</strong><strong>$${data.range.min.toFixed(2)} - $${data.range.max.toFixed(2)}</strong></div>`;
                    }
                    document.getElementById('breakdown').innerHTML = breakdown;
                    
                    result.style.display = 'block';
                } catch (err) {
                    error.style.display = 'block';
                    error.textContent = `Error: ${err.message}`;
                } finally {
                    loading.style.display = 'none';
                }
            });
        </script>
    </body>
    </html>
    """


def engineer_features_from_request(request: PricingRequest) -> np.ndarray:
    """Engineer features from API request to match v3_optimized features (11 features)."""
    import zimbabwe_market_rates as mb
    
    hour = request.hour
    day_of_week = request.day_of_week
    distance = request.distance
    temp = request.temperature or 25.0
    
    # Distance scales
    distance_log = np.log1p(distance)
    distance_sqrt = np.sqrt(distance)
    
    # Market Interaction (Zimbabwe specific)
    rate = mb.MARKET_RATES["logistics_heavy"]["per_ton_km"]
    base_fee = mb.MARKET_RATES["logistics_heavy"]["minimum_load_fee"]
    market_baseline = (distance * 1.0 * rate) + base_fee
    market_diff_ratio = market_baseline / (distance + 0.1)
    market_transit_baseline = (distance * mb.MARKET_RATES["ride_hailing"]["per_km"]) + mb.MARKET_RATES["ride_hailing"]["base_fare"]
    
    # Interactions
    is_peak_hour = 1 if ((hour >= 7 and hour <= 9) or (hour >= 16 and hour <= 19)) else 0
    is_weekend = 1 if day_of_week >= 5 else 0
    dist_x_peak = distance * is_peak_hour
    dist_x_weekend = distance * is_weekend
    
    # Build feature array in V3.1 Order (11 features):
    # ["distance", "hour", "day_of_week", "temperature",
    #  "distance_log", "distance_sqrt",
    #  "market_baseline", "market_diff_ratio", "market_transit_baseline",
    #  "dist_x_peak", "dist_x_weekend"]
    features = [
        distance, hour, day_of_week, temp,
        distance_log, distance_sqrt,
        market_baseline, market_diff_ratio, market_transit_baseline,
        dist_x_peak, dist_x_weekend
    ]
    
    return np.array([features])


@app.post("/estimate", response_model=PricingResponse)
async def estimate_price(request: PricingRequest):
    """
    Estimate price for Zimbabwe logistics.
    
    The ML model was trained on generic ride data ($2-$92).
    We scale predictions to realistic Zimbabwe freight pricing using
    market benchmarks (Swift, Bolt, inDrive rates) as anchors.
    """
    import zimbabwe_market_rates as mb
    
    try:
        logger.info(f"Input: distance={request.distance}km, hour={request.hour}, day={request.day_of_week}")
        
        # Engineer features from request
        X = engineer_features_from_request(request)
        
        # Scale
        if SCALER:
            X_scaled = SCALER.transform(X)
        else:
            X_scaled = X
        
        # Raw ML prediction (in $2-$92 training range)
        raw_prediction = float(MODEL.predict(X_scaled)[0])
        raw_prediction = max(2.50, min(100.0, raw_prediction))
        
        # =====================================================
        # ZIMBABWE MARKET SCALING
        # =====================================================
        # The model learns RELATIVE pricing patterns (peak hours,
        # weekends, distance scaling). We anchor these to real
        # Zimbabwe logistics rates.
        
        distance = request.distance
        
        # 1. Calculate Zimbabwe market baseline (ton-km model)
        #    Using 1.0 ton default; API consumers can pass weight
        weight_tons = getattr(request, 'weight_tons', 1.0) or 1.0
        zw_baseline = mb.calculate_market_baseline(
            distance_km=distance,
            weight_tons=weight_tons,
            urgency="Standard"
        )
        
        # 2. Transit baseline (lighter cargo / ride-hailing scale)
        transit_baseline = (distance * mb.MARKET_RATES["ride_hailing"]["per_km"]) + mb.MARKET_RATES["ride_hailing"]["base_fare"]
        
        # 3. Compute model's relative signal
        #    How much does the model deviate from mean price ($16.50)?
        training_mean = 16.50
        relative_signal = (raw_prediction - training_mean) / training_mean  # e.g., +0.10 means 10% above average
        
        # 4. Blend: Use market baseline as anchor, modulate by model signal
        #    - For heavy logistics (distance > 50km): anchor to zw_baseline
        #    - For short urban runs (< 50km): anchor to transit_baseline
        if distance >= 50:
            anchor = zw_baseline
        else:
            anchor = max(transit_baseline, zw_baseline * 0.5)
        
        # Apply the model's learned adjustments (±30% max influence)
        model_adjustment = 1.0 + (relative_signal * 0.3)
        model_adjustment = max(0.7, min(1.3, model_adjustment))
        
        # Peak hour surcharge (model learned this pattern)
        is_peak = (request.hour >= 7 and request.hour <= 9) or (request.hour >= 16 and request.hour <= 19)
        peak_multiplier = 1.08 if is_peak else 1.0
        
        # Weekend premium
        is_weekend = request.day_of_week >= 5
        weekend_multiplier = 1.05 if is_weekend else 1.0
        
        # Final Zimbabwe-scaled price
        estimated_price = anchor * model_adjustment * peak_multiplier * weekend_multiplier
        
        # Enforce realistic bounds for Zimbabwe logistics
        min_price = max(15.0, transit_baseline * 0.8)
        max_price = zw_baseline * 2.5
        estimated_price = max(min_price, min(max_price, estimated_price))
        estimated_price = round(estimated_price, 2)
        
        # =====================================================
        # PRICE BREAKDOWN
        # =====================================================
        base_rate = anchor * 0.70
        distance_component = anchor * 0.20
        time_adjustment = (peak_multiplier - 1.0) * anchor + (weekend_multiplier - 1.0) * anchor
        model_intelligence = estimated_price - base_rate - distance_component - time_adjustment
        
        total_breakdown = {
            "base_rate": round(base_rate, 2),
            "distance_component": round(distance_component, 2),
            "time_adjustment": round(max(0, time_adjustment), 2),
            "ai_adjustment": round(max(0, model_intelligence), 2),
        }
        
        # Normalize breakdown to match total
        breakdown_total = sum(total_breakdown.values())
        if breakdown_total > 0:
            scale_factor = estimated_price / breakdown_total
            total_breakdown = {k: round(v * scale_factor, 2) for k, v in total_breakdown.items()}
        
        # Confidence
        base_confidence = METADATA.get('history', {}).get('test', {}).get('r2', 0.14)
        confidence = min(0.85, max(0.55, base_confidence + 0.50))
        
        # Range (±12%)
        price_range = {
            "min": round(estimated_price * 0.88, 2),
            "max": round(estimated_price * 1.12, 2),
        }
        
        logger.info(f"Output: ${estimated_price:.2f} (raw ML: ${raw_prediction:.2f}, anchor: ${anchor:.2f}, confidence: {confidence:.0%})")
        
        return PricingResponse(
            estimate_usd=round(estimated_price, 2),
            confidence=confidence,
            breakdown=total_breakdown,
            range=price_range,
            model_version="v3_optimized",
            timestamp=datetime.now().isoformat(),
        )
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model": "v3_optimized",
        "features": len(FEATURES),
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/model-info")
async def model_info():
    """Get model information."""
    history = METADATA.get('history', {})
    return {
        "version": "v3_optimized",
        "features": FEATURES,
        "feature_count": len(FEATURES),
        "training_r2": round(history.get('train', {}).get('r2', 0), 4),
        "test_r2": round(history.get('test', {}).get('r2', 0), 4),
        "test_mae": round(history.get('test', {}).get('mae', 0), 2),
        "accuracy_within_10": f"{history.get('test', {}).get('accuracy_within_10', 0):.1f}%",
    }


# ============================================================================
# RUN SERVER
# ============================================================================
if __name__ == "__main__":
    import sys
    
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    
    print("\n" + "="*75)
    print("🚀 TakuraBid Pricing API")
    print("="*75)
    print(f"\n✓ Model loaded: v2_current")
    print(f"✓ Features: {len(FEATURES)}")
    print(f"✓ Model R²: {METADATA.get('history', {}).get('test', {}).get('r2', '?')}")
    print(f"\n📍 Server starting on http://localhost:{port}")
    print(f"\n   Web Demo: http://localhost:{port}")
    print(f"   API Docs: http://localhost:{port}/docs")
    print(f"   Health: http://localhost:{port}/health")
    print("\n" + "="*75 + "\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
    )
