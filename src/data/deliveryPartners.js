// ─── India delivery partners ────────────────────────────────────────────────
// Used in onboarding Step 4 and storefront fee calculation

export const DELIVERY_PARTNERS = [
  {
    id: 'dunzo',
    name: 'Dunzo Business',
    logo: '🟡',
    tagline: 'Hyperlocal deliveries in 30–60 min',
    range: '0–8 km',
    baseFee: 35,
    perKmRate: 6,
    maxFee: 90,
    estimatedTime: '30–60 min',
    category: 'Hyperlocal',
  },
  {
    id: 'porter',
    name: 'Porter',
    logo: '🟠',
    tagline: 'Reliable same-day citywide delivery',
    range: 'Within city',
    baseFee: 70,
    perKmRate: 9,
    maxFee: 250,
    estimatedTime: '1–3 hrs',
    category: 'Citywide',
  },
  {
    id: 'shadowfax',
    name: 'Shadowfax',
    logo: '🔵',
    tagline: 'Scheduled & same-day delivery at scale',
    range: '0–15 km',
    baseFee: 45,
    perKmRate: 7,
    maxFee: 140,
    estimatedTime: '2–6 hrs',
    category: 'Scheduled',
  },
  {
    id: 'borzo',
    name: 'Borzo (WeFast)',
    logo: '🟢',
    tagline: 'Fast bike deliveries across the city',
    range: '0–12 km',
    baseFee: 30,
    perKmRate: 5,
    maxFee: 80,
    estimatedTime: '25–45 min',
    category: 'Hyperlocal',
  },
  {
    id: 'swiggy_genie',
    name: 'Swiggy Genie',
    logo: '🟠',
    tagline: 'Send anything in your city',
    range: '0–5 km',
    baseFee: 25,
    perKmRate: 8,
    maxFee: 70,
    estimatedTime: '20–40 min',
    category: 'Hyperlocal',
  },
  {
    id: 'lalamove',
    name: 'Lalamove',
    logo: '🔴',
    tagline: 'On-demand logistics for businesses',
    range: '0–20 km',
    baseFee: 60,
    perKmRate: 10,
    maxFee: 300,
    estimatedTime: '45 min–2 hrs',
    category: 'Citywide',
  },
]

// ─── Calculate delivery fee ───────────────────────────────────────────────────
// Simple linear model: baseFee + (distance × perKmRate), capped at maxFee
export function calcDeliveryFee(partner, distanceKm) {
  if (!partner || !distanceKm) return 0
  const fee = partner.baseFee + Math.round(distanceKm * partner.perKmRate)
  return Math.min(fee, partner.maxFee)
}

// ─── Mock distance (for prototype — pretends to geocode the address) ───────
export function mockDistanceFromAddress(address) {
  // Generates a consistent pseudo-random distance from an address string
  const hash = address.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const km = 1.5 + (hash % 85) / 10 // 1.5 – 10 km
  return Math.round(km * 10) / 10
}
