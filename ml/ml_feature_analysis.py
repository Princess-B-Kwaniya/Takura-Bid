"""
TakuraBid Pricing Model - Feature Selection & Importance Analysis
Rank and select the most impactful features for the model.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_selection import SelectKBest, f_regression, mutual_info_regression
from sklearn.ensemble import RandomForestRegressor
from pathlib import Path
import logging

from ml_data_processor import prepare_data
from ml_config import DATA_CONFIG, MODEL_VERSIONS, get_current_version

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def analyze_features(sample_size=50000):
    """
    Ranks features using multiple methods:
    1. Statistical Correlation (f_regression)
    2. Model-based Importance (Random Forest)
    """
    logger.info("Loading data for feature analysis...")
    current_v = get_current_version()
    features = MODEL_VERSIONS[current_v]["features"]
    
    X, y = prepare_data(
        DATA_CONFIG["rides_file"],
        DATA_CONFIG["weather_file"],
        features,
        sample_size=sample_size
    )
    
    # 1. Statistical Ranking (F-Score)
    logger.info("Calculating F-Scores...")
    selector = SelectKBest(score_func=f_regression, k='all')
    selector.fit(X, y)
    f_scores = pd.DataFrame({'Feature': X.columns, 'F-Score': selector.scores_})
    f_scores = f_scores.sort_values(by='F-Score', ascending=False)
    
    # 2. Model-based Importance (Random Forest)
    logger.info("Training Random Forest for importance ranking...")
    rf = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    rf.fit(X, y)
    rf_importance = pd.DataFrame({'Feature': X.columns, 'Importance': rf.feature_importances_})
    rf_importance = rf_importance.sort_values(by='Importance', ascending=False)
    
    # Merge results
    results = f_scores.merge(rf_importance, on='Feature')
    
    print("\n" + "="*50)
    print("TOP 15 FEATURES BY IMPORTANCE")
    print("="*50)
    print(results.head(15).to_string(index=False))
    print("="*50)
    
    # Recommendations
    threshold = results['Importance'].mean() * 0.1
    weak_features = results[results['Importance'] < threshold]['Feature'].tolist()
    
    if weak_features:
        print(f"\n💡 Suggested Pruning (Importance < {threshold:.4f}):")
        for feat in weak_features:
            print(f"  - {feat}")
    
    return results

if __name__ == "__main__":
    analyze_features()
