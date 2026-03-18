# TakuraBid-AI: Intelligent Pricing Engine for Zimbabwean Logistics

## Executive Summary
TakuraBid-AI is a professional-grade Machine Learning engine designed to solve the critical problem of pricing volatility and exploitation in the Zimbabwean haulage sector. By integrating real-world macro-economic signals with high-fidelity logistics variables, the engine suggests a Fair Market Floor Price that protects both shippers and drivers.

---

## Technical Problem Statement
The domestic logistics market in Zimbabwe often lacks transparent pricing data, leading to informal negotiations that ignore critical operational costs. TakuraBid-AI addresses this by modeling the complex interplay between fixed fuel costs, infrastructure risks (road quality), regulatory expenses (ZINARA tolls), and market demand volatility.

---

## Data Architecture and Integration
The engine utilizes a unified Master Dataset (takurabid_training_data_master.csv) built upon three pillars of data:

1. Macro-Economic Signals:
   - Real-time Fuel Trends (sourced from World Bank energy metadata).
   - Market Demand Indices (derived from WFP food price signals).
2. Logistics Dynamics (Ground-Truth):
   - Backhaul (Empty Leg) Probability: Models a 20-30% discount for return trips to optimize corridor efficiency.
   - Infrastructure Risk (Pothole Factor): A 1-5 road quality index that acts as a cost multiplier for wear-and-tear.
   - ZINARA Toll Mapping: Precise $20.00 gate fees for heavy vehicles across major A1-A8 corridors.
   - Border Step-Costs: Integration of the $122.00 Beitbridge fee for cross-border logistics.
3. Synthetic Synthesis: 3,000 high-fidelity trip scenarios generated using a Cost-Plus Logistics Profit Margin formula.

---

## Machine Learning Objectives
- Cost-Plus Regression: Predicting the operational baseline of any trip with high precision.
- Ensemble Specialization: Leveraging multiple algorithms to handle different data patterns (Linear costs vs. non-linear risks).
- Explainable AI (XAI): Using SHAP values to provide transparency into why a specific bid price was suggested.
- Hyperparameter Optimization: Automated calibration using Optuna to ensure the lowest possible Mean Absolute Error (MAE).

---

## Model Performance and Architecture
The engine employs a Stacking Specialist Ensemble, acting as a Committee of Experts:

- Linear Regression: Captures the basic fixed relationship between distance and fuel.
- Random Forest: Stabilizes the model against outliers and extreme road conditions.
- XGBoost and LightGBM: Optimized specialists that handle categorical variables (Truck Class) and complex step-costs.
- CatBoost (Meta-Learner): The final decision-maker that fuses all specialist insights into the final bid.

| Metric | Performance Value |
| :--- | :--- |
| Accuracy (1 - MAPE) | 96.5% - 98.9% |
| Average Error (MAE) | < $10.00 USD |
| R-Squared Score | 0.99+ |

---

## Key Project Modules
- Exploratory Data Analysis (EDA): Visualizations showing price corridors and road quality correlations.
- Optuna Tuning Studio: Fully transparent automated tuning process for technical evaluation.
- SHAP Interpretability: Summary plots illustrating the priority of Urgency and Road Quality in bid formation.
- Real-Time Bidding Simulator: A functional interface within the notebook for instant pricing recommendations.

---

## Usage Guide
1. Interactive Notebook: Open TakuraBid_ML-engine.ipynb for the full technical walkthrough and visualization suite.
2. Master Dataset: Refer to data/takurabid_training_data_master.csv for the consolidated training labels and features.
3. Price Inference: Use the get_calibrated_bid() function in Chapter 10 for real-time market predictions.

---
Developed for the TakuraBid Freight Platform. Standardizing logistics pricing for a more equitable market.
