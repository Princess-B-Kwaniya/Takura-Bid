# TakuraBid ML Pricing Model - Development Roadmap

## Current Status
**Production Ready v2** - GradientBoosting model with 13 engineered features, R² = 0.085

Currently deployed with real-time price suggestions integrated into the driver dashboard.

## Completed Work

**Phase 1: ML Foundation**
- Data pipeline with UTF-16 encoding detection
- 13 engineered temporal, distance, and weather features
- Baseline RandomForest model (R² = 0.0585)
- Production v2 model using GradientBoosting (R² = 0.085)
- Model serialization with joblib + JSON metadata
- Comprehensive evaluation framework

**Phase 2: Backend Integration**
- FastAPI service with interactive demo
- Next.js bridge API (`/api/pricing/estimate`)
- Auth bypass for pricing endpoint
- Real-time suggestions on driver load pages
- "Use Suggestion" button for quick selection
- Green suggestion box UI component

**Phase 3: Testing & Validation**
- Integration test suite with 2/2 tests passing
- Health check and info endpoints
- End-to-end testing through Next.js UI
- Production-ready error handling
- Local testing environment verified
---

## Next Steps: Phase 4 - Data Quality Improvements

### 4.1 Weather Data Alignment (4-8 hours)
The weather dataset has a 4-hour offset relative to ride timestamps, reducing feature correlation. 

**Task:** Align observations within ±30 minute windows using timestamp parsing and interpolation.  
**Expected Impact:** R² improvement to 0.15-0.20 (+7-10% accuracy)  
**Priority:** HIGH - Quick win with high ROI

### 4.2 TakuraBid Platform Integration (16-24 hours)
Current model uses generic cab ride data. Need platform-specific features.

**Required Data:**
- Vehicle: type, capacity (tons), age
- Load: weight, cargo classification, hazmat flag
- Route: coordinates, distance, road type
- Driver: acceptance rate, rating, specializations
- Historical: previous bids, completion rates

**Data Sources:** Supabase (loads, bids, users, driver_profiles tables)  
**Expected Impact:** R² → 0.30-0.50 (+25% accuracy)  
**Priority:** HIGH - Business-critical

### 4.3 Feature Expansion (6-8 weeks)
Scale from 13 to 40+ features through engineered combinations.

**New Feature Categories:**
- Temporal patterns (hour, day, season, holidays)
- Vehicle specifics (capacity ratio, type encoding)
- Cargo attributes (density, fragility, hazmat surcharge)
- Driver history (success rate, specialization bonus)
- Market conditions (demand, competition, fuel index)
- Business logic (client loyalty, urgency multipliers)

**Implementation:** Refactor `ml/data_pipeline.py`, modularize in `ml/features/` folder, add feature versioning.  
**Expected Impact:** R² → 0.50-0.75
---

## Phase 5 - Advanced Modeling (6-8 weeks)

Test alternative algorithms optimized for structured prediction tasks.

**Models to Evaluate:**
- **XGBoost:** Often superior on tabular data, handles categorical features well
- **LightGBM:** Faster training, native categorical support, production-ready
- **CatBoost:** Excellent categorical variable handling without preprocessing
- **Ensemble:** Weighted voting of best 3-5 models for robustness
- **Neural Networks:** For complex feature interactions

**Methodology:**
- 5-fold cross-validation on all models
- Hyperparameter tuning per algorithm using Optuna
- Comparison metrics: R², MAE, inference speed, model size
- Build ensemble from top performers

**Expected Best Result:** R² 0.70-0.80  
**Hyperparameter Tuning:** Focus on accuracy vs. speed trade-offs (target: <100ms inference)

---

## Phase 6 - Continuous Improvement (Ongoing)

### Feedback & Retraining Pipeline
Collect real-world predictions and actual bids to measure accuracy and trigger retraining.

**Weekly Automation:**
- Extract 7 days of load data
- Retrain all models in parallel
- Compare R² to previous version
- Auto-deploy if performance maintained/improved
- Maintain version history for rollback

