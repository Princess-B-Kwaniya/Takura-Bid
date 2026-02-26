#!/usr/bin/env python
"""
Quick test script for TakuraBid API
Tests all endpoints and shows sample predictions
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

print("\n" + "="*75)
print("🧪 TakuraBid Pricing API - Test Suite")
print("="*75 + "\n")

# Test 1: Health check
print("Test 1: Health Check")
try:
    response = requests.get(f"{BASE_URL}/health")
    print(f"✓ Status: {response.status_code}")
    print(f"  {response.json()}")
except Exception as e:
    print(f"✗ Failed: {e}")
    print("  Make sure API is running: python ml/api.py")

print()

# Test 2: Model info
print("Test 2: Model Information")
try:
    response = requests.get(f"{BASE_URL}/model-info")
    data = response.json()
    print(f"✓ Status: {response.status_code}")
    print(f"  Version: {data['version']}")
    print(f"  Features: {data['feature_count']}")
    print(f"  Test R²: {data['test_r2']}")
    print(f"  Test MAE: ${data['test_mae']}")
except Exception as e:
    print(f"✗ Failed: {e}")

print()

# Test 3: Sample predictions
print("Test 3: Sample Price Estimates")
test_cases = [
    {
        "name": "Short ride, morning",
        "data": {"distance": 10, "hour": 8, "day_of_week": 2, "temperature": 20, "precipitation": 0}
    },
    {
        "name": "Long ride, afternoon",
        "data": {"distance": 100, "hour": 14, "day_of_week": 3, "temperature": 28, "precipitation": 0}
    },
    {
        "name": "Medium ride, peak hour",
        "data": {"distance": 50, "hour": 18, "day_of_week": 4, "temperature": 22, "precipitation": 2}
    },
    {
        "name": "Short ride, evening",
        "data": {"distance": 15, "hour": 20, "day_of_week": 5, "temperature": 18, "precipitation": 0.5}
    },
]

for i, test in enumerate(test_cases, 1):
    try:
        response = requests.post(
            f"{BASE_URL}/estimate",
            json=test["data"],
            timeout=5
        )
        result = response.json()
        
        print(f"  Example {i}: {test['name']}")
        print(f"    Input: {test['data']['distance']}km, {test['data']['hour']}:00")
        print(f"    Estimate: ${result['estimate_usd']:.2f}")
        print(f"    Range: ${result['range']['min']:.2f} - ${result['range']['max']:.2f}")
        print(f"    Confidence: {result['confidence']*100:.0f}%")
        print()
    except Exception as e:
        print(f"  Example {i}: ✗ Failed - {e}")

print("\n" + "="*75)
print("✓ All tests completed!")
print("="*75 + "\n")

print("📍 Access the web demo at: http://localhost:8000")
print("📍 API Documentation at: http://localhost:8000/docs")
print()
