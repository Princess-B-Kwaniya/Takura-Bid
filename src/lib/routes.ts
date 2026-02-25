/**
 * Zimbabwe route distance lookup and utility functions.
 * Distances based on road network (not straight-line).
 */

// Bi-directional distance map in km
const ROUTE_DISTANCES: Record<string, Record<string, number>> = {
  Harare: {
    Bulawayo: 439,
    Gweru: 275,
    Mutare: 263,
    Masvingo: 292,
    'Victoria Falls': 879,
    Chinhoyi: 116,
    Kariba: 365,
  },
  Bulawayo: {
    Harare: 439,
    Gweru: 164,
    Mutare: 570,
    Masvingo: 292,
    'Victoria Falls': 440,
    Chinhoyi: 555,
    Kariba: 690,
  },
  Gweru: {
    Harare: 275,
    Bulawayo: 164,
    Mutare: 520,
    Masvingo: 200,
    'Victoria Falls': 604,
    Chinhoyi: 391,
    Kariba: 520,
  },
  Mutare: {
    Harare: 263,
    Bulawayo: 570,
    Gweru: 520,
    Masvingo: 300,
    'Victoria Falls': 1100,
    Chinhoyi: 379,
    Kariba: 628,
  },
  Masvingo: {
    Harare: 292,
    Bulawayo: 292,
    Gweru: 200,
    Mutare: 300,
    'Victoria Falls': 732,
    Chinhoyi: 408,
    Kariba: 550,
  },
  'Victoria Falls': {
    Harare: 879,
    Bulawayo: 440,
    Gweru: 604,
    Mutare: 1100,
    Masvingo: 732,
    Chinhoyi: 995,
    Kariba: 580,
  },
  Chinhoyi: {
    Harare: 116,
    Bulawayo: 555,
    Gweru: 391,
    Mutare: 379,
    Masvingo: 408,
    'Victoria Falls': 995,
    Kariba: 180,
  },
  Kariba: {
    Harare: 365,
    Bulawayo: 690,
    Gweru: 520,
    Mutare: 628,
    Masvingo: 550,
    'Victoria Falls': 580,
    Chinhoyi: 180,
  },
}

export const CITIES = [
  'Harare',
  'Bulawayo',
  'Gweru',
  'Mutare',
  'Masvingo',
  'Victoria Falls',
  'Chinhoyi',
  'Kariba',
] as const

export type City = (typeof CITIES)[number]

/**
 * Get the road distance between two cities in km.
 * Returns null if the route is not found.
 */
export function getDistance(origin: string, destination: string): number | null {
  return ROUTE_DISTANCES[origin]?.[destination] ?? null
}

/**
 * Estimate driving duration in hours for a given distance.
 * Average speed ~80 km/h on Zimbabwean roads.
 */
export function estimateDuration(distanceKm: number): number {
  return Math.round((distanceKm / 80) * 10) / 10
}

/** Pre-built route suggestions for multi-stop optimization */
export const ROUTE_SUGGESTIONS = [
  {
    label: 'Southern Circuit',
    stops: ['Harare', 'Bulawayo', 'Victoria Falls', 'Harare'],
    legs: [
      { from: 'Harare', to: 'Bulawayo', km: 439, hours: 5.5 },
      { from: 'Bulawayo', to: 'Victoria Falls', km: 440, hours: 5.5 },
      { from: 'Victoria Falls', to: 'Harare', km: 879, hours: 11 },
    ],
    totalKm: 1758,
    totalHours: 22,
    fuelSavings: 15,
  },
  {
    label: 'Eastern Loop',
    stops: ['Harare', 'Mutare', 'Masvingo', 'Gweru', 'Harare'],
    legs: [
      { from: 'Harare', to: 'Mutare', km: 263, hours: 3.3 },
      { from: 'Mutare', to: 'Masvingo', km: 300, hours: 3.8 },
      { from: 'Masvingo', to: 'Gweru', km: 200, hours: 2.5 },
      { from: 'Gweru', to: 'Harare', km: 275, hours: 3.4 },
    ],
    totalKm: 1038,
    totalHours: 13,
    fuelSavings: 18,
  },
  {
    label: 'Northern Route',
    stops: ['Harare', 'Chinhoyi', 'Kariba', 'Harare'],
    legs: [
      { from: 'Harare', to: 'Chinhoyi', km: 116, hours: 1.5 },
      { from: 'Chinhoyi', to: 'Kariba', km: 180, hours: 2.3 },
      { from: 'Kariba', to: 'Harare', km: 365, hours: 4.6 },
    ],
    totalKm: 661,
    totalHours: 8.4,
    fuelSavings: 12,
  },
]

/** Cargo type labels used across the application */
export const CARGO_TYPES = [
  'Building Materials',
  'Agricultural Products',
  'Consumer Goods',
  'Tourism Equipment',
  'Mining Equipment',
  'Heavy Machinery',
  'Hazardous Materials',
  'General Freight',
] as const

/** Special requirement options */
export const SPECIAL_REQUIREMENTS = [
  'Flatbed Truck',
  'Crane Loading',
  'Insurance Required',
  'Refrigerated Truck',
  'Covered Transport',
  'Low-Loader',
  'Escort Vehicle',
  'Hazmat Certified',
] as const
