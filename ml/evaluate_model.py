"""
═══════════════════════════════════════════════════════════════════════════
TakuraBid Pricing Model - Evaluation & Analysis
═══════════════════════════════════════════════════════════════════════════
Comprehensive model evaluation with detailed analysis and visualizations.

Usage:
  python evaluate_model.py --version v2_current
  python evaluate_model.py --compare baseline v2_current
"""

import argparse
import json
import logging
from pathlib import Path
from typing import Dict, List
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    median_absolute_error,
)
import joblib

from config import (
    DATA_CONFIG, MODEL_VERSIONS, MODELS_DIR,
    PERFORMANCE_TARGETS, FEATURE_GROUPS,
)
from data_pipeline import prepare_data

# ============================================================================
# LOGGING
# ============================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ============================================================================
# MODEL LOADER
# ============================================================================
def load_trained_model(version: str, models_dir: Path = MODELS_DIR) -> Dict:
    """
    Load a trained model from disk.
    
    Returns:
    --------
    Dict with model, scaler, and metadata
    """
    model_file = models_dir / f"{version}_model.joblib"
    scaler_file = models_dir / f"{version}_model_scaler.joblib"
    metadata_file = models_dir / f"{version}_model_metadata.json"
    
    if not model_file.exists():
        raise FileNotFoundError(f"Model not found: {model_file}")
    
    model = joblib.load(model_file)
    scaler = joblib.load(scaler_file) if scaler_file.exists() else None
    
    metadata = {}
    if metadata_file.exists():
        with open(metadata_file) as f:
            metadata = json.load(f)
    
    return {
        "model": model,
        "scaler": scaler,
        "metadata": metadata,
    }


# ============================================================================
# EVALUATION FUNCTIONS
# ============================================================================
def evaluate_model(
    version: str,
    X_test: np.ndarray,
    y_test: np.ndarray,
) -> Dict:
    """
    Evaluate a model on test data.
    """
    try:
        loaded = load_trained_model(version)
        model = loaded["model"]
        scaler = loaded["scaler"]
    except FileNotFoundError:
        logger.warning(f"Model {version} not found, training fresh...")
        return None
    
    # Scale test data if scaler exists
    if scaler:
        X_test = scaler.transform(X_test)
    
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    median_ae = median_absolute_error(y_test, y_pred)
    
    # Accuracy metrics
    errors = np.abs(y_pred - y_test)
    accuracy_within_10 = np.mean(errors <= 10) * 100
    accuracy_within_5 = np.mean(errors <= 5) * 100
    accuracy_within_20pct = np.mean(errors <= y_test * 0.2) * 100
    
    # Error percentiles
    error_pct = (errors / y_test) * 100
    p50_error_pct = np.percentile(error_pct, 50)
    p90_error_pct = np.percentile(error_pct, 90)
    p95_error_pct = np.percentile(error_pct, 95)
    
    return {
        "version": version,
        "mae": mae,
        "rmse": rmse,
        "r2": r2,
        "median_ae": median_ae,
        "accuracy_within_10": accuracy_within_10,
        "accuracy_within_5": accuracy_within_5,
        "accuracy_within_20pct": accuracy_within_20pct,
        "error_pct_p50": p50_error_pct,
        "error_pct_p90": p90_error_pct,
        "error_pct_p95": p95_error_pct,
        "predictions": y_pred,
        "actual": y_test,
        "errors": errors,
    }


def print_evaluation(eval_result: Dict):
    """Print evaluation results in human-readable format."""
    v = eval_result
    
    print(f"\n{'='*75}")
    print(f"MODEL EVALUATION: {v['version']}")
    print(f"{'='*75}")
    
    print(f"\nCore Metrics:")
    print(f"  R² Score:       {v['r2']:.4f} (how well model explains variance)")
    print(f"  MAE:            ${v['mae']:.2f}  (average absolute error)")
    print(f"  Median AE:      ${v['median_ae']:.2f}")
    print(f"  RMSE:           ${v['rmse']:.2f}  (penalizes larger errors)")
    
    print(f"\nAccuracy Distribution:")
    print(f"  Within ±$10:    {v['accuracy_within_10']:.1f}% of predictions")
    print(f"  Within ±$5:     {v['accuracy_within_5']:.1f}% of predictions")
    print(f"  Within ±20%:    {v['accuracy_within_20pct']:.1f}% of predictions")
    
    print(f"\nError Percentiles (% of actual price):")
    print(f"  Median Error:   {v['error_pct_p50']:.1f}%")
    print(f"  90th Percentile:{v['error_pct_p90']:.1f}%")
    print(f"  95th Percentile:{v['error_pct_p95']:.1f}%")
    
    # Compare to target
    target = PERFORMANCE_TARGETS.get(v['version'], {})
    if target:
        print(f"\nTarget Comparison:")
        symbol_r2 = "✓" if v['r2'] >= target['r2_score'] else "○"
        symbol_mae = "✓" if v['mae'] <= target['mae'] else "○"
        print(f"  {symbol_r2} R² ≥ {target['r2_score']}: {v['r2']:.4f}")
        print(f"  {symbol_mae} MAE < ${target['mae']}: ${v['mae']:.2f}")
    
    print(f"\nInterpretation:")
    if v['r2'] < 0.3:
        print(f"  ⚠ Low accuracy - model explains ~{v['r2']*100:.0f}% of variance")
        print(f"    Missing key features or insufficient data")
    elif v['r2'] < 0.6:
        print(f"  △ Moderate accuracy - useful but needs improvement")
        print(f"    Add vehicle, load, route, and demand features")
    elif v['r2'] < 0.85:
        print(f"  ◐ Good accuracy - production-ready with caveats")
        print(f"    Continue improving with ensemble and neural networks")
    else:
        print(f"  ◑ Excellent accuracy - strong predictive power")
        print(f"    Ready for production deployment")
    
    print(f"{'='*75}\n")


