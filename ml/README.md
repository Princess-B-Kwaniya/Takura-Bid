# 🚚 TakuraBid ML Pricing Engine

This folder contains the AI-powered pricing engine for TakuraBid. It provides real-time budget suggestions to clients and bidding suggestions to drivers based on historical data and Zimbabwe market benchmarks.

## 📂 File Structure

We have organized the files to be specific and easy to navigate:

| File | Purpose |
|------|---------|
| `ml_service.py` | **The Core API**. Runs on port 8000. Serves real-time price estimates. |
| `ml_trainer.py` | **Model Trainer**. Use this to retrain the model on new data. |
| `ml_data_processor.py`| **Data Cleaner**. Prepares raw data and engineers features. |
| `ml_config.py` | **Settings & Registry**. Central hub for model versions and paths. |
| `zimbabwe_market_rates.py` | **Market Data**. Real-world rates for Swift, Bolt, and inDrive Zimbabwe. |
| `ml_research_lab.ipynb` | **Experimental Notebook**. Where we test new algorithms and tuning. |
| `ml_plots/` | Visualizations, charts, and training logs. |
| `models/` | Saved model files (`.joblib`) ready for production use. |
| `data/` | Raw datasets (rides, weather, and market data). |

---

## 🚀 How It Works

### 1. Scaling to Zimbabwe
Currently, the model is trained on a "proxy" dataset of ride-hailing interactions (which captures complex supply/demand patterns). We transform these patterns into **Zimbabwe Logistics Pricing** using the `zimbabwe_market_rates.py` module.

The system anchors the AI prediction to real Zimbabwe standards:
- **Harare → Bulawayo** (~439km) ≈ $1,000+ USD
- **Heavy Haulage** ≈ $0.20 - $0.35 per ton/km
- **Minimum Fees** ≈ $150 - $250 for short truck loads

### 2. Feature Intelligence
The model looks at 11 high-impact signals:
- **Distance** (Crucial scale)
- **Time of Day** (Peak hours in Harare/Bulawayo)
- **Day of Week** (Weekend premiums)
- **Market Interaction** (Comparison against Swift/Bolt benchmarks)
- **Weather** (Impact of rain on transit speed)

---

## 🛠 Usage Instructions

### Run the Pricing API
Start the server to enable AI suggestions in the TakuraBid app:
```bash
python ml/ml_service.py
```
*Access Documentation: http://localhost:8000/docs*

### Train a New Model
If you add more data to `ml/data/`, retrain the model with:
```bash
python ml/ml_trainer.py --version v3_optimized --save
```

### Run Tests
Verify the API is responding correctly:
```bash
python ml/ml_api_tester.py
```

---

## 📈 Roadmap
1. **Real Data Integration**: Once TakuraBid has 500+ real transactions, we will move from "Generic Data + Scaling" to "Direct Zimbabwe Logistics Training".
2. **Vehicle Specifics**: Adding truck-type features (Flatbed vs. Refridgerated).
3. **Route Intelligence**: Integrating real road conditions and toll costs.
