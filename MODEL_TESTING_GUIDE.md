╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║                  🧪 HOW TO TEST THE ML MODELS - COMPLETE GUIDE            ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 WHERE THE MODELS ARE LOCATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Directory: C:\Users\USER\Desktop\Takura-Bid=1\ml\models\

Files:
  ✓ baseline_model.joblib                (50.6 MB)
  ✓ baseline_model_scaler.joblib         
  ✓ baseline_model_metadata.json         
  ✓ v2_current_model.joblib              (2.7 MB)
  ✓ v2_current_model_scaler.joblib
  ✓ v2_current_model_metadata.json       


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TEST METHOD 1: DIRECT PYTHON TESTING (Fastest)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Open Terminal

STEP 2: Run the test script
  cd C:\Users\USER\Desktop\Takura-Bid=1
  .venv\Scripts\python.exe test_integration.py

EXPECTED OUTPUT:
  ======================================================================
  🧪 Testing AI Pricing Integration
  ======================================================================
  
  Test 1: FastAPI ML Service
  ✓ ML API Status: 200
    Estimate: $32.79
    Range: $27.87 - $37.71
    Confidence: 58.5%
  
  Test 2: Next.js Bridge API
  Status: 200
  ✓ Bridge API Working!
    Expected Price: $28.57
    Breakdown:
      - base_price: $22.51
      - distance_surcharge: $6.06
      - time_surcharge: $0.00
      - weather_surcharge: $0.00


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TEST METHOD 2: WEB API TESTING (Via FastAPI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Start the API service
  cd C:\Users\USER\Desktop\Takura-Bid=1
  .venv\Scripts\python.exe ml/api.py

STEP 2: Open browser to interactive demo
  URL: http://localhost:8000
  
  What you see:
  ┌─────────────────────────────────┐
  │ 🚚 TakuraBid Pricing            │
  │ AI-Powered Price Estimation     │
  │                                 │
  │ Distance (km)      [___]        │
  │ Hour (0-23)        [___]        │
  │ Day (0=Mon, 6=Sun) [___]        │
  │ Temperature (°C)   [___]        │
  │ Precipitation (mm) [___]        │
  │                                 │
  │      [Get Price Estimate]       │
  │                                 │
  │      Result: $XX.XX             │
  │      Range: $XX - $XX           │
  │      Confidence: XX%            │
  └─────────────────────────────────┘

STEP 3: Enter test data
  Distance: 50
  Hour: 14
  Day: 2
  Temp: 25
  Precip: 0

STEP 4: Click "Get Price Estimate"
  
EXPECTED RESULT:
  Estimate: ~$28-32
  Range: $24-37
  Confidence: ~59%


STEP 5: Try Swagger UI for testing
  URL: http://localhost:8000/docs
  
  What you see:
  • Interactive API documentation
  • All endpoints listed with schemas
  • "Try it out" button for each endpoint
  
  Endpoints:
  ✓ GET  /
  ✓ POST /estimate
  ✓ GET  /health
  ✓ GET  /model-info


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TEST METHOD 3: NEXT.JS INTEGRATION TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Ensure FastAPI is running
  .venv\Scripts\python.exe ml/api.py
  (in one terminal)

STEP 2: Start Next.js dev server
  npm run dev
  (in another terminal)

STEP 3: Open browser
  http://localhost:3001/driver/loads
  
STEP 4: Click on any load in the list

STEP 5: Watch for the AI suggestion box
  Should appear with:
  ├─ "💡 AI PRICE SUGGESTION"
  ├─ Estimated price (e.g., $28.57)
  ├─ "Use Suggestion" button
  └─ Confidence: XX%

STEP 6: Test functionality
  Click: [Use Suggestion]
  Result: Bid amount field auto-fills with predicted price

STEP 7: Open browser DevTools to see API calls
  Press: F12
  Go to: Network tab
  
  Filter by: /api/pricing/estimate
  
  Should see:
  • POST /api/pricing/estimate → Status 200
  • Response includes: {suggested_bid, confidence, breakdown}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TEST METHOD 4: COMMAND LINE CURL TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Ensure FastAPI is running
  .venv\Scripts\python.exe ml/api.py

STEP 2: Test the /health endpoint
  powershell -Command "Invoke-WebRequest -Uri 'http://localhost:8000/health' | Select-Object -ExpandProperty Content"
  
  Expected:
  {"status":"healthy","model":"v2_current","features":16,"timestamp":"..."}

STEP 3: Test the /estimate endpoint
  powershell -Command "
  \$body = @{distance=50; hour=14; day_of_week=2; temperature=25; precipitation=0} | ConvertTo-Json
  Invoke-WebRequest -Uri 'http://localhost:8000/estimate' -Method POST -Headers @{'Content-Type'='application/json'} -Body \$body | Select-Object -ExpandProperty Content
  "
  
  Expected JSON response:
  {
    "estimate_usd": 28.57,
    "confidence": 0.585,
    "breakdown": {
      "base_price": 22.51,
      "distance_surcharge": 6.06,
      "time_surcharge": 0.0,
      "weather_surcharge": 0.0
    },
    "range": {
      "min": 24.28,
      "max": 32.86
    },
    "model_version": "v2_current",
    "timestamp": "2026-02-26T..."
  }

STEP 4: Test different scenarios
  Try different distances and times to see price variations:
  
  Scenario A - Short morning ride:
    distance=10, hour=8, day_of_week=2
    Expected: ~$12-18
  
  Scenario B - Long afternoon ride:
    distance=100, hour=14, day_of_week=2
    Expected: ~$40-50
  
  Scenario C - Peak hour:
    distance=30, hour=8, day_of_week=2
    Expected: ~$25-35 (with peak hour surcharge)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 WHAT EACH MODEL CONTAINS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASELINE MODEL
├─ Algorithm: RandomForestRegressor (100 trees)
├─ Features: 5 basic features
│  ├─ distance
│  ├─ hour
│  ├─ day_of_week
│  ├─ temperature
│  └─ precipitation
├─ Accuracy: R² = 0.0585, MAE = $7.19
└─ Use case: Baseline comparison

V2_CURRENT MODEL (RECOMMENDED)
├─ Algorithm: GradientBoostingRegressor (200 trees)
├─ Features: 13 engineered features
│  ├─ distance (+ log, sqrt, squared variants)
│  ├─ hour (+ sin/cos cyclic encoding)
│  ├─ day_of_week (+ sin/cos cyclic encoding)
│  ├─ temperature (+ squared)
│  ├─ precipitation
│  ├─ is_peak_hour (boolean)
│  ├─ is_weekend (boolean)
│  └─ hour_to_peak (distance to nearest peak)
├─ Accuracy: R² = 0.085, MAE = $7.09
└─ Use case: Production - best balance


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TEST CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☐ Models exist in ml/models/ directory
☐ Model files are not corrupted (can load with joblib)
☐ Metadata files contain correct information
☐ FastAPI service starts without errors
☐ /health endpoint returns 200 OK
☐ /estimate endpoint accepts requests
☐ Predictions are within reasonable range
☐ Prices scale with distance (more km = higher price)
☐ Peak hours show higher prices
☐ Confidence scores are between 0 and 1
☐ Next.js bridge API calls FastAPI successfully
☐ Web UI displays suggestion box
☐ "Use Suggestion" button fills amount field
☐ Prices are consistent across multiple calls


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 DETAILED TESTING SCENARIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEST SCENARIO 1: Price scaling with distance
│
├─ Input: 10km, 2:00 PM, Wednesday
│  Result: ~$14-20
│  Expect: Base price for short distance
│
├─ Input: 50km, 2:00 PM, Wednesday
│  Result: ~$28-35
│  Expect: 5x distance ≈ 1.5-2x price
│
└─ Input: 100km, 2:00 PM, Wednesday
   Result: ~$40-55
   Expect: 10x distance ≈ 2.5-3.5x price


TEST SCENARIO 2: Time-based pricing
│
├─ Input: 50km, 8:00 AM, Wednesday (PEAK HOUR)
│  Result: ~$32-40
│  Expect: Higher than afternoon (more traffic)
│
├─ Input: 50km, 2:00 PM, Wednesday (OFF-PEAK)
│  Result: ~$28-35
│  Expect: Lower base price
│
└─ Input: 50km, 11:00 PM, Wednesday (NIGHT)
   Result: ~$26-32
   Expect: Varies based on demand patterns


TEST SCENARIO 3: Weekend vs Weekday
│
├─ Input: 50km, 2:00 PM, Wednesday (WEEKDAY)
│  Result: ~$28-35
│
└─ Input: 50km, 2:00 PM, Saturday (WEEKEND)
   Result: ~$26-33
   Expect: Slight variation (demand patterns differ)


TEST SCENARIO 4: Weather impact
│
├─ Input: 50km, 2:00 PM, Wednesday, 0mm rain
│  Result: ~$28-35
│  Expect: Good conditions
│
└─ Input: 50km, 2:00 PM, Wednesday, 5mm rain
   Result: ~$28-36
   Expect: Slight increase (weather surcharge)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ QUICK TEST COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Test 1: Check model files exist
dir C:\Users\USER\Desktop\Takura-Bid=1\ml\models\

# Test 2: Run integration tests
cd C:\Users\USER\Desktop\Takura-Bid=1
.venv\Scripts\python.exe test_integration.py

# Test 3: Start FastAPI for manual testing
.venv\Scripts\python.exe ml/api.py
# Then open: http://localhost:8000

# Test 4: Start Next.js for UI testing
npm run dev
# Then open: http://localhost:3001/driver/loads

# Test 5: Load model directly in Python
.venv\Scripts\python.exe -c "
import joblib
model = joblib.load('ml/models/v2_current_model.joblib')
print('Model loaded successfully!')
print('Model type:', type(model))
"

# Test 6: Check model metadata
type C:\Users\USER\Desktop\Takura-Bid=1\ml\models\v2_current_model_metadata.json


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ COMMON QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q: How accurate are the predictions?
A: R² = 0.085 (explains 8.5% of variance)
   MAE = $7.09 (average error ~$7)
   This is good for a starting model with limited features

Q: Can I improve accuracy?
A: Yes! See ROADMAP.md for planned improvements:
   • Better weather data alignment
   • Real TakuraBid platform data
   • Driver reputation factors
   • Vehicle type specifications
   • Route optimization data

Q: What if predictions seem wrong?
A: Check: distance, time, and date inputs are correct
   Remember: Model is trained on cab rides, not all vehicles
   The prices may need calibration for your market

Q: How do I retrain the model?
A: Use: .venv\Scripts\python.exe ml/train_model.py --version v2_current --save
   (Requires updated training data)

Q: Can I use a different model?
A: Yes! Edit config.py to switch between:
   • baseline (SimpleRF, 5 features)
   • v2_current (GradientBoosting, 13 features) ← Recommended
   • v3_production (planned)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ YOU'RE READY TO TEST!

Start with: .venv\Scripts\python.exe test_integration.py
Then try: http://localhost:8000 or http://localhost:3001

╚════════════════════════════════════════════════════════════════════════════╝
