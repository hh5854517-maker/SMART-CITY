import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Incident,
  IncidentType,
  SeverityLevel
} from '../../types/traffic';
import { useTraffic } from '../../context/TrafficContext';
import {
  Layers,
  Crosshair,
  RefreshCw,
  Compass,
  AlertTriangle,
  Flame,
  Ban,
  CloudRain,
  Wrench,
  ShieldAlert,
  Info
} from 'lucide-react';

interface TrafficMapProps {
  incidents?: Incident[];
  height?: string;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  routeCoordinates?: [number, number][];
  routeOrigin?: { lat: number; lng: number; name: string } | null;
  routeDestination?: { lat: number; lng: number; name: string } | null;
  showFilters?: boolean;
  interactive?: boolean;
}

// Tile layers
const TILE_PROVIDERS = {
  dark: {
    name: 'Cyber Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  street: {
    name: 'City Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  }
};

// SVG Icon paths for incident categories
const getCategoryIconSvg = (type: IncidentType): string => {
  switch (type) {
    case 'accident':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    case 'congestion':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
    case 'closure':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>`;
    case 'pothole':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    case 'flooding':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`;
    case 'breakdown':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
    default:
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  }
};

const getSeverityColors = (severity: SeverityLevel) => {
  switch (severity) {
    case 'critical':
      return { bg: '#ef4444', text: '#ffffff', pulse: 'marker-pulse-critical', border: '#b91c1c' };
    case 'high':
      return { bg: '#f97316', text: '#ffffff', pulse: 'marker-pulse-high', border: '#c2410c' };
    case 'medium':
      return { bg: '#f59e0b', text: '#ffffff', pulse: 'marker-pulse-medium', border: '#b45309' };
    case 'low':
    default:
      return { bg: '#10b981', text: '#ffffff', pulse: 'marker-pulse-low', border: '#047857' };
  }
};

export const TrafficMap: React.FC<TrafficMapProps> = ({
  incidents: propIncidents,
  height = '520px',
  onMapClick,
  selectedLocation,
  routeCoordinates,
  routeOrigin,
  routeDestination,
  showFilters = false,
  interactive = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  const {
    filteredIncidents,
    upvoteIncident,
    updateIncidentStatus,
    currentUser,
    filterType,
    setFilterType,
    filterSeverity,
    setFilterSeverity,
    filterStatus,
    setFilterStatus,
    refreshIncidents,
    isLoadingIncidents,
    mapFocusCoordinates,
    setMapFocusCoordinates
  } = useTraffic();

  const [activeTile, setActiveTile] = useState<'dark' | 'street' | 'satellite'>('dark');
  const [showLegend, setShowLegend] = useState(true);

  const displayIncidents = propIncidents || filteredIncidents;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center Bengaluru: 12.9716, 77.5946
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Custom dark tile layer
    const tile = L.tileLayer(TILE_PROVIDERS.dark.url, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    tileLayerRef.current = tile;
    mapInstanceRef.current = map;

    // Feature group for markers
    markersGroupRef.current = L.featureGroup().addTo(map);

    // Map click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTile = L.tileLayer(TILE_PROVIDERS[activeTile].url, {
      maxZoom: 19,
      subdomains: activeTile === 'dark' ? 'abcd' : 'abc'
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [activeTile]);

  // Handle Focus Coordinates change from other components
  useEffect(() => {
    if (mapInstanceRef.current && mapFocusCoordinates) {
      mapInstanceRef.current.flyTo(mapFocusCoordinates, 15, { duration: 1.5 });
      setMapFocusCoordinates(null);
    }
  }, [mapFocusCoordinates, setMapFocusCoordinates]);

  // Handle Click Marker (Pin drop when picking location)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (clickMarkerRef.current) {
      mapInstanceRef.current.removeLayer(clickMarkerRef.current);
      clickMarkerRef.current = null;
    }

    if (selectedLocation) {
      const pinHtml = `
        <div class="flex items-center justify-center w-9 h-9 rounded-full bg-cyan-500 text-white shadow-xl shadow-cyan-500/50 border-2 border-white marker-pulse-high">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `;
      const icon = L.divIcon({
        className: 'custom-pin-icon',
        html: pinHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon,
        draggable: true
      }).addTo(mapInstanceRef.current);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        if (onMapClick) onMapClick({ lat: pos.lat, lng: pos.lng });
      });

      clickMarkerRef.current = marker;
      mapInstanceRef.current.panTo([selectedLocation.lat, selectedLocation.lng]);
    }
  }, [selectedLocation, onMapClick]);

  // Render Incident Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    displayIncidents.forEach(inc => {
      const colors = getSeverityColors(inc.severity);
      const iconSvg = getCategoryIconSvg(inc.incidentType);

      const html = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 38px; height: 38px;">
          <div class="absolute inset-0 rounded-full ${colors.pulse}" style="background-color: ${colors.bg}; opacity: 0.35;"></div>
          <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2" 
               style="background-color: ${colors.bg}; border-color: ${colors.border}; color: ${colors.text}; box-shadow: 0 0 14px ${colors.bg}80;">
            ${iconSvg}
          </div>
          ${inc.status === 'resolved' ? '<div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-[9px] text-white">✓</div>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-traffic-pin',
        html,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

      // Build Rich Interactive Popup HTML
      const statusPill = inc.status === 'confirmed'
        ? '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Verified</span>'
        : inc.status === 'resolved'
        ? '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">Resolved</span>'
        : '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Community Report</span>';

      const delayBadge = inc.estimatedDelayMinutes
        ? `<div class="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-medium">
             <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
             +${inc.estimatedDelayMinutes}m delay
           </div>`
        : '';

      const photoMarkup = inc.photoUrl
        ? `<div class="mt-2.5 overflow-hidden rounded-lg border border-slate-700/60">
             <img src="${inc.photoUrl}" alt="${inc.title}" class="w-full h-28 object-cover hover:scale-105 transition-transform duration-300" />
           </div>`
        : '';

      const popupContent = document.createElement('div');
      popupContent.className = 'p-4 min-w-[280px] max-w-[340px] text-slate-100 space-y-2.5';
      popupContent.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-cyan-400 border border-cyan-500/30">
              ${inc.incidentType}
            </span>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider" style="background: ${colors.bg}25; color: ${colors.bg}; border: 1px solid ${colors.bg}50">
              ${inc.severity}
            </span>
          </div>
          ${statusPill}
        </div>

        <h4 class="font-bold text-sm text-white leading-snug mt-1">${inc.title}</h4>
        
        <p class="text-xs text-slate-300 leading-relaxed">${inc.description}</p>

        ${photoMarkup}

        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span class="truncate max-w-[180px] flex items-center gap-1">
            📍 ${inc.addressText || 'Bengaluru, Karnataka'}
          </span>
          ${delayBadge}
        </div>

        <div class="flex items-center justify-between pt-2 gap-2">
          <button id="upvote-btn-${inc.id}" class="flex-1 py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition">
            👍 Confirm (${inc.upvotes || 1})
          </button>
          ${
            (currentUser.role === 'admin' || currentUser.role === 'warden') && inc.status !== 'resolved'
              ? `<button id="resolve-btn-${inc.id}" class="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition">
                   Mark Resolved
                 </button>`
              : ''
          }
        </div>
      `;

      // Attach event listeners after popup opens
      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const upvoteBtn = document.getElementById(`upvote-btn-${inc.id}`);
        if (upvoteBtn) {
          upvoteBtn.onclick = () => {
            upvoteIncident(inc.id);
            marker.closePopup();
          };
        }
        const resolveBtn = document.getElementById(`resolve-btn-${inc.id}`);
        if (resolveBtn) {
          resolveBtn.onclick = () => {
            updateIncidentStatus(inc.id, 'resolved', 'Resolved on site by traffic controller');
            marker.closePopup();
          };
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [displayIncidents, currentUser, upvoteIncident, updateIncidentStatus]);

  // Render Routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 0) {
      // Create glowing cyan route polyline
      const polyline = L.polyline(routeCoordinates, {
        color: '#06b6d4',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: undefined
      }).addTo(map);

      // Add glow backing
      const glow = L.polyline(routeCoordinates, {
        color: '#22d3ee',
        weight: 12,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

      routeLayerRef.current = polyline;

      return () => {
        map.removeLayer(polyline);
        map.removeLayer(glow);
      };
    }
  }, [routeCoordinates]);

  // Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        mapInstanceRef.current?.flyTo([lat, lng], 14, { duration: 1.5 });
        if (onMapClick) onMapClick({ lat, lng });
      },
      err => {
        console.warn('Geolocation denied or unavailable:', err);
      }
    );
  };

  const handleCityPreset = (lat: number, lng: number, zoom = 13) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 });
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-navy-950 flex flex-col" style={{ height }}>
      {/* Top Floating Control Bar */}
      {interactive && (
        <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* City Presets */}
          <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl bg-navy-900/90 backdrop-blur-md border border-slate-800/80 shadow-lg text-xs">
            <span className="px-2 text-slate-400 font-medium hidden sm:inline">Hubs:</span>
            <button
              onClick={() => handleCityPreset(12.9716, 77.5946, 13)}
              className="px-2.5 py-1 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-cyan-400 font-medium transition"
            >
              Bengaluru Central
            </button>
            <button
              onClick={() => handleCityPreset(12.9176, 77.6234, 15)}
              className="px-2.5 py-1 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-cyan-400 font-medium transition"
            >
              Silk Board
            </button>
            <button
              onClick={() => handleCityPreset(12.9562, 77.7011, 15)}
              className="px-2.5 py-1 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-cyan-400 font-medium transition"
            >
              Marathahalli ORR
            </button>
            <button
              onClick={() => handleCityPreset(13.0358, 77.5970, 15)}
              className="px-2.5 py-1 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-cyan-400 font-medium transition hidden md:inline"
            >
              Hebbal Choke
            </button>
          </div>

          {/* Quick Actions (Tiles, Refresh, Locate) */}
          <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl bg-navy-900/90 backdrop-blur-md border border-slate-800/80 shadow-lg text-xs">
            {/* Tile Switcher */}
            <div className="flex items-center rounded-lg bg-navy-950/70 p-0.5 border border-slate-800">
              <button
                onClick={() => setActiveTile('dark')}
                className={`px-2 py-1 rounded text-xs font-semibold transition ${
                  activeTile === 'dark' ? 'bg-cyan-500 text-navy-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Cyber Dark Mode"
              >
                Dark
              </button>
              <button
                onClick={() => setActiveTile('street')}
                className={`px-2 py-1 rounded text-xs font-semibold transition ${
                  activeTile === 'street' ? 'bg-cyan-500 text-navy-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Standard Streets"
              >
                Streets
              </button>
              <button
                onClick={() => setActiveTile('satellite')}
                className={`px-2 py-1 rounded text-xs font-semibold transition ${
                  activeTile === 'satellite' ? 'bg-cyan-500 text-navy-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Satellite Imagery"
              >
                Satellite
              </button>
            </div>

            <button
              onClick={handleLocateMe}
              className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition"
              title="Locate My GPS Position"
            >
              <Crosshair className="w-4 h-4" />
            </button>

            <button
              onClick={() => refreshIncidents()}
              disabled={isLoadingIncidents}
              className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition"
              title="Refresh Network Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingIncidents ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Optional Filters Bar */}
      {showFilters && (
        <div className="absolute top-16 left-3 right-3 z-20 pointer-events-none hidden md:flex items-center gap-2">
          <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-xl bg-navy-900/90 backdrop-blur-md border border-slate-800/80 shadow-lg text-xs overflow-x-auto max-w-full">
            <span className="text-slate-400 px-1 font-medium">Type:</span>
            {(['all', 'accident', 'congestion', 'closure', 'flooding', 'pothole', 'breakdown', 'hazard'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                  filterType === t ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />

      {/* Bottom Left Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 z-20 p-2.5 rounded-xl bg-navy-900/90 backdrop-blur-md border border-slate-800 shadow-xl text-xs space-y-1.5 hidden sm:block max-w-[210px]">
          <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            <span>Severity Legend</span>
            <button onClick={() => setShowLegend(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
              <span>Critical Alert</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></span>
              <span>High Delay</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              <span>Low / Cleared</span>
            </div>
          </div>
        </div>
      )}

      {/* If map is clicked to place pin indicator */}
      {onMapClick && (
        <div className="absolute bottom-4 right-14 z-20 px-3 py-1.5 rounded-xl bg-navy-900/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs shadow-lg flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Click anywhere on map to drop incident coordinates</span>
        </div>
      )}
    </div>
  );
};
