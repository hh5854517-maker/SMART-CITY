import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Incident,
  IncidentType,
  SeverityLevel,
  IncidentStatus,
  VerificationState,
  User,
  UserRole,
  NavPage,
  Advisory
} from '../types/traffic';
import { api } from '../services/api';

// Pre-configured Demo Users for instant testing
export const DEMO_USERS: Record<UserRole, User> = {
  commuter: {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Arjun Rao',
    email: 'commuter@smartroute.ai',
    role: 'commuter',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    phone: '+91 98450 12345',
    trustScore: 120,
    createdAt: '2026-01-15T10:00:00Z'
  },
  warden: {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Inspector Ramesh Kumar',
    email: 'warden@smartroute.ai',
    role: 'warden',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    phone: '+91 98450 23456',
    trustScore: 480,
    createdAt: '2025-11-01T08:30:00Z'
  },
  admin: {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Bengaluru Traffic Command',
    email: 'admin@smartroute.ai',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    phone: '+91 80 2294 2222',
    trustScore: 1000,
    createdAt: '2025-06-10T09:00:00Z'
  }
};

export interface NotificationToast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}

interface TrafficContextType {
  // Navigation & Page State
  activePage: NavPage;
  setActivePage: (page: NavPage) => void;

  // User & Authentication
  currentUser: User;
  switchUserRole: (role: UserRole) => void;
  setCurrentUser: (user: User) => void;
  logout: () => void;

  // Incidents Data
  incidents: Incident[];
  isLoadingIncidents: boolean;
  refreshIncidents: () => Promise<void>;
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;

