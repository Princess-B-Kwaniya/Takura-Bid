#!/usr/bin/env python3
"""Test the Next.js bridge API integration"""

import requests
import json
from datetime import datetime, timedelta

print("\n" + "="*70)
print("🧪 Testing AI Pricing Integration")
print("="*70 + "\n")

# Test 1: FastAPI ML service
print("Test 1: FastAPI ML Service")
print("-" * 70)
ml_response = requests.post('http://localhost:8000/estimate', json={
    'distance': 50,
    'hour': 14,
    'day_of_week': 2,
    'temperature': 25,
    'precipitation': 0
})
print(f"✓ ML API Status: {ml_response.status_code}")
ml_data = ml_response.json()
print(f"  Estimate: ${ml_data['estimate_usd']:.2f}")
print(f"  Range: ${ml_data['range']['min']:.2f} - ${ml_data['range']['max']:.2f}")
print(f"  Confidence: {ml_data['confidence']*100:.1f}%")

# Test 2: Next.js Bridge API
print("\n\nTest 2: Next.js Bridge API")
print("-" * 70)
tomorrow = (datetime.now() + timedelta(days=1)).isoformat()
bridge_response = requests.post(
    'http://localhost:3000/api/pricing/estimate',
    json={
        'distance_km': 50,
        'pickup_datetime': tomorrow,
        'temperature': 25,
        'precipitation': 0
    }
)

print(f"Status: {bridge_response.status_code}")
if bridge_response.status_code == 200:
    print("✓ Bridge API Working!")
    bridge_data = bridge_response.json()
    print(f"  Expected Price: ${bridge_data['suggested_bid']:.2f}")
    print(f"  Breakdown:")
    for key, val in bridge_data['breakdown'].items():
        print(f"    - {key}: ${val:.2f}")
else:
    print(f"✗ Error: {bridge_response.status_code}")
    print(bridge_response.text)

print("\n" + "="*70)
