import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Initial seed data with rich Bengaluru traffic incidents & transit info
const initialSeedData = {
  users: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Arjun Rao',
      email: 'commuter@smartroute.ai',
      role: 'commuter',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      phone: '+91 98450 12345',
      trustScore: 120,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Inspector Ramesh Kumar',
      email: 'warden@smartroute.ai',
      role: 'warden',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      phone: '+91 98450 23456',
      trustScore: 450,
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Bengaluru Traffic Command',
      email: 'admin@smartroute.ai',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      phone: '+91 80 2294 2222',
      trustScore: 1000,
      createdAt: new Date(Date.now() - 180 * 86400000).toISOString()
    }
  ],
  incidents: [
    {
      id: 'inc-001',
      reporterId: '22222222-2222-2222-2222-222222222222',
      reporterName: 'Inspector Ramesh Kumar (Warden)',
      incidentType: 'accident',
      title: 'Multi-vehicle collision on Hebbal Flyover incline',
      description: '3-car pileup blocking 2 lanes towards Yelahanka / Airport. Traffic police crane dispatched. Heavy tailbacks extending to Esteem Mall. Commuters advised to use Nagawara - Thanisandra road.',
      latitude: 13.0358,
      longitude: 77.5970,
      addressText: 'Hebbal Flyover, Bellary Road, Bengaluru',
      severity: 'critical',
      status: 'confirmed',
      verificationState: 'verified',
      upvotes: 48,
      photoUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80',
      estimatedDelayMinutes: 40,
      affectedDirection: 'Northbound (Airport Bound)',
      createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60000).toISOString()
    },
    {
      id: 'inc-002',
      reporterId: '11111111-1111-1111-1111-111111111111',
      reporterName: 'Arjun Rao (Commuter)',
      incidentType: 'flooding',
      title: 'Severe Waterlogging under Marathahalli Railway Underpass',
      description: 'Sudden monsoon rainwater accumulation up to 2.5 feet. Multiple two-wheelers and sedans stalled. Heavy buses passing slowly. Divert via HAL Old Airport Road or Varthur.',
      latitude: 12.9562,
      longitude: 77.7011,
      addressText: 'Outer Ring Road, Marathahalli, Bengaluru',
      severity: 'critical',
      status: 'confirmed',
      verificationState: 'verified',
      upvotes: 94,
      photoUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
      estimatedDelayMinutes: 50,
      affectedDirection: 'Both Directions',
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: 'inc-003',
      reporterId: '11111111-1111-1111-1111-111111111111',
      reporterName: 'Suresh Kumar',
      incidentType: 'congestion',
      title: 'Massive Gridlock at Central Silk Board Junction',
      description: 'Extended signal waiting cycles combined with ongoing Yellow Line Metro integration barricades. Waiting time exceeds 5 signal cycles. Tailback up to HSR 5th Main.',
      latitude: 12.9176,
      longitude: 77.6234,
      addressText: 'Central Silk Board, Hosur Road, Bengaluru',
      severity: 'high',
      status: 'confirmed',
      verificationState: 'verified',
      upvotes: 126,
      photoUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
      estimatedDelayMinutes: 35,
      affectedDirection: 'Towards Electronic City & BTM',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
      id: 'inc-004',
      reporterId: '11111111-1111-1111-1111-111111111111',
      reporterName: 'Siddharth M.',
      incidentType: 'breakdown',
      title: 'Broken-down BMTC Volvo Bus at Tin Factory Choke Point',
      description: 'Air brake locking failure on right lane before KR Puram railway bridge. Tow truck on site attempting clearance. Crawling speed of 5 km/h.',
      latitude: 12.9934,
      longitude: 77.6608,
      addressText: 'Old Madras Road, Tin Factory, Bengaluru',
      severity: 'high',
      status: 'under_review',
      verificationState: 'community',
      upvotes: 31,
      photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
      estimatedDelayMinutes: 25,
      affectedDirection: 'Eastbound towards Whitefield',
      createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60000).toISOString()
    },
    {
      id: 'inc-005',
      reporterId: '11111111-1111-1111-1111-111111111111',
      reporterName: 'Pooja Nair',
      incidentType: 'pothole',
      title: 'Hazardous deep crater potholes near Bellandur EcoWorld',
      description: 'Cluster of 3 large craters exposed along the service road merge into main carriageway. High risk for two-wheelers. BBMP asphalt team requested.',
      latitude: 12.9260,
      longitude: 77.6833,
      addressText: 'Outer Ring Road, Bellandur, Bengaluru',
      severity: 'medium',
      status: 'reported',
      verificationState: 'community',
      upvotes: 22,
      photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      estimatedDelayMinutes: 10,
      affectedDirection: 'Service road & Left lane',
      createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 75 * 60000).toISOString()
    },
    {
      id: 'inc-006',
      reporterId: '33333333-3333-3333-3333-333333333333',
      reporterName: 'Bengaluru Traffic Command',
      incidentType: 'closure',
      title: 'Nightly road closure on Avenue Road for Metro underground tunneling',
      description: 'Chickpet to Avenue Road closed for heavy transit vehicles from 10:00 PM to 06:00 AM daily. Alternative route via Mysore Road and KR Market Flyover.',
      latitude: 12.9702,
      longitude: 77.5752,
      addressText: 'Avenue Road, Chickpet, Bengaluru',
      severity: 'medium',
      status: 'confirmed',
      verificationState: 'verified',
      upvotes: 39,
      photoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
      estimatedDelayMinutes: 15,
      affectedDirection: 'Full closure both directions',
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'inc-007',
      reporterId: '11111111-1111-1111-1111-111111111111',
      reporterName: 'Rohan K.',
      incidentType: 'hazard',
      title: 'Diesel slick on Electronic City Phase 1 exit ramp',
      description: 'Fuel leak from commercial transport vehicle. NHAI patrol spreading sand to prevent skidding. Speed limit lowered to 20 km/h.',
      latitude: 12.8452,
      longitude: 77.6602,
      addressText: 'Electronic City Elevated Tollway Exit, Bengaluru',
      severity: 'high',
      status: 'confirmed',
      verificationState: 'verified',
      upvotes: 56,
      photoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      estimatedDelayMinutes: 20,
      affectedDirection: 'Exit ramp to Phase 1',
      createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 60000).toISOString()
    },
    {
      id: 'inc-008',
      reporterId: '22222222-2222-2222-2222-222222222222',
      reporterName: 'Inspector Ramesh Kumar',
      incidentType: 'accident',
      title: 'Fender bender cleared at Sony World Junction Koramangala',
      description: 'Two-car side swipe resolved by traffic personnel. Vehicles moved to shoulder and flow normalized.',
      latitude: 12.9345,
      longitude: 77.6277,
      addressText: '100ft Road, Koramangala 4th Block, Bengaluru',
      severity: 'low',
      status: 'resolved',
      verificationState: 'verified',
      upvotes: 71,
      photoUrl: '',
      estimatedDelayMinutes: 0,
      affectedDirection: 'Normal flow resumed',
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60000).toISOString()
    },
    {
      id: 'inc-009',
      reporterId: '11111111-1111-1111-1111-111111111111',
      reporterName: 'Karthik V.',
      incidentType: 'congestion',
      title: 'Slow moving traffic at Goraguntepalya / Yeshwantpur',
      description: 'Heavy truck movement merging with Tumkur Road National Highway. 15 minute backlog.',
      latitude: 13.0285,
      longitude: 77.5401,
      addressText: 'Goraguntepalya Junction, Tumkur Road, Bengaluru',
      severity: 'medium',
      status: 'reported',
      verificationState: 'community',
      upvotes: 18,
      photoUrl: '',
      estimatedDelayMinutes: 15,
      affectedDirection: 'Outbound towards Peenya',
      createdAt: new Date(Date.now() - 65 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 65 * 60000).toISOString()
    },
    {
      id: 'inc-010',
      reporterId: '22222222-2222-2222-2222-222222222222',
      reporterName: 'Inspector Ramesh Kumar',
      incidentType: 'hazard',
      title: 'Uprooted tree branch cleared on Sankey Road',
      description: 'BBMP forest wing has chopped and removed the fallen branch from the main road. Both lanes reopened.',
      latitude: 12.9982,
      longitude: 77.5756,
      addressText: 'Sankey Road, Sadashivanagar, Bengaluru',
      severity: 'low',
      status: 'resolved',
      verificationState: 'verified',
      upvotes: 43,
      photoUrl: '',
      estimatedDelayMinutes: 0,
      affectedDirection: 'Fully cleared',
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 3600000).toISOString()
    }
  ],
  incidentUpdates: [
    {
      id: 'upd-001',
      incidentId: 'inc-001',
      updatedBy: '22222222-2222-2222-2222-222222222222',
      updatedByName: 'Inspector Ramesh Kumar',
      previousStatus: 'reported',
      newStatus: 'confirmed',
      notes: 'Confirmed by patrolling squad. Tow cranes 04 and 07 mobilized.',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: 'upd-002',
      incidentId: 'inc-008',
      updatedBy: '22222222-2222-2222-2222-222222222222',
      updatedByName: 'Inspector Ramesh Kumar',
      previousStatus: 'confirmed',
      newStatus: 'resolved',
      notes: 'Vehicles towed to police station side. Full traffic flow restored.',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString()
    }
  ],
  savedRoutes: [
    {
      id: 'route-001',
      userId: '11111111-1111-1111-1111-111111111111',
      routeName: 'Home to Tech Park Office',
      originName: 'Indiranagar 100ft Road',
      originLat: 12.9784,
      originLng: 77.6408,
      destinationName: 'Ecospace, Bellandur ORR',
      destinationLat: 12.9260,
      destinationLng: 77.6833,
      preferredRouteDetails: {
        distanceKm: 11.4,
        averageDurationMins: 38,
        preferredMode: 'driving',
        via: 'Suranjandas Road & Marathahalli Bypass'
      },
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'route-002',
      userId: '11111111-1111-1111-1111-111111111111',
      routeName: 'Weekend Airport Commute',
      originName: 'Koramangala Sony World',
      originLat: 12.9345,
      originLng: 77.6277,
      destinationName: 'Kempegowda International Airport (BLR)',
      destinationLat: 13.1986,
      destinationLng: 77.7066,
      preferredRouteDetails: {
        distanceKm: 42.8,
        averageDurationMins: 65,
        preferredMode: 'driving',
        via: 'Intermediate Ring Road & Hebbal Expressway'
      },
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ],
  advisories: [
    {
      id: 'adv-001',
      title: 'Monsoon Heavy Shower Traffic Advisory',
      message: 'IMD Bengaluru warns of intense thunderstorms between 4:30 PM and 9:00 PM. Expect water accumulation under Marathahalli, Okalipuram, and Windsor Manor underpasses. Please maintain safe headway distance.',
      severity: 'warning',
      active: true,
      publishedAt: new Date(Date.now() - 90 * 60000).toISOString()
    }
  ],
  publicTransit: [
    {
      id: 'metro-purple',
      type: 'metro',
      lineName: 'Purple Line (East-West Corridor)',
      routeCode: 'BMRCL-PL',
      color: '#9333ea',
      origin: 'Challaghatta',
      destination: 'Whitefield (Kadugodi)',
      operatingHours: '05:00 AM – 11:30 PM',
      frequencyMins: 5,
      fareRange: '₹10 – ₹60',
      totalStops: 37,
      status: 'Normal Service',
      stops: [
        { name: 'Challaghatta', estimatedWaitMins: 4 },
        { name: 'Kengeri', estimatedWaitMins: 6 },
        { name: 'Mysuru Road', estimatedWaitMins: 3, isInterchange: false },
        { name: 'Vijayanagar', estimatedWaitMins: 5 },
        { name: 'Majestic (Nadaprabhu Kempegowda)', estimatedWaitMins: 2, isInterchange: true, connections: ['Green Line', 'KSR Railway', 'BMTC Central'] },
        { name: 'Vidhana Soudha', estimatedWaitMins: 4 },
        { name: 'MG Road', estimatedWaitMins: 3, isInterchange: true, connections: ['Pink Line (Upcoming)'] },
        { name: 'Indiranagar', estimatedWaitMins: 4 },
        { name: 'Baiyappanahalli', estimatedWaitMins: 5, isInterchange: true, connections: ['Suburban Rail'] },
        { name: 'KR Puram', estimatedWaitMins: 3, isInterchange: true, connections: ['Blue Line Airport (Upcoming)'] },
        { name: 'Garudacharpalya', estimatedWaitMins: 5 },
        { name: 'Whitefield (Kadugodi)', estimatedWaitMins: 4 }
      ]
    },
    {
      id: 'metro-green',
      type: 'metro',
      lineName: 'Green Line (North-South Corridor)',
      routeCode: 'BMRCL-GL',
      color: '#16a34a',
      origin: 'Madavara (BIEC)',
      destination: 'Silk Institute',
      operatingHours: '05:00 AM – 11:30 PM',
      frequencyMins: 6,
      fareRange: '₹10 – ₹60',
      totalStops: 31,
      status: 'Normal Service',
      stops: [
        { name: 'Madavara (BIEC)', estimatedWaitMins: 6 },
        { name: 'Nagasandra', estimatedWaitMins: 5 },
        { name: 'Yeshwantpur', estimatedWaitMins: 3, isInterchange: true, connections: ['Indian Railways'] },
        { name: 'Rajajinagar', estimatedWaitMins: 4 },
        { name: 'Majestic (Kempegowda)', estimatedWaitMins: 2, isInterchange: true, connections: ['Purple Line', 'BMTC Central'] },
        { name: 'National College', estimatedWaitMins: 5 },
        { name: 'Banashankari', estimatedWaitMins: 4, isInterchange: true, connections: ['BMTC TTMC'] },
        { name: 'Jayaprakash Nagar', estimatedWaitMins: 5 },
        { name: 'Silk Institute', estimatedWaitMins: 6 }
      ]
    },
    {
      id: 'bus-500d',
      type: 'bus',
      lineName: 'ORR Express (Hebbal ↔ Central Silk Board)',
      routeCode: 'BMTC 500-D',
      color: '#0284c7',
      origin: 'Hebbal TTMC',
      destination: 'Central Silk Board',
      operatingHours: '05:30 AM – 11:00 PM',
      frequencyMins: 8,
      fareRange: '₹15 – ₹45',
      totalStops: 24,
      status: 'Delays due to Marathahalli waterlogging (+25 mins)',
      stops: [
        { name: 'Hebbal TTMC', estimatedWaitMins: 7 },
        { name: 'Nagawara Junction', estimatedWaitMins: 8 },
        { name: 'Hennur Cross', estimatedWaitMins: 9 },
        { name: 'Kalyan Nagar', estimatedWaitMins: 6 },
        { name: 'Kasturi Nagar', estimatedWaitMins: 8 },
        { name: 'Tin Factory', estimatedWaitMins: 15 },
        { name: 'Marathahalli Bridge', estimatedWaitMins: 25 },
        { name: 'Kadubeesanahalli', estimatedWaitMins: 12 },
        { name: 'Bellandur EcoSpace', estimatedWaitMins: 10 },
        { name: 'Iblur Junction', estimatedWaitMins: 9 },
        { name: 'HSR Layout 5th Main', estimatedWaitMins: 8 },
        { name: 'Central Silk Board', estimatedWaitMins: 14 }
      ]
    },
    {
      id: 'bus-kia8',
      type: 'bus',
      lineName: 'Vayu Vajra AC Airport Express',
      routeCode: 'BMTC KIA-8',
      color: '#eab308',
      origin: 'Electronic City Wipro Gate',
      destination: 'Kempegowda International Airport (BLR)',
      operatingHours: '24 Hours (Round-the-clock)',
      frequencyMins: 20,
      fareRange: '₹280 – ₹340',
      totalStops: 18,
      status: 'Normal Service',
      stops: [
        { name: 'Electronic City Phase 1', estimatedWaitMins: 12 },
        { name: 'Central Silk Board', estimatedWaitMins: 18 },
        { name: 'Koramangala Water Tank', estimatedWaitMins: 15 },
        { name: 'Domlur TTMC', estimatedWaitMins: 14 },
        { name: 'Marathahalli Multiplex', estimatedWaitMins: 22 },
        { name: 'Hebbal Flyover', estimatedWaitMins: 20 },
        { name: 'Yelahanka Byepass', estimatedWaitMins: 16 },
        { name: 'KIA Terminal 1 & 2', estimatedWaitMins: 25 }
      ]
    },
    {
      id: 'train-blr-dhn',
      type: 'train',
      lineName: 'Bengaluru Suburban Commuter MEMU',
      routeCode: 'SWR-MEMU-06531',
      color: '#dc2626',
      origin: 'KSR Bengaluru City',
      destination: 'Devanahalli Airport Halt',
      operatingHours: '04:45 AM – 09:30 PM (6 Daily Trips)',
      frequencyMins: 90,
      fareRange: '₹30 – ₹35',
      totalStops: 9,
      status: 'On Time',
      stops: [
        { name: 'KSR Bengaluru City Junction', estimatedWaitMins: 45 },
        { name: 'Bengaluru Cantt.', estimatedWaitMins: 48 },
        { name: 'Bengaluru East', estimatedWaitMins: 52 },
        { name: 'Baiyappanahalli Railway', estimatedWaitMins: 58, isInterchange: true, connections: ['Metro Purple Line'] },
        { name: 'Channasandra', estimatedWaitMins: 64 },
        { name: 'Yelahanka Junction', estimatedWaitMins: 72 },
        { name: 'Bettahalsoor', estimatedWaitMins: 80 },
        { name: 'KIA Airport Halt (KIAD)', estimatedWaitMins: 88, connections: ['Free Terminal Shuttle'] },
        { name: 'Devanahalli', estimatedWaitMins: 95 }
      ]
    }
  ]
};