  // Filtering
  filterType: IncidentType | 'all';
  setFilterType: (type: IncidentType | 'all') => void;
  filterSeverity: SeverityLevel | 'all';
  setFilterSeverity: (severity: SeverityLevel | 'all') => void;
  filterStatus: IncidentStatus | 'all';
  setFilterStatus: (status: IncidentStatus | 'all') => void;
  filterVerification: VerificationState | 'all';
  setFilterVerification: (v: VerificationState | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredIncidents: Incident[];

  // Incident Actions
  reportIncident: (data: any) => Promise<{ success: boolean; message: string; incident: Incident; duplicateDetected?: boolean }>;
  updateIncidentStatus: (id: string, status: IncidentStatus, notes?: string) => Promise<boolean>;
  upvoteIncident: (id: string) => Promise<void>;

  // Routing Transfer State
  routeOriginQuery: string;
  setRouteOriginQuery: (q: string) => void;
  routeDestinationQuery: string;
  setRouteDestinationQuery: (q: string) => void;
  planRouteFromDashboard: (origin: string, destination: string) => void;

  // Map Focus Coordinate State
  mapFocusCoordinates: [number, number] | null;
  setMapFocusCoordinates: (coords: [number, number] | null) => void;

  // Advisories
  advisories: Advisory[];
  addAdvisory: (data: { title: string; message: string; severity: 'info' | 'warning' | 'alert' }) => Promise<void>;

  // Notifications
  notifications: NotificationToast[];
  addNotification: (type: NotificationToast['type'], title: string, message?: string) => void;
  removeNotification: (id: string) => void;

  // Modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const TrafficContext = createContext<TrafficContextType | undefined>(undefined);

export const TrafficProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<NavPage>('overview');

  // Load saved user or default to commuter
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('smartroute_current_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.commuter;
  });

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState<boolean>(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<IncidentType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'all'>('all');
  const [filterVerification, setFilterVerification] = useState<VerificationState | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Routing bridge
  const [routeOriginQuery, setRouteOriginQuery] = useState<string>('Central Silk Board Junction');
  const [routeDestinationQuery, setRouteDestinationQuery] = useState<string>('Whitefield ITPL Main Road');
  const [mapFocusCoordinates, setMapFocusCoordinates] = useState<[number, number] | null>(null);

  // Advisories
  const [advisories, setAdvisories] = useState<Advisory[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const addNotification = useCallback((type: NotificationToast['type'], title: string, message?: string) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const switchUserRole = (role: UserRole) => {
    const user = DEMO_USERS[role];
    setCurrentUser(user);
    localStorage.setItem('smartroute_current_user', JSON.stringify(user));
    addNotification('info', `Switched Role to ${role.toUpperCase()}`, `Operating as ${user.name}`);
  };

  const logout = () => {
    switchUserRole('commuter');
  };

  // Fetch incidents
  const refreshIncidents = useCallback(async () => {
    setIsLoadingIncidents(true);
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch {
      addNotification('error', 'Error refreshing incidents', 'Using local cached incident data');
    } finally {
      setIsLoadingIncidents(false);
    }
  }, [addNotification]);

  // Fetch initial data
  useEffect(() => {
    refreshIncidents();
    api.getAdvisories().then(setAdvisories).catch(() => {});
  }, [refreshIncidents]);

  // Incident Actions
  const reportIncident = async (data: any) => {
    try {
      const response = await api.createIncident({
        ...data,
        reporterId: currentUser.id,
        reporterName: currentUser.name,
        reporterRole: currentUser.role
      });

      if (response.duplicateDetected) {
        addNotification(
          'warning',
          'Existing Report Detected',
          response.message
        );
      } else {
        addNotification(
          'success',
          'Incident Successfully Reported',
          'Pinned to live traffic network and broadcast to nearby commuters.'
        );
      }

      await refreshIncidents();
      return response;
    } catch (err: any) {
      addNotification('error', 'Report Failed', err.message || 'Could not save incident');
      throw err;
    }
  };

  const updateIncidentStatus = async (id: string, status: IncidentStatus, notes?: string) => {
    try {
      await api.updateIncidentStatus(
        id,
        status,
        currentUser.id,
        currentUser.name,
        notes || `Status changed to ${status}`
      );
      addNotification('success', 'Incident Status Updated', `Transitioned to "${status}"`);
      await refreshIncidents();
      return true;
    } catch (err: any) {
      addNotification('error', 'Update Failed', err.message);
      return false;
    }
  };

  const upvoteIncident = async (id: string) => {
    try {
      const updated = await api.upvoteIncident(id);
      setIncidents(prev => prev.map(i => (i.id === id ? updated : i)));
      addNotification('info', 'Incident Confirmed', `Thanks for verifying this report! (Upvotes: ${updated.upvotes})`);
    } catch {
      addNotification('error', 'Action Failed', 'Could not register upvote');
    }
  };

  const planRouteFromDashboard = (origin: string, destination: string) => {
    setRouteOriginQuery(origin);
    setRouteDestinationQuery(destination);
    setActivePage('routes');
  };

  const addAdvisory = async (data: { title: string; message: string; severity: 'info' | 'warning' | 'alert' }) => {
    try {
      const adv = await api.createAdvisory(data);
      setAdvisories(prev => [adv, ...prev]);
      addNotification('success', 'Advisory Published', 'Broadcasted across city network');
    } catch {
      addNotification('error', 'Failed to publish advisory');
    }
  };

  // Filtered Incidents calculation
  const filteredIncidents = incidents.filter(inc => {
    if (filterType !== 'all' && inc.incidentType !== filterType) return false;
    if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && inc.status !== filterStatus) return false;
    if (filterVerification !== 'all' && inc.verificationState !== filterVerification) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchDesc = inc.description.toLowerCase().includes(q);
      const matchAddr = inc.addressText?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAddr) return false;
    }
    return true;
  });

  return (
    <TrafficContext.Provider
      value={{
        activePage,
        setActivePage,
        currentUser,
        switchUserRole,
        setCurrentUser,
        logout,
        incidents,
        isLoadingIncidents,
        refreshIncidents,
        selectedIncident,
        setSelectedIncident,
        filterType,
        setFilterType,
        filterSeverity,
        setFilterSeverity,
        filterStatus,
        setFilterStatus,
        filterVerification,
        setFilterVerification,
        searchQuery,
        setSearchQuery,
        filteredIncidents,
        reportIncident,
        updateIncidentStatus,
        upvoteIncident,
        routeOriginQuery,
        setRouteOriginQuery,
        routeDestinationQuery,
        setRouteDestinationQuery,
        planRouteFromDashboard,
        mapFocusCoordinates,
        setMapFocusCoordinates,
        advisories,
        addAdvisory,
        notifications,
        addNotification,
        removeNotification,
        authModalOpen,
        setAuthModalOpen
      }}
    >
      {children}
    </TrafficContext.Provider>
  );
};

export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (!context) {
    throw new Error('useTraffic must be used within a TrafficProvider');
  }
  return context;
};
