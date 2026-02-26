"""
═══════════════════════════════════════════════════════════════════════════
TakuraBid Pricing Model - Data & Feature Engineering Pipeline
═══════════════════════════════════════════════════════════════════════════
Flexible pipeline for loading data and engineering features.
Designed to easily accommodate new data sources and features.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, Optional, Dict, Any
import logging
from config import (
    DATA_CONFIG, FEATURE_GROUPS, PREPROCESSING_CONFIG,
    OUTPUTS_DIR, LOGGING_CONFIG
)

# ============================================================================
# LOGGING SETUP
# ============================================================================
logging.basicConfig(
    level=getattr(logging, LOGGING_CONFIG["level"]),
    format=LOGGING_CONFIG["format"],
)
logger = logging.getLogger(__name__)

# ============================================================================
# DATA LOADING
# ============================================================================
def read_csvs(rides_file: Path, weather_file: Path) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Load ride and weather data with automatic encoding detection.
    
    Parameters:
    -----------
    rides_file : Path
        Path to cab rides file
    weather_file : Path
        Path to weather file
    
    Returns:
    --------
    Tuple[pd.DataFrame, pd.DataFrame]
        (rides_df, weather_df)
    """
    rides_df = None
    weather_df = None
    
    encodings = DATA_CONFIG["encodings"]
    delimiter = DATA_CONFIG["delimiter"]
    
    # Load rides data
    logger.info(f"Loading rides data from {rides_file}")
    for encoding in encodings:
        try:
            rides_df = pd.read_csv(rides_file, encoding=encoding, delimiter=delimiter)
            logger.info(f"✓ Rides data loaded successfully (encoding: {encoding})")
            logger.info(f"  Shape: {rides_df.shape}")
            break
        except (UnicodeDecodeError, pd.errors.ParserError) as e:
            logger.debug(f"  Failed with {encoding}: {type(e).__name__}")
            continue
    
    if rides_df is None:
        raise ValueError(f"Failed to load {rides_file} with any encoding")
    
    # Load weather data
    logger.info(f"Loading weather data from {weather_file}")
    for encoding in encodings:
        try:
            weather_df = pd.read_csv(weather_file, encoding=encoding, delimiter=delimiter)
            logger.info(f"✓ Weather data loaded successfully (encoding: {encoding})")
            logger.info(f"  Shape: {weather_df.shape}")
            break
        except (UnicodeDecodeError, pd.errors.ParserError) as e:
            logger.debug(f"  Failed with {encoding}: {type(e).__name__}")
            continue
    
    if weather_df is None:
        raise ValueError(f"Failed to load {weather_file} with any encoding")
    
    return rides_df, weather_df


# ============================================================================
# DATA CLEANING & PREPARATION
# ============================================================================
def clean_rides_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean rides dataset.
    - Remove duplicates
    - Handle missing values
    - Remove outliers (prices outside logical range)
    - Standardize column names
    """
    logger.info("Cleaning rides data...")
    original_size = len(df)
    
    # Standardize column names (handle various naming conventions)
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")
    
    logger.info(f"  Columns: {list(df.columns)}")
    
    # Drop duplicates
    df = df.drop_duplicates()
    logger.info(f"  Removed {original_size - len(df)} duplicates")
    
    # Find price column (might be named price, fare, cost, etc.)
    price_col = None
    for col in df.columns:
        if any(name in col for name in ["price", "fare", "cost", "amount"]):
            price_col = col
            break
    
    if price_col is None:
        raise ValueError(f"No price column found. Available: {list(df.columns)}")
    
    # Rename to standard 'price'
    if price_col != 'price':
        df = df.rename(columns={price_col: 'price'})
    
    # Remove price outliers
    min_price = DATA_CONFIG["min_price"]
    max_price = DATA_CONFIG["max_price"]
    
    outliers = len(df[(df['price'] < min_price) | (df['price'] > max_price)])
    df = df[(df['price'] >= min_price) & (df['price'] <= max_price)]
    
    if outliers > 0:
        logger.info(f"  Removed {outliers} price outliers (< ${min_price} or > ${max_price})")
    
    # Handle missing values in numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isna().any():
            df[col].fillna(df[col].mean(), inplace=True)
    
    logger.info(f"✓ Cleaned data shape: {df.shape}")
    return df


def clean_weather_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean weather dataset.
    """
    logger.info("Cleaning weather data...")
    
    # Standardize column names
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")
    
    # Handle datetime columns
    date_cols = [col for col in df.columns if 'date' in col or 'time' in col]
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    
    # Remove rows with missing values in key weather columns
    weather_cols = [col for col in df.columns if col not in ['date', 'datetime', 'timestamp']]
    df = df.dropna(subset=weather_cols, how='all')
    
    logger.info(f"✓ Cleaned weather shape: {df.shape}")
    return df


