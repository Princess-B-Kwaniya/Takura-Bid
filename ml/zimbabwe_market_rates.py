"""
TakuraBid Market Benchmarking Data
Standard rates for Zimbabwe logistics and transport (2024-2025)
"""

MARKET_RATES = {
    "ride_hailing": {
        "base_fare": 0.80,  # Bolt launch base
        "per_km": 0.50,    # Estimated per km for small vehicles
        "min_fare": 2.00
    },
    "logistics_small": {
        "swift_express_base": 7.00,  # 0-5 lbs
        "swift_express_medium": 15.00, # 10-19 lbs
        "per_lb_heavy": 1.00
    },
    "logistics_heavy": {
        "per_ton_km": 2.20,  # Estimated regional rate for trucking (USD/ton/km)
        "minimum_load_fee": 50.00
    }
}

def calculate_market_baseline(distance_km, weight_tons=1.0, urgency="Standard"):
    """
    Calculates a baseline market price for comparison.
    """
    # Logistics Calculation (Tone-KM model)
    rate = MARKET_RATES["logistics_heavy"]["per_ton_km"]
    
    # Adjust for urgency
    if urgency == "Urgent":
        rate *= 1.3
        
    baseline = (distance_km * weight_tons * rate) + MARKET_RATES["logistics_heavy"]["minimum_load_fee"]
    
    return round(baseline, 2)
