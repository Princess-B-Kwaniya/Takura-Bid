"""
═══════════════════════════════════════════════════════════════════════════
TakuraBid Pricing Model - Training Script
═══════════════════════════════════════════════════════════════════════════
Flexible model training with support for multiple model versions.
Easy to switch between models and versions.

Usage:
  python train_model.py --version v2_current --save
  python train_model.py --version baseline
"""

import argparse
import json
import logging
from pathlib import Path
from typing import Dict, Any, Tuple
from datetime import datetime
import pickle
import joblib

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    VotingRegressor,
)
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)

from config import (
    DATA_CONFIG, MODEL_VERSIONS, MODELS_DIR, OUTPUTS_DIR,
    PREPROCESSING_CONFIG, LOGGING_CONFIG, PERFORMANCE_TARGETS,
)
from data_pipeline import prepare_data

# ============================================================================
# LOGGING
# ============================================================================
logging.basicConfig(
    level=getattr(logging, LOGGING_CONFIG["level"]),
    format=LOGGING_CONFIG["format"],
)
logger = logging.getLogger(__name__)

# ============================================================================
# MODEL TRAINING
# ============================================================================
class ModelTrainer:
    """
    Flexible model trainer supporting multiple model versions.
    """
    
    def __init__(self, version: str = "baseline"):
        """
        Initialize trainer with a model version.
        
        Parameters:
        -----------
        version : str
            Model version key from MODEL_VERSIONS config
        """
        if version not in MODEL_VERSIONS:
            raise ValueError(f"Unknown version: {version}. Available: {list(MODEL_VERSIONS.keys())}")
        
        self.version = version
        self.config = MODEL_VERSIONS[version]
        self.model = None
        self.scaler = None
        self.history = {}
        
        logger.info(f"Initialized trainer for {self.config['name']} ({version})")
    
    def _build_model(self):
        """Build model based on configuration."""
        model_type = self.config["model_type"]
        params = self.config["model_params"]
        
        logger.info(f"Building {model_type} model...")
        
        if model_type == "RandomForestRegressor":
            self.model = RandomForestRegressor(**params)
        elif model_type == "GradientBoostingRegressor":
            self.model = GradientBoostingRegressor(**params)
        elif model_type == "VotingRegressor":
            # Build sub-models
            estimators = [
                ("rf", RandomForestRegressor(n_estimators=150, max_depth=20)),
                ("gb", GradientBoostingRegressor(n_estimators=150, learning_rate=0.08)),
            ]
            self.model = VotingRegressor(estimators=estimators)
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        logger.info(f"✓ Model built: {self.model.__class__.__name__}")
    
    def load_and_prepare_data(self) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Load and prepare training data.
        
        Returns:
        --------
        X_train, X_test, y_train, y_test
        """
        logger.info(f"Loading data with features: {len(self.config['features'])} features")
        
        X, y = prepare_data(
            DATA_CONFIG["rides_file"],
            DATA_CONFIG["weather_file"],
            self.config["features"],
            sample_size=DATA_CONFIG.get("sample_size"),  # Use sampled data if configured
        )
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=DATA_CONFIG["test_size"],
            random_state=DATA_CONFIG["random_state"],
        )
        
        logger.info(f"✓ Data split:")
        logger.info(f"  Training: {len(X_train)} samples")
        logger.info(f"  Testing: {len(X_test)} samples")
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        logger.info(f"✓ Features scaled")
        
        return X_train_scaled, X_test_scaled, y_train.values, y_test.values
    
    def train(self) -> Dict[str, Any]:
        """
        Train model and evaluate on test set.
        
        Returns:
        --------
        Dict with training history and metrics
        """
        logger.info(f"\n{'='*75}")
        logger.info(f"Training {self.config['name']} ({self.version})")
        logger.info(f"{'='*75}")
        
        # Build model
        self._build_model()
        
        # Load and prepare data
        X_train, X_test, y_train, y_test = self.load_and_prepare_data()
        
        # Train
        logger.info(f"\nTraining model...")
        self.model.fit(X_train, y_train)
        logger.info(f"✓ Model trained")
        
        # Evaluate
        y_pred_train = self.model.predict(X_train)
        y_pred_test = self.model.predict(X_test)
        
        # Calculate metrics
        metrics = {
            "train": {
                "mae": mean_absolute_error(y_train, y_pred_train),
                "rmse": np.sqrt(mean_squared_error(y_train, y_pred_train)),
                "r2": r2_score(y_train, y_pred_train),
            },
            "test": {
                "mae": mean_absolute_error(y_test, y_pred_test),
                "rmse": np.sqrt(mean_squared_error(y_test, y_pred_test)),
                "r2": r2_score(y_test, y_pred_test),
            },
        }
        
        # Calculate accuracy metrics
        accuracy_within_10 = np.mean(np.abs(y_pred_test - y_test) <= 10) * 100
        accuracy_within_5 = np.mean(np.abs(y_pred_test - y_test) <= 5) * 100
        accuracy_within_20pct = np.mean(
            np.abs(y_pred_test - y_test) <= y_test * 0.2
        ) * 100
        
        metrics["test"]["accuracy_within_10"] = accuracy_within_10
        metrics["test"]["accuracy_within_5"] = accuracy_within_5
        metrics["test"]["accuracy_within_20pct"] = accuracy_within_20pct
        
        self.history = metrics
        
        # Log results
        logger.info(f"\n{'─'*75}")
        logger.info(f"TRAINING RESULTS")
        logger.info(f"{'─'*75}")
        logger.info(f"\nTraining Set Metrics:")
        logger.info(f"  MAE:  ${metrics['train']['mae']:.2f}")
        logger.info(f"  RMSE: ${metrics['train']['rmse']:.2f}")
        logger.info(f"  R²:   {metrics['train']['r2']:.4f}")
        
        logger.info(f"\nTest Set Metrics:")
        logger.info(f"  MAE:  ${metrics['test']['mae']:.2f}")
        logger.info(f"  RMSE: ${metrics['test']['rmse']:.2f}")
        logger.info(f"  R²:   {metrics['test']['r2']:.4f}")
        
        logger.info(f"\nAccuracy Metrics:")
        logger.info(f"  Within ±$10:  {accuracy_within_10:.1f}%")
        logger.info(f"  Within ±$5:   {accuracy_within_5:.1f}%")
        logger.info(f"  Within ±20%:  {accuracy_within_20pct:.1f}%")
        
        # Compare to targets
        target = PERFORMANCE_TARGETS.get(self.version, {})
        if target:
            target_r2 = target.get("r2_score", 0)
            target_mae = target.get("mae", float('inf'))
            
            r2_status = "✓" if metrics["test"]["r2"] >= target_r2 else "○"
            mae_status = "✓" if metrics["test"]["mae"] <= target_mae else "○"
            
            logger.info(f"\nTarget Comparison:")
            logger.info(f"  R²  {r2_status} {metrics['test']['r2']:.4f} (target: ≥ {target_r2})")
            logger.info(f"  MAE {mae_status} ${metrics['test']['mae']:.2f} (target: < ${target_mae})")
        
        logger.info(f"{'─'*75}\n")
        
        return metrics
    
    def save_model(self, output_dir: Path = None) -> Dict[str, Path]:
        """
        Save model and metadata to disk.
        
        Returns:
        --------
        Dict with paths to saved files
        """
        if output_dir is None:
            output_dir = MODELS_DIR
        
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True)
        
        # Generate filenames
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = f"{self.version}_model"
        
        model_file = output_dir / f"{base_name}.joblib"
        scaler_file = output_dir / f"{base_name}_scaler.joblib"
        metadata_file = output_dir / f"{base_name}_metadata.json"
        
        # Save model
        joblib.dump(self.model, model_file)
        logger.info(f"✓ Model saved: {model_file}")
        
        # Save scaler
        joblib.dump(self.scaler, scaler_file)
        logger.info(f"✓ Scaler saved: {scaler_file}")
        
        # Save metadata
        metadata = {
            "version": self.version,
            "timestamp": timestamp,
            "config": self.config,
            "history": self.history,
            "features": self.config["features"],
            "feature_count": len(self.config["features"]),
        }
        
        with open(metadata_file, "w") as f:
            json.dump(metadata, f, indent=2)
        logger.info(f"✓ Metadata saved: {metadata_file}")
        
        return {
            "model": model_file,
            "scaler": scaler_file,
            "metadata": metadata_file,
        }
    
    def print_summary(self):
        """Print training summary."""
        if not self.history:
            logger.warning("No training history. Train model first.")
            return
        
        print(f"\n{'='*75}")
        print(f"MODEL SUMMARY: {self.config['name']}")
        print(f"{'='*75}")
        print(f"\nVersion: {self.version} ({self.config['version']})")
        print(f"Description: {self.config['description']}")
        print(f"\nFeatures: {len(self.config['features'])}")
        print(f"  {', '.join(self.config['features'][:5])}...")
        print(f"\nPerformance on Test Set:")
        print(f"  R²:   {self.history['test']['r2']:.4f}")
        print(f"  MAE:  ${self.history['test']['mae']:.2f}")
        print(f"  RMSE: ${self.history['test']['rmse']:.2f}")
        print(f"{'='*75}\n")


# ============================================================================
# MAIN
# ============================================================================
def main():
    parser = argparse.ArgumentParser(
        description="Train TakuraBid pricing model"
    )
    parser.add_argument(
        "--version",
        type=str,
        default="v2_current",
        choices=list(MODEL_VERSIONS.keys()),
        help="Model version to train",
    )
    parser.add_argument(
        "--save",
        action="store_true",
        help="Save trained model to disk",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=MODELS_DIR,
        help="Output directory for model files",
    )
    
    args = parser.parse_args()
    
    # Initialize and train
    trainer = ModelTrainer(version=args.version)
    metrics = trainer.train()
    
    # Save if requested
    if args.save:
        paths = trainer.save_model(args.output_dir)
        logger.info(f"\n✓ Model saved to {args.output_dir}")
    
    trainer.print_summary()


if __name__ == "__main__":
    main()