# ============================================================================
# FEATURE ENGINEERING
# ============================================================================
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Engineer features from rides and weather data.
    
    Features created:
    1. TEMPORAL: hour, day_of_week, cyclic encoding
    2. DERIVED: log transforms, non-linear features
    3. BUSINESS: peak hours, weekend flags
    4. PLACEHOLDERS: for future features (vehicle, load, driver, etc.)
    """
    logger.info("Engineering features...")
    
    # Ensure we have datetime column
    date_cols = [col for col in df.columns if 'date' in col.lower()]
    if date_cols:
        datetime_col = date_cols[0]
        if df[datetime_col].dtype == 'object':
            df[datetime_col] = pd.to_datetime(df[datetime_col], errors='coerce')
    else:
        logger.warning("  No datetime column found, creating synthetic timestamps")
        df['timestamp'] = pd.date_range(start='2023-01-01', periods=len(df), freq='h')
        datetime_col = 'timestamp'
    
    # ───────────────────────────────────────────────────────────────────────
    # TEMPORAL FEATURES
    # ───────────────────────────────────────────────────────────────────────
    
    # Extract time components
    df['hour'] = df[datetime_col].dt.hour
    df['day_of_week'] = df[datetime_col].dt.dayofweek  # 0=Monday, 6=Sunday
    df['day_of_month'] = df[datetime_col].dt.day
    df['month'] = df[datetime_col].dt.month
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    
    # Cyclic encoding (handles circular nature of time)
    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
    df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
    df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
    df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
    
    # Business logic features
    df['is_peak_hour'] = ((df['hour'] >= 7) & (df['hour'] <= 9) | 
                          (df['hour'] >= 16) & (df['hour'] <= 19)).astype(int)
    df['hour_to_peak'] = df['hour'].apply(
        lambda h: min(abs(h - 8), abs(h - 17.5), abs(h - 24))
    )
    
    logger.info("  ✓ Temporal features: hour, day, cyclic, peak_hour")
    
    # ───────────────────────────────────────────────────────────────────────
    # CORE FEATURES (from rides data)
    # ───────────────────────────────────────────────────────────────────────
    
    # Distance features
    if 'distance' in df.columns:
        df['distance_log'] = np.log1p(df['distance'])
        df['distance_sqrt'] = np.sqrt(df['distance'])
        df['distance_squared'] = df['distance'] ** 2
        logger.info("  ✓ Distance features: log, sqrt, squared")
    
    # ───────────────────────────────────────────────────────────────────────
    # WEATHER FEATURES
    # ───────────────────────────────────────────────────────────────────────
    
    # Temperature features
    if 'temperature' in df.columns:
        df['temp_squared'] = df['temperature'] ** 2
        logger.info("  ✓ Temperature features: squared")
    
    # Additional weather processing
    if 'precipitation' in df.columns:
        df['has_precipitation'] = (df['precipitation'] > 0).astype(int)
    
    # ───────────────────────────────────────────────────────────────────────
    # PLACEHOLDER FEATURES (for future TakuraBid integration)
    # ───────────────────────────────────────────────────────────────────────
    
    # These will be populated when real data becomes available
    
    # Route features (TODO: Google Maps API integration)
    # df['toll_cost'] = ... from Google Maps API
    # df['road_type'] = ... (highway, rural, urban)
    # df['elevation_gain'] = ... from Maps
    # df['border_crossing'] = ... (1 if route crosses border, 0 otherwise)
    
    # Vehicle features (TODO: TakuraBid vehicle data)
    # df['vehicle_type'] = ... (pickup, lorry, truck, flatbed, etc.)
    # df['vehicle_capacity'] = ...
    # df['vehicle_age'] = ...
    # df['vehicle_fuel_type'] = ...
    
    # Load features (TODO: TakuraBid load data)
    # df['load_type'] = ... (general, container, hazmat, perishable, bulk)
    # df['load_weight'] = ...
    # df['load_volume'] = ...
    # df['is_hazmat'] = ...
    
    # Driver features (TODO: TakuraBid driver data)
    # df['driver_experience_years'] = ...
    # df['driver_safety_rating'] = ...
    # df['driver_acceptance_rate'] = ...
    
    # Demand features (TODO: Market data)
    # df['demand_index'] = ... (calculated from platform activity)
    # df['competitor_count'] = ... (active competitors for route)
    # df['season_factor'] = ... (wet/dry season in Zimbabwe)
    # df['advance_booking_days'] = ...
    
    # Pricing features (TODO: Business logic)
    # df['fuel_surcharge'] = ... (based on diesel prices)
    # df['peak_multiplier'] = ... (surge pricing)
    # df['hazmat_premium'] = ... (if load is hazardous)
    # df['night_driving_fee'] = ... (if delivery between 20:00-06:00)
    
    logger.info("  ✓ Feature engineering complete")
    logger.info(f"  Total features: {len(df.columns)}")
    
    return df


# ============================================================================
# FEATURE SELECTION & VALIDATION
# ============================================================================
def select_features(df: pd.DataFrame, features_list: list) -> pd.DataFrame:
    """
    Select specified features from dataframe.
    Validates that all requested features exist.
    """
    missing = [f for f in features_list if f not in df.columns]
    if missing:
        logger.warning(f"  Missing features: {missing}")
        available = [f for f in features_list if f in df.columns]
        return df[available]
    
    return df[features_list]


# ============================================================================
# PREPARE DATA FOR MODELING
# ============================================================================
def prepare_data(
    rides_file: Path,
    weather_file: Path,
    features_list: list,
    test_size: float = 0.2,
    sample_size: int = None,
) -> Tuple[pd.DataFrame, pd.DataFrame, str]:
    """
    Complete data preparation pipeline.
    
    Parameters:
    -----------
    rides_file : Path
        Path to cab rides file
    weather_file : Path
        Path to weather file
    features_list : list
        Features to use
    test_size : float
        Test set size (0-1)
    sample_size : int
        Downsample to this many rows (None = use all data)
    
    Returns:
    --------
    X : pd.DataFrame
        Features
    y : pd.Series
        Target (price)
    feature_names : list
        Names of features used
    """
    logger.info("Starting data preparation pipeline...")
    
    # Load data
    rides_df, weather_df = read_csvs(rides_file, weather_file)
    
    # Sample if requested
    if sample_size and len(rides_df) > sample_size:
        logger.info(f"Sampling {sample_size:,} rows from {len(rides_df):,}")
        rides_df = rides_df.sample(n=sample_size, random_state=DATA_CONFIG["random_state"])
    
    # Clean data
    rides_df = clean_rides_data(rides_df)
    weather_df = clean_weather_data(weather_df)
    
    # Merge weather into rides (simple merge on date)
    if any('date' in col.lower() for col in rides_df.columns):
        rides_col = [col for col in rides_df.columns if 'date' in col.lower()][0]
        rides_df['date'] = pd.to_datetime(rides_df[rides_col]).dt.date
    
    if any('date' in col.lower() for col in weather_df.columns):
        weather_col = [col for col in weather_df.columns if 'date' in col.lower()][0]
        weather_df['date'] = pd.to_datetime(weather_df[weather_col]).dt.date
        
        rides_df = rides_df.merge(weather_df, on='date', how='left')
    
    # Engineer features
    rides_df = engineer_features(rides_df)
    
    # Select features
    X = select_features(rides_df, features_list)
    y = rides_df['price']
    
    logger.info(f"✓ Data preparation complete")
    logger.info(f"  X shape: {X.shape}")
    logger.info(f"  y shape: {y.shape}")
    logger.info(f"  Price range: ${y.min():.2f} - ${y.max():.2f}")
    logger.info(f"  Price mean: ${y.mean():.2f} (std: ${y.std():.2f})")
    
    return X, y


if __name__ == "__main__":
    from config import DATA_CONFIG, MODEL_VERSIONS
    
    print("═" * 75)
    print("Data & Feature Engineering Pipeline")
    print("═" * 75)
    
    # Load and prepare data
    features = MODEL_VERSIONS["v2_current"]["features"]
    
    try:
        X, y = prepare_data(
            DATA_CONFIG["rides_file"],
            DATA_CONFIG["weather_file"],
            features,
        )
        
        print("\n✓ Data preparation successful!")
        print(f"  Features: {len(X.columns)}")
        print(f"  Samples: {len(X)}")
        print(f"  Price statistics:")
        print(f"    Mean: ${y.mean():.2f}")
        print(f"    Median: ${y.median():.2f}")
        print(f"    Std Dev: ${y.std():.2f}")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
