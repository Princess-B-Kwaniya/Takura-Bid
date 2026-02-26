"""
═══════════════════════════════════════════════════════════════════════════
TakuraBid Pricing Model - Configuration Management
═══════════════════════════════════════════════════════════════════════════
Centralized configuration for model training, versioning, and feature sets.
Easy to modify for different runs and model versions.
"""

from pathlib import Path
from typing import Dict, List, Any

# ============================================================================
# PROJECT PATHS
# ============================================================================
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "cab-weather"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"
OUTPUTS_DIR = PROJECT_ROOT / "ml" / "outputs"

# Create directories if they don't exist
MODELS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

# ============================================================================
# DATA CONFIGURATION
# ============================================================================
DATA_CONFIG = {
    "rides_file": DATA_DIR / "cab_rides.txt",
    "weather_file": DATA_DIR / "weather.txt",
    "encodings": ["utf-16", "utf-8", "latin-1", "iso-8859-1"],  # Try multiple encodings
    "delimiter": ",",
    "test_size": 0.2,
    "random_state": 42,
    "min_price": 2.50,  # Logical minimum price
    "max_price": 500.0,  # Logical maximum price (outlier threshold)
    "sample_size": 50000,  # Downsample to 50K for faster training (use None for full dataset)
}

# ============================================================================
# MODEL VERSIONS & CONFIGURATIONS
# ============================================================================
MODEL_VERSIONS = {
    "baseline": {
        "name": "Random Forest (Baseline)",
        "model_type": "RandomForestRegressor",
        "version": "v0.1",
        "features": ["distance", "hour", "day_of_week", "temperature", "precipitation"],
        "model_params": {
            "n_estimators": 100,
            "max_depth": 15,
            "min_samples_split": 5,
            "min_samples_leaf": 2,
            "random_state": 42,
            "n_jobs": -1,
            "verbose": 0,
        },
        "description": "Simple baseline using ride characteristics only",
    },
    "v1_improved": {
        "name": "Random Forest (Improved)",
        "model_type": "RandomForestRegressor",
        "version": "v1.0",
        "features": [
            # Original features
            "distance", "hour", "day_of_week", "temperature", "precipitation",
            # Engineered features
            "hour_sin", "hour_cos", "day_sin", "day_cos",
            "distance_log", "distance_sqrt",
            "is_peak_hour", "is_weekend",
        ],
        "model_params": {
            "n_estimators": 150,
            "max_depth": 20,
            "min_samples_split": 4,
            "min_samples_leaf": 1,
            "random_state": 42,
            "n_jobs": -1,
        },
        "description": "Improved with cyclic and non-linear feature engineering",
    },
    "v2_current": {
        "name": "Gradient Boosting (Current)",
        "model_type": "GradientBoostingRegressor",
        "version": "v2.0",
        "features": [
            # Core features
            "distance", "hour", "day_of_week", "temperature", "precipitation",
            # Cyclic encodings
            "hour_sin", "hour_cos", "day_sin", "day_cos",
            # Non-linear transforms
            "distance_log", "distance_sqrt", "distance_squared",
            "temp_squared",
            # Business logic features
            "is_peak_hour", "is_weekend", "hour_to_peak",
            # TODO: Vehicle features (when truck data available)
            # "vehicle_capacity", "vehicle_age", "vehicle_condition",
            # TODO: Load features (when truck data available)
            # "load_type", "load_weight", "load_hazmat",
            # TODO: Driver metrics (when available)
            # "driver_experience", "driver_rating",
            # TODO: Demand patterns (when available)
            # "demand_index", "competitor_count", "advance_notice",
            # TODO: Route features (when available)
            # "toll_cost", "road_type", "border_crossing",
        ],
        "model_params": {
            "n_estimators": 200,
            "learning_rate": 0.08,
            "max_depth": 7,
            "min_samples_split": 5,
            "min_samples_leaf": 2,
            "subsample": 0.8,
            "random_state": 42,
            "verbose": 0,
        },
        "description": "Advanced model with engineered features and Gradient Boosting",
    },
    "v3_production": {
        "name": "Ensemble (Production Target)",
        "model_type": "VotingRegressor",
        "version": "v3.0",
        "features": [
            # Will be populated with expanded feature set
            # including vehicle, load, driver, demand, route data
        ],
        "model_params": {
            # To be defined when implementing v3
            "estimators": [
                ("xgb", {"n_estimators": 150}),
                ("lgb", {"n_estimators": 150}),
                ("rf", {"n_estimators": 200}),
            ],
        },
        "description": "Production ensemble combining XGBoost, LightGBM, and Random Forest",
    },
}