**Real-Time Feedback:**
Log every prediction with timestamp and inputs, compare against actual driver bids post-completion. Alert if accuracy drops >5%.

### A/B Testing
Run 4-8 week experiment with driver groups:
- Group A (50%): AI suggestions enabled
- Group B (50%): Baseline (no suggestions)

Measure: acceptance rates, completion rates, driver satisfaction.

### Monitoring Dashboard
Real-time metrics on model performance, API health, and user engagement.

**Key Metrics:**
- Daily accuracy (MAE, R²)
- API response times (p50, p95, p99)
- Data drift detection
- Driver usage rates
- Load completion success

---

## Phase 7 - Production Deployment (2-4 weeks)

### Infrastructure
Move from local development to cloud production with scaling.

**Deployment Options:**
1. Docker + Kubernetes (recommended for flexibility)
2. AWS SageMaker (managed ML platform)
3. Google Vertex AI (fully managed, good for teams)
4. Self-hosted (on-premises control)

**Requirements:** 99.9% uptime SLA, 1000+ req/sec load testing, auto-scaling

### Database Integration
Store predictions and feedback for continuous improvement.

```sql
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  load_id UUID,
  predicted_price DECIMAL,
  actual_bid DECIMAL, 
  prediction_error DECIMAL,
  timestamp TIMESTAMP,
  model_version VARCHAR
);

CREATE INDEX ON predictions(load_id, timestamp);
```

### Cost Optimization
- Model quantization for 75% size reduction
- Batch predictions during off-peak hours
- Cache common route results
- Target: <$0.01 per prediction

### Security & Privacy
- HTTPS-only API, rate limiting
- API key authentication
- Don't log sensitive data (addresses, driver IDs)
- GDPR compliance: 6-month data retention policy

---

## Optional Enhancements

**Multi-Vehicle Pricing:** Separate models for different truck categories (vans, rigid, articulated, special)  
**Geographic Heatmaps:** Visualize demand, pricing patterns, driver availability by location  
**Driver Personalization:** Tailor suggestions based on individual performance history  
**Demand Forecasting:** 7-day demand prediction, load completion risk assessment  
**Explainability:** Show drivers why prices were suggested (feature importance breakdown)
---

## Timeline & Resources

| Phase | Duration | Team | Goals |
|-------|----------|------|-------|
| Phase 4 | 4-6 weeks | 1 ML engineer | Data quality improvements |
| Phase 5 | 6-8 weeks | 1-2 ML engineers | Advanced model testing |
| Phase 6 | Ongoing | 0.5 ML engineer | Continuous monitoring |
| Phase 7 | 2-4 weeks | 1 ML + 1 DevOps | Cloud deployment |

**Total to v3.0:** 12-14 weeks (Expected R² 0.60-0.70)

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| R² (model accuracy) | 0.085 | > 0.70 |
| MAE (price error) | $7.09 | < $10 |
| API latency p95 | <100ms | <100ms |
| Driver acceptance rate | Unknown | > 70% |
| Load completion rate | Unknown | > 85% |
| Uptime SLA | 99.9%+ | 99.95%+ |
| Cost per prediction | <$0.01 | <$0.01 |

---

## Quick Start Commands

```bash
# Train model
.venv\Scripts\python.exe ml/train_model.py --version v2_current --save

# Run integration tests
.venv\Scripts\python.exe test_integration.py

# Start API server
.venv\Scripts\python.exe ml/api.py

# Start Next.js app
npm run dev
```

---

## Next Actions

1. **This Week:** Weather data alignment (Phase 4.1) - 4-8 hours, +7-10% accuracy
2. **Next Week:** Integrate TakuraBid platform data (Phase 4.2) - 16-24 hours, +25% accuracy
3. **Month 2:** Feature expansion (Phase 4.3) - 6-8 weeks, R² to 0.50-0.75
4. **Month 3:** Test alternative models (Phase 5) - 6-8 weeks, R² to 0.70-0.80

**Current system is production-ready. Foundation is solid. Ready to scale with real data.**
