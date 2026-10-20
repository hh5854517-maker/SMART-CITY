export type IncidentType =
  | 'accident'
  | 'congestion'
  | 'closure'
  | 'pothole'
  | 'flooding'
  | 'breakdown'
  | 'hazard';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'reported'
  | 'under_review'
  | 'confirmed'
  | 'resolved'
  | 'rejected';

export type VerificationState = 'verified' | 'community' | 'flagged';

export type UserRole = 'commuter' | 'warden' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  trustScore: number;
  createdAt: string;
}

export interface Incident {
  id: string;
  reporterId?: string;
  reporterName?: string;
  incidentType: IncidentType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  addressText?: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  verificationState: VerificationState;
  upvotes: number;
  photoUrl?: string;
  estimatedDelayMinutes?: number;
  affectedDirection?: string;
  createdAt: string;
  updatedAt: string;
  updates?: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  updatedBy?: string;
  updatedByName?: string;
  previousStatus: IncidentStatus;
  newStatus: IncidentStatus;
  notes?: string;
  timestamp: string;
}

export interface SavedRoute {
  id: string;
  userId: string;
  routeName: string;
  originName: string;
  originLat: number;
  originLng: number;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  preferredRouteDetails?: {
    distanceKm?: number;
    averageDurationMins?: number;
    preferredMode?: string;
    via?: string;
  };
  createdAt: string;
}

export interface TransitStop {
  name: string;
  landmark?: string;
  estimatedWaitMins: number;
  isInterchange?: boolean;
  connections?: string[];
}

export interface PublicTransitLine {
  id: string;
  type: 'metro' | 'bus' | 'train';
  lineName: string;
  routeCode: string;
  color: string;
  origin: string;
  destination: string;
  operatingHours: string;
  frequencyMins: number;
  fareRange: string;
  totalStops: number;
  status: string;
  stops: TransitStop[];
}

export interface Advisory {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'alert';
  active: boolean;
  publishedAt: string;
}

export interface CorridorSpeed {
  name: string;
  speedKmh: number;
  normalSpeedKmh: number;
  delayMins: number;
  status: 'green' | 'yellow' | 'orange' | 'red';
}

export interface HourlyTrend {
  hour: string;
  count: number;
  congestionLevel: number;
}

export interface TrafficStats {
  totalActive: number;
  totalReported: number;
  congestionHotspots: number;
  hazardsCount: number;
  resolvedToday: number;
  averageDisruptionMins: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  hourlyTrends: HourlyTrend[];
  corridorCongestion: CorridorSpeed[];
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  name?: string;
  type?: string;
  modifier?: string;
}

export interface RouteAlternative {
  id: string;
  name: string;
  summary: string;
  distanceKm: number;
  durationMins: number;
  via: string;
  recommended: boolean;
  disruptionScore: number; // 0-100 (100 is best / clean corridor)
  warningCount: number;
  warnings: string[];
  coordinates: [number, number][]; // [lat, lng] array for Leaflet polyline
  steps: RouteStep[];
}

export type NavPage =
  | 'overview'
  | 'map'
  | 'report'
  | 'routes'
  | 'transit'
  | 'analytics'
  | 'my-reports'
  | 'profile'
  | 'admin';