# ============================================================================
# FEATURE ENGINEERING TEMPLATES
# ============================================================================
FEATURE_GROUPS = {
    "core": {
        "description": "Basic ride characteristics from cab-weather data",
        "available": True,
        "features": ["distance", "hour", "day_of_week", "temperature", "precipitation"],
    },
    "temporal": {
        "description": "Time-based features (cyclic encoding)",
        "available": True,
        "features": ["hour_sin", "hour_cos", "day_sin", "day_cos"],
        "placeholder": "Expand with seasonal, holiday, lockdown information",
    },
    "weather": {
        "description": "Weather impact on pricing",
        "available": True,
        "features": ["temperature", "precipitation"],
        "placeholder": "Extend with: wind_speed, visibility, road_condition, seasonal_factor",
    },
    "route": {
        "description": "Route characteristics",
        "available": False,
        "placeholder": "For TakuraBid data: road_type (highway/rural/urban), toll_cost, border_crossing, elevation, distance_from_harare",
        "estimated_features": 8,
    },
    "vehicle": {
        "description": "Vehicle characteristics for truck hauling",
        "available": False,
        "placeholder": "For TakuraBid data: vehicle_type (pickup/lorry/truck), capacity, age, condition, fuel_type, axles",
        "estimated_features": 8,
    },
    "load": {
        "description": "Load/cargo characteristics",
        "available": False,
        "placeholder": "For TakuraBid data: load_type (general/container/hazmat/perishable), weight, volume, special_handling, temperature_controlled",
        "estimated_features": 8,
    },
    "driver": {
        "description": "Driver metrics and experience",
        "available": False,
        "placeholder": "For TakuraBid data: experience_years, safety_rating, certifications, acceptance_rate, completion_time",
        "estimated_features": 6,
    },
    "demand": {
        "description": "Market demand and competition",
        "available": False,
        "placeholder": "For TakuraBid data: demand_index, competitor_count, peak_load_hours, season_factor, booking_advance_notice",
        "estimated_features": 6,
    },
    "business": {
        "description": "Business logic and surcharges",
        "available": False,
        "placeholder": "For TakuraBid data: fuel_surcharge, peak_hour_multiplier, hazmat_premium, night_driving_fee, platform_margin",
        "estimated_features": 6,
    },
}

# ============================================================================
# MODEL EVALUATION TARGETS
# ============================================================================
PERFORMANCE_TARGETS = {
    "baseline": {
        "r2_score": 0.15,
        "mae": 7.50,
        "description": "Basic performance with current data",
    },
    "v1": {
        "r2_score": 0.25,
        "mae": 6.00,
        "description": "With feature engineering",
    },
    "v2": {
        "r2_score": 0.35,
        "mae": 5.50,
        "description": "With advanced engineering",
    },
    "v3": {
        "r2_score": 0.50,
        "mae": 4.50,
        "description": "Target with TakuraBid data integration",
    },
    "production": {
        "r2_score": 0.85,
        "mae": 2.00,
        "description": "Full system with all features and neural network",
    },
}

# ============================================================================
# SCALING & PREPROCESSING
# ============================================================================
PREPROCESSING_CONFIG = {
    "numeric_features": {
        "scaler": "StandardScaler",
        "handle_missing": "mean",
    },
    "categorical_features": {
        "encoder": "OneHotEncoder",
        "handle_missing": "most_frequent",
        "sparse_output": False,
    },
    "outlier_handling": {
        "method": "clip",
        "min_price": DATA_CONFIG["min_price"],
        "max_price": DATA_CONFIG["max_price"],
    },
}

# ============================================================================
# LOGGING & OUTPUT
# ============================================================================
LOGGING_CONFIG = {
    "level": "INFO",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "save_logs": True,
    "log_file": OUTPUTS_DIR / "training.log",
}