def compare_models(versions: List[str]):
    """
    Compare multiple models side-by-side.
    """
    print(f"\n{'='*75}")
    print(f"MODEL COMPARISON")
    print(f"{'='*75}")
    
    # Prepare data once
    logger.info("Preparing evaluation data...")
    X, y = prepare_data(
        DATA_CONFIG["rides_file"],
        DATA_CONFIG["weather_file"],
        # Use union of all features from compared models
        list(set(sum([MODEL_VERSIONS[v]["features"] for v in versions], []))),
    )
    
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=DATA_CONFIG["test_size"],
        random_state=DATA_CONFIG["random_state"],
    )
    
    # Evaluate each model
    results = []
    for version in versions:
        config = MODEL_VERSIONS.get(version)
        if not config:
            logger.warning(f"Unknown version: {version}")
            continue
        
        # Select only features used by this model
        X_test_subset = X_test[config["features"]]
        
        # Evaluate
        result = evaluate_model(version, X_test_subset.values, y_test.values)
        if result:
            results.append(result)
            print_evaluation(result)
    
    # Summary table
    if results:
        print(f"\n{'─'*75}")
        print(f"SUMMARY TABLE")
        print(f"{'─'*75}")
        print(f"\n{'Version':<20} {'R²':<10} {'MAE':<12} {'Accuracy(±$10)':<18}")
        print(f"{'-'*60}")
        
        for r in results:
            print(f"{r['version']:<20} {r['r2']:<10.4f} ${r['mae']:<11.2f} {r['accuracy_within_10']:<17.1f}%")
        
        # Show best model
        best_idx = np.argmax([r['r2'] for r in results])
        best = results[best_idx]
        print(f"\n✓ Best model: {best['version']} (R² = {best['r2']:.4f})")
        print(f"{'─'*75}\n")


# ============================================================================
# FEATURE ANALYSIS
# ============================================================================
def print_feature_analysis():
    """
    Print analysis of available and missing features.
    """
    print(f"\n{'='*75}")
    print(f"FEATURE ENGINEERING ROADMAP")
    print(f"{'='*75}")
    
    total_available = 0
    total_potential = 0
    
    for group_name, group in FEATURE_GROUPS.items():
        status = "✓" if group["available"] else "○"
        
        count = len(group.get("features", []))
        total_available += count
        
        est = group.get("estimated_features", 0)
        total_potential += est
        
        print(f"\n{status} {group_name.upper()}: {group['description']}")
        
        if group["available"]:
            print(f"   Features: {', '.join(group['features'][:3])}...")
        else:
            print(f"   Placeholder: {group['placeholder']}")
            if est > 0:
                print(f"   Estimated features: {est}")
    
    print(f"\n{'─'*75}")
    print(f"Current features: {total_available}")
    print(f"Potential features (with TakuraBid data): {total_available + total_potential}")
    print(f"Expected R² improvement: 0.35 → up to 0.85+")
    print(f"{'─'*75}\n")


# ============================================================================
# MAIN
# ============================================================================
def main():
    parser = argparse.ArgumentParser(
        description="Evaluate TakuraBid pricing models"
    )
    parser.add_argument(
        "--version",
        type=str,
        help="Evaluate specific model version",
    )
    parser.add_argument(
        "--compare",
        type=str,
        nargs="+",
        help="Compare multiple models",
    )
    parser.add_argument(
        "--show-features",
        action="store_true",
        help="Show feature engineering roadmap",
    )
    
    args = parser.parse_args()
    
    # Show feature roadmap
    print_feature_analysis()
    
    # Evaluate models
    if args.compare:
        compare_models(args.compare)
    elif args.version:
        try:
            # Prepare data
            X, y = prepare_data(
                DATA_CONFIG["rides_file"],
                DATA_CONFIG["weather_file"],
                MODEL_VERSIONS[args.version]["features"],
            )
            
            _, X_test, _, y_test = train_test_split(
                X, y, test_size=DATA_CONFIG["test_size"],
                random_state=DATA_CONFIG["random_state"],
            )
            
            # Evaluate
            result = evaluate_model(args.version, X_test.values, y_test.values)
            if result:
                print_evaluation(result)
        except Exception as e:
            logger.error(f"Evaluation failed: {e}")
    else:
        print("\nUsage:")
        print("  python evaluate_model.py --version v2_current")
        print("  python evaluate_model.py --compare baseline v1_improved v2_current")
        print("  python evaluate_model.py --show-features")


if __name__ == "__main__":
    main()
