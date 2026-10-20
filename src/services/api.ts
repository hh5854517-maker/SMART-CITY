import {
  Incident,
  IncidentUpdate,
  SavedRoute,
  PublicTransitLine,
  TrafficStats,
  Advisory,
  User,
  RouteAlternative,
  IncidentType,
  SeverityLevel
} from '../types/traffic';

const API_BASE = '/api';

// Curated Bengaluru Landmark Presets for instant search & routing
export const BENGALURU_LANDMARKS = [
  { name: 'Central Silk Board Junction', lat: 12.9176, lng: 77.6234, area: 'Hosur Road / BTM' },
  { name: 'Indiranagar 100 Feet Road', lat: 12.9784, lng: 77.6408, area: 'East Bengaluru' },
  { name: 'Electronic City Phase 1 (Wipro Gate)', lat: 12.8452, lng: 77.6602, area: 'South Corridor' },
  { name: 'Whitefield ITPL Main Road', lat: 12.9863, lng: 77.7314, area: 'Tech Corridor' },
  { name: 'Hebbal Flyover Junction', lat: 13.0358, lng: 77.5970, area: 'North / Airport Road' },
  { name: 'Kempegowda Int. Airport (BLR)', lat: 13.1986, lng: 77.7066, area: 'Devanahalli' },
  { name: 'KSR Bengaluru Majestic Station', lat: 12.9781, lng: 77.5696, area: 'Central City' },
  { name: 'Koramangala Sony World Signal', lat: 12.9345, lng: 77.6277, area: 'South East' },
  { name: 'Marathahalli Bridge ORR', lat: 12.9562, lng: 77.7011, area: 'Outer Ring Road' },
  { name: 'Bellandur EcoSpace Tech Park', lat: 12.9260, lng: 77.6833, area: 'Outer Ring Road' },
  { name: 'Yeshwantpur Railway Station', lat: 13.0238, lng: 77.5501, area: 'North West' }
];

// Helper: Haversine distance in km
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fallback seed incidents if server is not reachable
const FALLBACK_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    reporterId: '22222222-2222-2222-2222-222222222222',
    reporterName: 'Inspector Ramesh Kumar (Warden)',
    incidentType: 'accident',
    title: 'Multi-vehicle collision on Hebbal Flyover incline',
    description: '3-car pileup blocking 2 lanes towards Yelahanka / Airport. Traffic police crane dispatched. Heavy tailbacks extending to Esteem Mall.',
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
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    id: 'inc-002',
    reporterId: '11111111-1111-1111-1111-111111111111',
    reporterName: 'Arjun Rao (Commuter)',
    incidentType: 'flooding',
    title: 'Severe Waterlogging under Marathahalli Railway Underpass',
    description: 'Sudden monsoon rainwater accumulation up to 2.5 feet. Multiple two-wheelers and sedans stalled. Heavy buses passing slowly.',
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
    createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: 'inc-003',
    reporterId: '11111111-1111-1111-1111-111111111111',
    reporterName: 'Suresh Kumar',
    incidentType: 'congestion',
    title: 'Massive Gridlock at Central Silk Board Junction',
    description: 'Extended signal waiting cycles combined with ongoing Yellow Line Metro barricades. Waiting time exceeds 5 signal cycles.',
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
    description: 'Air brake locking failure on right lane before KR Puram railway bridge. Tow truck on site attempting clearance.',
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
    description: 'Cluster of 3 large craters exposed along the service road merge into main carriageway. High risk for two-wheelers.',
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
    description: 'Chickpet to Avenue Road closed for heavy transit vehicles from 10:00 PM to 06:00 AM daily. Alternative route via Mysore Road.',
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
    estimatedDelayMinutes: 0,
    affectedDirection: 'Normal flow resumed',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString()
  }
];