# ============================================================================
# API SERVING (FUTURE)
# ============================================================================
API_CONFIG = {
    "host": "0.0.0.0",
    "port": 8000,
    "workers": 4,
    "cache_predictions": True,
    "cache_ttl": 3600,  # 1 hour
    "max_batch_size": 100,
}

# ============================================================================
# IMPROVEMENT ROADMAP
# ============================================================================
ROADMAP = """
CURRENT STATE (v2.0):
├─ Features: 13 (core + temporal + basic engineering)
├─ Data: Historical cab-weather data (~600K records)
├─ Model: Gradient Boosting Regressor
├─ Expected R²: ~0.35 (with current data)
└─ Expected MAE: ~$5-6

PHASE 1 - ROUTE ENHANCEMENT (Estimated +0.05 R²)
├─ Action: Add route features (Google Maps API)
├─ Features: distance_real, toll_cost, road_type, eta
├─ Timeline: Week 1-2
└─ Target R²: 0.40, MAE: $5.00

PHASE 2 - VEHICLE & LOAD DATA (Estimated +0.15 R²)
├─ Action: Integrate TakuraBid vehicle & load data
├─ Features: vehicle_type, capacity, load_type, weight, hazmat
├─ Timeline: Week 2-4
└─ Target R²: 0.55, MAE: $3.50

PHASE 3 - DRIVER & DEMAND FEATURES (Estimated +0.15 R²)
├─ Action: Add driver metrics and demand patterns
├─ Features: driver_rating, experience, demand_index, season
├─ Timeline: Week 4-5
└─ Target R²: 0.70, MAE: $2.50

PHASE 4 - ENSEMBLE & HYPERPARAMETER (Estimated +0.10 R²)
├─ Action: XGBoost + LightGBM ensemble with optimization
├─ Features: 50+ engineered features
├─ Timeline: Week 5-6
└─ Target R²: 0.80, MAE: $1.80

PHASE 5 - NEURAL NETWORK (Estimated +0.05 R²)
├─ Action: Deep learning model with embeddings
├─ Features: 60+ features with categorical embeddings
├─ Timeline: Week 6-7
└─ Target R²: 0.85, MAE: $1.50

PHASE 6 - PRODUCTION & MONITORING (Ongoing)
├─ Action: API deployment, real-time monitoring
├─ Features: A/B testing, continuous retraining
├─ Timeline: Week 7+
└─ Target: Production-grade system with feedback loops
"""

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================
def get_current_version() -> str:
    """Get the current active model version."""
    return "v2_current"


def get_model_config(version: str = None) -> Dict[str, Any]:
    """Get configuration for a specific model version."""
    if version is None:
        version = get_current_version()
    return MODEL_VERSIONS.get(version, MODEL_VERSIONS["baseline"])


def list_available_features(version: str = None) -> List[str]:
    """List all features used in a model version."""
    config = get_model_config(version)
    return config.get("features", [])


def get_feature_groups_status() -> Dict[str, Dict]:
    """Get status of all feature groups."""
    return FEATURE_GROUPS


if __name__ == "__main__":
    print("═" * 75)
    print("TakuraBid Pricing Model - Configuration")
    print("═" * 75)
    
    print("\n📁 DIRECTORIES:")
    print(f"  Data: {DATA_DIR}")
    print(f"  Models: {MODELS_DIR}")
    print(f"  Outputs: {OUTPUTS_DIR}")
    
    print("\n🎯 CURRENT MODEL:")
    current = get_current_version()
    config = get_model_config(current)
    print(f"  Version: {config['version']} - {config['name']}")
    print(f"  Features: {len(config['features'])}")
    print(f"    {', '.join(config['features'][:5])}...")
    
    print("\n📊 FEATURE GROUPS:")
    for group_name, group_info in FEATURE_GROUPS.items():
        status = "✓" if group_info.get("available") else "○"
        est = f" (~{group_info.get('estimated_features')} features)" if not group_info.get("available") else ""
        print(f"  {status} {group_name}: {group_info['description']}{est}")
    
    print("\n🎯 PERFORMANCE TARGETS:")
    for version, targets in PERFORMANCE_TARGETS.items():
        print(f"  {version}: R² ≥ {targets['r2_score']}, MAE < ${targets['mae']}")
    
    print("\n" + "═" * 75)