// Ensure directory exists and load database
function initStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeedData, null, 2), 'utf-8');
    return initialSeedData;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading store.json, resetting to seed data:', err);
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeedData, null, 2), 'utf-8');
    return initialSeedData;
  }
}

let store = initStore();

function persistStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing store.json:', err);
  }
}

// Distance helper (Haversine formula in meters)
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const db = {
  // Incidents
  getIncidents(filters = {}) {
    let result = [...store.incidents];

    if (filters.type && filters.type !== 'all') {
      result = result.filter(i => i.incidentType.toLowerCase() === filters.type.toLowerCase());
    }
    if (filters.severity && filters.severity !== 'all') {
      result = result.filter(i => i.severity.toLowerCase() === filters.severity.toLowerCase());
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(i => i.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.verification && filters.verification !== 'all') {
      result = result.filter(i => i.verificationState.toLowerCase() === filters.verification.toLowerCase());
    }
    if (filters.reporterId) {
      result = result.filter(i => i.reporterId === filters.reporterId);
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.addressText && i.addressText.toLowerCase().includes(q))
      );
    }

    // Sort by created at descending
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getIncidentById(id) {
    return store.incidents.find(i => i.id === id);
  },

  checkDuplicateIncident(latitude, longitude, type, thresholdMeters = 150, thresholdMinutes = 20) {
    const now = Date.now();
    return store.incidents.find(inc => {
      if (inc.status === 'resolved' || inc.status === 'rejected') return false;
      if (inc.incidentType !== type) return false;
      const ageMinutes = (now - new Date(inc.createdAt).getTime()) / (1000 * 60);
      if (ageMinutes > thresholdMinutes) return false;
      const dist = calculateDistanceMeters(latitude, longitude, inc.latitude, inc.longitude);
      return dist <= thresholdMeters;
    });
  },

  createIncident(data) {
    const newIncident = {
      id: `inc-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      reporterId: data.reporterId || 'guest',
      reporterName: data.reporterName || 'Community Commuter',
      incidentType: data.incidentType,
      title: data.title.trim(),
      description: data.description.trim(),
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      addressText: data.addressText || 'Bengaluru, Karnataka',
      severity: data.severity || 'medium',
      status: 'reported',
      verificationState: data.reporterRole === 'warden' || data.reporterRole === 'admin' ? 'verified' : 'community',
      upvotes: 1,
      photoUrl: data.photoUrl || '',
      estimatedDelayMinutes: parseInt(data.estimatedDelayMinutes || '10', 10),
      affectedDirection: data.affectedDirection || 'Both directions',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.incidents.unshift(newIncident);
    persistStore();
    return newIncident;
  },

  updateIncidentStatus(id, newStatus, updatedBy, updatedByName, notes) {
    const incident = store.incidents.find(i => i.id === id);
    if (!incident) return null;

    const previousStatus = incident.status;
    incident.status = newStatus;
    incident.updatedAt = new Date().toISOString();

    if (newStatus === 'confirmed') {
      incident.verificationState = 'verified';
    }

    // Record audit update
    const audit = {
      id: `upd-${Date.now().toString(36)}`,
      incidentId: id,
      updatedBy: updatedBy || 'admin',
      updatedByName: updatedByName || 'Authorized Dispatcher',
      previousStatus,
      newStatus,
      notes: notes || `Status changed from ${previousStatus} to ${newStatus}`,
      timestamp: new Date().toISOString()
    };
    store.incidentUpdates.unshift(audit);

    persistStore();
    return { incident, audit };
  },

  upvoteIncident(id) {
    const incident = store.incidents.find(i => i.id === id);
    if (!incident) return null;
    incident.upvotes = (incident.upvotes || 0) + 1;
    // Auto upgrade to verified if enough community upvotes
    if (incident.upvotes >= 10 && incident.verificationState === 'community') {
      incident.verificationState = 'verified';
      incident.status = 'confirmed';
    }
    persistStore();
    return incident;
  },

  // Incident Updates / Audit
  getIncidentUpdates(incidentId) {
    if (!incidentId) return store.incidentUpdates;
    return store.incidentUpdates.filter(u => u.incidentId === incidentId);
  },

  // Analytics Aggregation
  getAnalytics() {
    const active = store.incidents.filter(i => i.status !== 'resolved' && i.status !== 'rejected');
    const resolvedToday = store.incidents.filter(
      i => i.status === 'resolved' && (Date.now() - new Date(i.updatedAt).getTime()) < 86400000
    ).length;

    const byType = {};
    const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
    const byStatus = { reported: 0, under_review: 0, confirmed: 0, resolved: 0, rejected: 0 };

    let totalDelay = 0;
    let delayCount = 0;

    store.incidents.forEach(inc => {
      byType[inc.incidentType] = (byType[inc.incidentType] || 0) + 1;
      if (bySeverity[inc.severity] !== undefined) bySeverity[inc.severity]++;
      if (byStatus[inc.status] !== undefined) byStatus[inc.status]++;

      if (inc.estimatedDelayMinutes) {
        totalDelay += inc.estimatedDelayMinutes;
        delayCount++;
      }
    });

    const averageDisruptionMins = delayCount > 0 ? Math.round(totalDelay / delayCount) : 18;

    // Hourly trends for chart
    const hourlyTrends = [
      { hour: '06:00', count: 3, congestionLevel: 35 },
      { hour: '08:00', count: 12, congestionLevel: 78 },
      { hour: '10:00', count: 18, congestionLevel: 92 },
      { hour: '12:00', count: 9, congestionLevel: 55 },
      { hour: '14:00', count: 7, congestionLevel: 48 },
      { hour: '16:00', count: 14, congestionLevel: 82 },
      { hour: '18:00', count: 24, congestionLevel: 96 },
      { hour: '20:00', count: 16, congestionLevel: 74 },
      { hour: '22:00', count: 5, congestionLevel: 30 }
    ];

    const corridorCongestion = [
      { name: 'Central Silk Board', speedKmh: 8, normalSpeedKmh: 45, delayMins: 35, status: 'red' },
      { name: 'Outer Ring Road (Marathahalli)', speedKmh: 6, normalSpeedKmh: 50, delayMins: 50, status: 'red' },
      { name: 'Hebbal Flyover (Airport Rd)', speedKmh: 12, normalSpeedKmh: 60, delayMins: 40, status: 'red' },
      { name: 'Old Madras Road (Tin Factory)', speedKmh: 15, normalSpeedKmh: 50, delayMins: 25, status: 'orange' },
      { name: 'Electronic City Elevated Tollway', speedKmh: 35, normalSpeedKmh: 80, delayMins: 20, status: 'orange' },
      { name: 'Koramangala 100ft Road', speedKmh: 28, normalSpeedKmh: 40, delayMins: 8, status: 'green' },
      { name: 'MG Road & Residency Road', speedKmh: 30, normalSpeedKmh: 40, delayMins: 5, status: 'green' }
    ];

    return {
      totalActive: active.length,
      totalReported: store.incidents.length,
      congestionHotspots: active.filter(i => i.incidentType === 'congestion' || i.severity === 'critical').length,
      hazardsCount: active.filter(i => ['accident', 'hazard', 'flooding'].includes(i.incidentType)).length,
      resolvedToday,
      averageDisruptionMins,
      byType,
      bySeverity,
      byStatus,
      hourlyTrends,
      corridorCongestion
    };
  },

  // Saved Routes
  getSavedRoutes(userId) {
    if (!userId) return store.savedRoutes;
    return store.savedRoutes.filter(r => r.userId === userId);
  },

  createSavedRoute(data) {
    const newRoute = {
      id: `route-${Date.now().toString(36)}`,
      userId: data.userId || '11111111-1111-1111-1111-111111111111',
      routeName: data.routeName || 'My Daily Commute',
      originName: data.originName,
      originLat: parseFloat(data.originLat),
      originLng: parseFloat(data.originLng),
      destinationName: data.destinationName,
      destinationLat: parseFloat(data.destinationLat),
      destinationLng: parseFloat(data.destinationLng),
      preferredRouteDetails: data.preferredRouteDetails || {},
      createdAt: new Date().toISOString()
    };
    store.savedRoutes.unshift(newRoute);
    persistStore();
    return newRoute;
  },

  deleteSavedRoute(id, userId) {
    const idx = store.savedRoutes.findIndex(r => r.id === id && (!userId || r.userId === userId));
    if (idx === -1) return false;
    store.savedRoutes.splice(idx, 1);
    persistStore();
    return true;
  },

  // Public Transit
  getPublicTransit(type) {
    if (!type || type === 'all') return store.publicTransit;
    return store.publicTransit.filter(t => t.type === type);
  },

  // Advisories
  getAdvisories() {
    return store.advisories || [];
  },

  createAdvisory(data) {
    const newAdv = {
      id: `adv-${Date.now().toString(36)}`,
      title: data.title,
      message: data.message,
      severity: data.severity || 'warning',
      active: true,
      publishedAt: new Date().toISOString()
    };
    if (!store.advisories) store.advisories = [];
    store.advisories.unshift(newAdv);
    persistStore();
    return newAdv;
  },

  // Users / Auth
  getUsers() {
    return store.users;
  },

  getUserByEmail(email) {
    return store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser(data) {
    const newUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role || 'commuter',
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      phone: data.phone || '',
      trustScore: 100,
      createdAt: new Date().toISOString()
    };
    store.users.push(newUser);
    persistStore();
    return newUser;
  }
};