export const api = {
  // --- INCIDENTS ---
  async getIncidents(filters?: {
    type?: string;
    severity?: string;
    status?: string;
    verification?: string;
    query?: string;
    reporterId?: string;
  }): Promise<Incident[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters?.severity && filters.severity !== 'all') params.append('severity', filters.severity);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.verification && filters.verification !== 'all') params.append('verification', filters.verification);
      if (filters?.query) params.append('query', filters.query);
      if (filters?.reporterId) params.append('reporterId', filters.reporterId);

      const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
      if (!res.ok) throw new Error('API fetch failed');
      return await res.json();
    } catch {
      // Fallback to local storage or fallback incidents
      const local = localStorage.getItem('smartroute_incidents');
      const list: Incident[] = local ? JSON.parse(local) : FALLBACK_INCIDENTS;

      let result = [...list];
      if (filters?.type && filters.type !== 'all') {
        result = result.filter(i => i.incidentType === filters.type);
      }
      if (filters?.severity && filters.severity !== 'all') {
        result = result.filter(i => i.severity === filters.severity);
      }
      if (filters?.status && filters.status !== 'all') {
        result = result.filter(i => i.status === filters.status);
      }
      if (filters?.reporterId) {
        result = result.filter(i => i.reporterId === filters.reporterId);
      }
      return result;
    }
  },

  async getIncidentById(id: string): Promise<Incident | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}`);
      if (!res.ok) throw new Error('Not found');
      return await res.json();
    } catch {
      const list = await this.getIncidents();
      return list.find(i => i.id === id) || null;
    }
  },

  async createIncident(data: {
    incidentType: IncidentType;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    addressText?: string;
    severity: SeverityLevel;
    estimatedDelayMinutes?: number;
    affectedDirection?: string;
    photoUrl?: string;
    reporterId?: string;
    reporterName?: string;
    reporterRole?: string;
  }): Promise<{ success: boolean; message: string; incident: Incident; duplicateDetected?: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to report incident');
      }
      return await res.json();
    } catch (err: any) {
      // Offline fallback: save locally
      const list = await this.getIncidents();
      const newInc: Incident = {
        id: `inc-local-${Date.now()}`,
        reporterId: data.reporterId || 'guest',
        reporterName: data.reporterName || 'Community Commuter',
        incidentType: data.incidentType,
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        addressText: data.addressText || 'Bengaluru, Karnataka',
        severity: data.severity,
        status: 'reported',
        verificationState: data.reporterRole === 'warden' || data.reporterRole === 'admin' ? 'verified' : 'community',
        upvotes: 1,
        photoUrl: data.photoUrl,
        estimatedDelayMinutes: data.estimatedDelayMinutes || 10,
        affectedDirection: data.affectedDirection || 'Both directions',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.unshift(newInc);
      localStorage.setItem('smartroute_incidents', JSON.stringify(list));
      return {
        success: true,
        message: 'Incident reported and cached in network',
        incident: newInc
      };
    }
  },

  async updateIncidentStatus(
    id: string,
    status: Incident['status'],
    updatedBy?: string,
    updatedByName?: string,
    notes?: string
  ): Promise<{ success: boolean; incident: Incident; audit?: IncidentUpdate }> {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updatedBy, updatedByName, notes })
      });
      if (!res.ok) throw new Error('Status update failed');
      return await res.json();
    } catch {
      const list = await this.getIncidents();
      const inc = list.find(i => i.id === id);
      if (!inc) throw new Error('Incident not found');
      inc.status = status;
      inc.updatedAt = new Date().toISOString();
      if (status === 'confirmed') inc.verificationState = 'verified';
      localStorage.setItem('smartroute_incidents', JSON.stringify(list));
      return { success: true, incident: inc };
    }
  },

  async upvoteIncident(id: string): Promise<Incident> {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}/upvote`, { method: 'POST' });
      if (!res.ok) throw new Error('Upvote failed');
      const data = await res.json();
      return data.incident;
    } catch {
      const list = await this.getIncidents();
      const inc = list.find(i => i.id === id);
      if (inc) {
        inc.upvotes = (inc.upvotes || 0) + 1;
        if (inc.upvotes >= 10 && inc.verificationState === 'community') {
          inc.verificationState = 'verified';
          inc.status = 'confirmed';
        }
        localStorage.setItem('smartroute_incidents', JSON.stringify(list));
        return inc;
      }
      throw new Error('Incident not found');
    }
  },

  // --- TRAFFIC ANALYTICS ---
  async getAnalytics(): Promise<TrafficStats> {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      if (!res.ok) throw new Error('Analytics fetch failed');
      return await res.json();
    } catch {
      const incidents = await this.getIncidents();
      const active = incidents.filter(i => i.status !== 'resolved' && i.status !== 'rejected');
      const byType: Record<string, number> = {};
      const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
      const byStatus: Record<string, number> = { reported: 0, under_review: 0, confirmed: 0, resolved: 0, rejected: 0 };

      incidents.forEach(inc => {
        byType[inc.incidentType] = (byType[inc.incidentType] || 0) + 1;
        if (bySeverity[inc.severity] !== undefined) bySeverity[inc.severity]++;
        if (byStatus[inc.status] !== undefined) byStatus[inc.status]++;
      });

      return {
        totalActive: active.length,
        totalReported: incidents.length,
        congestionHotspots: active.filter(i => i.incidentType === 'congestion' || i.severity === 'critical').length,
        hazardsCount: active.filter(i => ['accident', 'hazard', 'flooding'].includes(i.incidentType)).length,
        resolvedToday: incidents.filter(i => i.status === 'resolved').length,
        averageDisruptionMins: 22,
        byType,
        bySeverity,
        byStatus,
        hourlyTrends: [
          { hour: '06:00', count: 3, congestionLevel: 35 },
          { hour: '08:00', count: 12, congestionLevel: 78 },
          { hour: '10:00', count: 18, congestionLevel: 92 },
          { hour: '12:00', count: 9, congestionLevel: 55 },
          { hour: '14:00', count: 7, congestionLevel: 48 },
          { hour: '16:00', count: 14, congestionLevel: 82 },
          { hour: '18:00', count: 24, congestionLevel: 96 },
          { hour: '20:00', count: 16, congestionLevel: 74 },
          { hour: '22:00', count: 5, congestionLevel: 30 }
        ],
        corridorCongestion: [
          { name: 'Central Silk Board', speedKmh: 8, normalSpeedKmh: 45, delayMins: 35, status: 'red' },
          { name: 'Outer Ring Road (Marathahalli)', speedKmh: 6, normalSpeedKmh: 50, delayMins: 50, status: 'red' },
          { name: 'Hebbal Flyover (Airport Rd)', speedKmh: 12, normalSpeedKmh: 60, delayMins: 40, status: 'red' },
          { name: 'Old Madras Road (Tin Factory)', speedKmh: 15, normalSpeedKmh: 50, delayMins: 25, status: 'orange' },
          { name: 'Electronic City Elevated Tollway', speedKmh: 35, normalSpeedKmh: 80, delayMins: 20, status: 'orange' },
          { name: 'Koramangala 100ft Road', speedKmh: 28, normalSpeedKmh: 40, delayMins: 8, status: 'green' },
          { name: 'MG Road & Residency Road', speedKmh: 30, normalSpeedKmh: 40, delayMins: 5, status: 'green' }
        ]
      };
    }
  },

  // --- ROUTING ENGINE WITH REAL OSRM API ---
  async findAlternativeRoutes(
    origin: { lat: number; lng: number; name: string },
    destination: { lat: number; lng: number; name: string },
    activeIncidents: Incident[] = []
  ): Promise<RouteAlternative[]> {
    try {
      // Call public OSRM API for realistic driving route geometries
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6500) });

      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          return data.routes.map((r: any, idx: number) => {
            // OSRM coordinates are [lng, lat], convert to Leaflet's [lat, lng]
            const coords: [number, number][] = r.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            const distanceKm = Number((r.distance / 1000).toFixed(1));
            const durationMins = Math.round(r.duration / 60);

            // Turn-by-turn steps
            const steps = (r.legs?.[0]?.steps || []).map((s: any) => ({
              instruction: s.maneuver?.type === 'depart' ? `Depart from ${origin.name}` : s.maneuver?.type === 'arrive' ? `Arrive at ${destination.name}` : `${s.maneuver?.modifier || 'Proceed'} onto ${s.name || 'unnamed road'}`,
              distanceMeters: Math.round(s.distance),
              durationSeconds: Math.round(s.duration),
              name: s.name,
              modifier: s.maneuver?.modifier
            }));

            // Check incident proximity to this route corridor (within 500 meters of any route point)
            const warnings: string[] = [];
            let penaltyMinutes = 0;

            activeIncidents.forEach(inc => {
              if (inc.status === 'resolved' || inc.status === 'rejected') return;
              // Check distance to route points sample
              const isNearby = coords.some((pt, i) => i % 4 === 0 && getDistanceKm(pt[0], pt[1], inc.latitude, inc.longitude) < 0.6);
              if (isNearby) {
                warnings.push(`${inc.title} (${inc.severity.toUpperCase()}) — +${inc.estimatedDelayMinutes || 15}m delay`);
                penaltyMinutes += inc.estimatedDelayMinutes || 15;
              }
            });

            // Disruption score (100 is best, decreases with incidents)
            const disruptionScore = Math.max(20, 100 - warnings.length * 25);
            const isRecommended = idx === 0 && warnings.length <= 1;

            return {
              id: `osrm-route-${idx + 1}`,
              name: idx === 0 ? 'Primary Recommended Route' : idx === 1 ? 'Alternative via Bypass / Ring Road' : `Alternative Corridor ${idx + 1}`,
              summary: r.legs?.[0]?.summary || `Via Main Road`,
              distanceKm,
              durationMins: durationMins + penaltyMinutes,
              via: r.legs?.[0]?.summary || `Corridor ${idx + 1}`,
              recommended: isRecommended || (idx === 0),
              disruptionScore,
              warningCount: warnings.length,
              warnings,
              coordinates: coords,
              steps
            };
          });
        }
      }
    } catch (e) {
      console.warn('OSRM API unavailable or timed out; generating realistic high-fidelity fallback routes:', e);
    }

    // High fidelity fallback routes between origin & destination
    return this.generateSyntheticRoutes(origin, destination, activeIncidents);
  },

  // Fallback route generator if offline
  generateSyntheticRoutes(
    origin: { lat: number; lng: number; name: string },
    destination: { lat: number; lng: number; name: string },
    activeIncidents: Incident[]
  ): RouteAlternative[] {
    const directDistKm = getDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
    const roadDist1 = Number((directDistKm * 1.25).toFixed(1));
    const roadDist2 = Number((directDistKm * 1.45).toFixed(1));

    // Midpoints with slight curve
    const midLat = (origin.lat + destination.lat) / 2;
    const midLng = (origin.lng + destination.lng) / 2;

    const coords1: [number, number][] = [
      [origin.lat, origin.lng],
      [origin.lat + (midLat - origin.lat) * 0.5, origin.lng + 0.008],
      [midLat, midLng],
      [midLat + (destination.lat - midLat) * 0.5, midLng - 0.005],
      [destination.lat, destination.lng]
    ];

    const coords2: [number, number][] = [
      [origin.lat, origin.lng],
      [origin.lat + (midLat - origin.lat) * 0.4, origin.lng - 0.018],
      [midLat, midLng - 0.025],
      [destination.lat - 0.01, destination.lng - 0.01],
      [destination.lat, destination.lng]
    ];

    return [
      {
        id: 'route-opt-1',
        name: 'Primary Arterial Route',
        summary: 'Via Intermediate Ring Road',
        distanceKm: roadDist1,
        durationMins: Math.round(roadDist1 * 3.2),
        via: 'Main Radial Corridor',
        recommended: true,
        disruptionScore: 88,
        warningCount: 1,
        warnings: ['Moderate congestion near central junction (+12m)'],
        coordinates: coords1,
        steps: [
          { instruction: `Head towards ${origin.name}`, distanceMeters: 400, durationSeconds: 60 },
          { instruction: 'Merge onto Main Arterial Road', distanceMeters: Math.round(roadDist1 * 600), durationSeconds: 700 },
          { instruction: 'Continue along the elevated express section', distanceMeters: Math.round(roadDist1 * 300), durationSeconds: 400 },
          { instruction: `Arrive at destination: ${destination.name}`, distanceMeters: 200, durationSeconds: 30 }
        ]
      },
      {
        id: 'route-opt-2',
        name: 'Bypass / Ring Corridor',
        summary: 'Via Outer Expressway',
        distanceKm: roadDist2,
        durationMins: Math.round(roadDist2 * 2.8),
        via: 'Outer Ring Bypass',
        recommended: false,
        disruptionScore: 95,
        warningCount: 0,
        warnings: [],
        coordinates: coords2,
        steps: [
          { instruction: `Take exit ramp towards Outer Bypass`, distanceMeters: 800, durationSeconds: 120 },
          { instruction: 'Proceed on 6-lane bypass highway', distanceMeters: Math.round(roadDist2 * 800), durationSeconds: 650 },
          { instruction: `Merge back onto local connection to ${destination.name}`, distanceMeters: 500, durationSeconds: 90 }
        ]
      }
    ];
  },

  // Nominatim Address Search for Bengaluru & Global
  async searchAddresses(query: string): Promise<{ name: string; lat: number; lng: number; area?: string }[]> {
    if (!query || query.trim().length < 2) return [];

    // First check local landmarks
    const qLower = query.toLowerCase();
    const localMatches = BENGALURU_LANDMARKS.filter(
      l => l.name.toLowerCase().includes(qLower) || l.area.toLowerCase().includes(qLower)
    );

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ', Bengaluru'
      )}&limit=5`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'SmartRouteAI-CommuterPlatform/1.0' },
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const osmData = await res.json();
        const osmResults = osmData.map((item: any) => ({
          name: item.display_name.split(',')[0],
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          area: item.display_name.split(',').slice(1, 3).join(',').trim()
        }));
        return [...localMatches, ...osmResults].slice(0, 6);
      }
    } catch {
      // Return local matches if offline or rate limited
    }

    return localMatches;
  },

  // --- PUBLIC TRANSIT ---
  async getPublicTransit(type?: 'metro' | 'bus' | 'train' | 'all'): Promise<PublicTransitLine[]> {
    try {
      const res = await fetch(`${API_BASE}/transit${type && type !== 'all' ? `?type=${type}` : ''}`);
      if (!res.ok) throw new Error('Transit fetch failed');
      return await res.json();
    } catch {
      // Fallback
      return [
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
            { name: 'Mysuru Road', estimatedWaitMins: 3 },
            { name: 'Vijayanagar', estimatedWaitMins: 5 },
            { name: 'Majestic (Kempegowda)', estimatedWaitMins: 2, isInterchange: true, connections: ['Green Line', 'KSR Rail'] },
            { name: 'Vidhana Soudha', estimatedWaitMins: 4 },
            { name: 'MG Road', estimatedWaitMins: 3, isInterchange: true },
            { name: 'Indiranagar', estimatedWaitMins: 4 },
            { name: 'Baiyappanahalli', estimatedWaitMins: 5, isInterchange: true, connections: ['Rail'] },
            { name: 'KR Puram', estimatedWaitMins: 3 },
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
            { name: 'Yeshwantpur', estimatedWaitMins: 3, isInterchange: true, connections: ['Rail'] },
            { name: 'Majestic (Kempegowda)', estimatedWaitMins: 2, isInterchange: true, connections: ['Purple Line'] },
            { name: 'Banashankari', estimatedWaitMins: 4, isInterchange: true },
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
            { name: 'Tin Factory', estimatedWaitMins: 15 },
            { name: 'Marathahalli Bridge', estimatedWaitMins: 25 },
            { name: 'Bellandur EcoSpace', estimatedWaitMins: 10 },
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
            { name: 'Domlur TTMC', estimatedWaitMins: 14 },
            { name: 'Hebbal Flyover', estimatedWaitMins: 20 },
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
            { name: 'Baiyappanahalli Railway', estimatedWaitMins: 58, isInterchange: true },
            { name: 'Yelahanka Junction', estimatedWaitMins: 72 },
            { name: 'KIA Airport Halt (KIAD)', estimatedWaitMins: 88, connections: ['Free Terminal Shuttle'] }
          ]
        }
      ];
    }
  },

  // --- SAVED ROUTES ---
  async getSavedRoutes(userId?: string): Promise<SavedRoute[]> {
    try {
      const res = await fetch(`${API_BASE}/routes/saved${userId ? `?userId=${userId}` : ''}`);
      if (!res.ok) throw new Error('Failed to get saved routes');
      return await res.json();
    } catch {
      const local = localStorage.getItem('smartroute_saved_routes');
      if (local) return JSON.parse(local);
      return [
        {
          id: 'route-001',
          userId: userId || '11111111-1111-1111-1111-111111111111',
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
        }
      ];
    }
  },

  async saveRoute(route: Omit<SavedRoute, 'id' | 'createdAt'>): Promise<SavedRoute> {
    try {
      const res = await fetch(`${API_BASE}/routes/saved`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(route)
      });
      if (!res.ok) throw new Error('Save route failed');
      return await res.json();
    } catch {
      const routes = await this.getSavedRoutes();
      const newRoute: SavedRoute = {
        ...route,
        id: `route-local-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      routes.unshift(newRoute);
      localStorage.setItem('smartroute_saved_routes', JSON.stringify(routes));
      return newRoute;
    }
  },

  async deleteSavedRoute(id: string, userId?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/routes/saved/${id}${userId ? `?userId=${userId}` : ''}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch {
      const routes = await this.getSavedRoutes();
      const updated = routes.filter(r => r.id !== id);
      localStorage.setItem('smartroute_saved_routes', JSON.stringify(updated));
      return true;
    }
  },

  // --- ADVISORIES ---
  async getAdvisories(): Promise<Advisory[]> {
    try {
      const res = await fetch(`${API_BASE}/advisories`);
      if (!res.ok) throw new Error('Failed to get advisories');
      return await res.json();
    } catch {
      return [
        {
          id: 'adv-001',
          title: 'Monsoon Heavy Shower Traffic Advisory',
          message: 'Intense rain alert across Bengaluru. Heavy water accumulation under Marathahalli and Windsor Manor underpasses. Please exercise caution.',
          severity: 'warning',
          active: true,
          publishedAt: new Date(Date.now() - 60 * 60000).toISOString()
        }
      ];
    }
  },

  async createAdvisory(data: { title: string; message: string; severity: 'info' | 'warning' | 'alert' }): Promise<Advisory> {
    const res = await fetch(`${API_BASE}/advisories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to post advisory');
    return await res.json();
  },

  // --- AUTH SIMULATION ---
  async login(email: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return await res.json();
  },

  async register(data: { name: string; email: string; role?: string; phone?: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return await res.json();
  }
};
