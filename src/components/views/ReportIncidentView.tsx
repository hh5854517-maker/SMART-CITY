import React, { useState } from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { TrafficMap } from '../map/TrafficMap';
import { IncidentType, SeverityLevel } from '../../types/traffic';
import { BENGALURU_LANDMARKS, api } from '../../services/api';
import { z } from 'zod';
import {
  AlertTriangle,
  MapPin,
  Camera,
  Crosshair,
  CheckCircle2,
  Clock,
  Shield,
  Upload,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const incidentFormSchema = z.object({
  incidentType: z.enum(['accident', 'congestion', 'closure', 'pothole', 'flooding', 'breakdown', 'hazard']),
  title: z.string().min(5, 'Title must be at least 5 characters long').max(160, 'Title cannot exceed 160 characters'),
  description: z.string().min(10, 'Please describe the incident in at least 10 characters'),
  latitude: z.number(),
  longitude: z.number(),
  addressText: z.string().min(3, 'Address or landmark is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedDelayMinutes: z.number().min(0).max(180),
  affectedDirection: z.string().min(2, 'Please specify affected lanes/direction')
});

export const ReportIncidentView: React.FC = () => {
  const { reportIncident, currentUser, setActivePage, addNotification } = useTraffic();

  const [incidentType, setIncidentType] = useState<IncidentType>('congestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addressText, setAddressText] = useState('Central Silk Board Junction, Hosur Road');
  const [latitude, setLatitude] = useState<number>(12.9176);
  const [longitude, setLongitude] = useState<number>(77.6234);
  const [severity, setSeverity] = useState<SeverityLevel>('high');
  const [estimatedDelayMinutes, setEstimatedDelayMinutes] = useState<number>(20);
  const [affectedDirection, setAffectedDirection] = useState('Both directions');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successReportId, setSuccessReportId] = useState<string | null>(null);

  // Address search suggestions
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Map pin placement
  const handleMapPinDrop = (coords: { lat: number; lng: number }) => {
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    setAddressText(`Coordinates: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} (Bengaluru)`);
    // Clear coordinate errors if any
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.latitude;
      delete copy.longitude;
      return copy;
    });
  };

  // Browser Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      addNotification('warning', 'Geolocation Unavailable', 'Your browser does not support GPS geolocation.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setAddressText(`My Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        addNotification('info', 'Location Acquired', 'Using your current GPS coordinates.');
      },
      err => {
        addNotification('error', 'Location Error', err.message || 'Permission denied.');
      }
    );
  };

  // Address lookup
  const handleAddressInputChange = async (val: string) => {
    setAddressText(val);
    if (val.trim().length > 2) {
      setIsSearchingAddress(true);
      const results = await api.searchAddresses(val);
      setAddressSuggestions(results);
      setIsSearchingAddress(false);
    } else {
      setAddressSuggestions([]);
    }
  };

  const handleSelectLandmark = (item: any) => {
    setAddressText(item.name + (item.area ? `, ${item.area}` : ''));
    setLatitude(item.lat);
    setLongitude(item.lng);
    setAddressSuggestions([]);
  };

  // File Upload Handling
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addNotification('error', 'Invalid File Type', 'Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addNotification('error', 'File Too Large', 'Maximum allowed photo size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      addNotification('success', 'Photo Attached', 'Evidence photo ready for incident verification.');
    };
    reader.readAsDataURL(file);
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      incidentType,
      title: title.trim(),
      description: description.trim(),
      latitude,
      longitude,
      addressText: addressText.trim(),
      severity,
      estimatedDelayMinutes: Number(estimatedDelayMinutes),
      affectedDirection: affectedDirection.trim(),
      photoUrl: photoPreview
    };

    const result = incidentFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const issues = result.error.issues || (result.error as any).errors || [];
      issues.forEach((err: any) => {
        if (err.path?.[0]) {
          fieldErrors[String(err.path[0])] = err.message;
        }
      });
      setErrors(fieldErrors);
      addNotification('error', 'Validation Notice', 'Please correct highlighted errors in the form.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await reportIncident(formData);
      setSuccessReportId(response.incident.id);
    } catch (err) {
      // error toast handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              COMMUNITY TRAFFIC REPORTING DISPATCH
            </div>
            <h1 className="text-2xl font-black text-white">Report Road Hazard or Incident</h1>
            <p className="text-xs text-slate-300">
              Your report immediately alerts nearby commuters, calculates detours, and dispatches municipal traffic response units.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-navy-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Posting as: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})</span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successReportId && (
        <div className="p-6 rounded-3xl bg-emerald-950/60 border border-emerald-500/40 shadow-2xl space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-white">Incident Successfully Registered</h3>
              <p className="text-xs text-emerald-200">
                Your report has been saved into the database, pinned to the live Bengaluru network map, and broadcasted to commuters.
                Tracking ID: <span className="font-mono font-bold text-white bg-emerald-900/80 px-2 py-0.5 rounded">{successReportId}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setActivePage('map')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs transition"
            >
              View on Live Map
            </button>
            <button
              onClick={() => setActivePage('my-reports')}
              className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs border border-slate-700 transition"
            >
              Go to My Reports
            </button>
            <button
              onClick={() => {
                setSuccessReportId(null);
                setTitle('');
                setDescription('');
                setPhotoPreview('');
              }}
              className="px-3 py-2 text-xs text-slate-300 hover:text-white"
            >
              Report Another Incident
            </button>
          </div>
        </div>
      )}

      {/* Main Reporting Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Incident Category */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              1. Incident Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'congestion', label: 'Traffic Jam', emoji: '🚗' },
                { id: 'accident', label: 'Accident', emoji: '💥' },
                { id: 'flooding', label: 'Flooding', emoji: '🌊' },
                { id: 'closure', label: 'Road Closed', emoji: '⛔' },
                { id: 'pothole', label: 'Pothole', emoji: '🕳️' },
                { id: 'breakdown', label: 'Breakdown', emoji: '🚚' },
                { id: 'hazard', label: 'Other Hazard', emoji: '⚠️' }
              ].map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setIncidentType(cat.id as IncidentType)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition ${
                    incidentType === cat.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-navy-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
            {errors.incidentType && <p className="text-red-400 text-xs">{errors.incidentType}</p>}
          </div>

          {/* 2. Incident Title & Details */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              2. Title & Description *
            </label>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Short Incident Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Waterlogging under Marathahalli Railway Bridge"
                className={`w-full bg-navy-950 border ${
                  errors.title ? 'border-red-500' : 'border-slate-800'
                } rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition`}
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Detailed Description & Commuter Advice
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe current severity, stalled vehicles, lane blockages, and bypass recommendation..."
                className={`w-full bg-navy-950 border ${
                  errors.description ? 'border-red-500' : 'border-slate-800'
                } rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition`}
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Severity Level Selector */}
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5">
                Severity Level:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { level: 'low', label: 'Low', color: 'bg-emerald-500' },
                  { level: 'medium', label: 'Medium', color: 'bg-amber-500' },
                  { level: 'high', label: 'High', color: 'bg-orange-500' },
                  { level: 'critical', label: 'Critical', color: 'bg-red-500' }
                ].map(s => (
                  <button
                    type="button"
                    key={s.level}
                    onClick={() => setSeverity(s.level as SeverityLevel)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      severity === s.level
                        ? 'border-white text-white shadow-lg ' + s.color
                        : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${s.color}`}></span>
                    <span className="capitalize">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Delay & Affected Lanes */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Est. Delay (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={estimatedDelayMinutes}
                  onChange={e => setEstimatedDelayMinutes(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Affected Direction
                </label>
                <select
                  value={affectedDirection}
                  onChange={e => setAffectedDirection(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                >
                  <option value="Both directions">Both directions</option>
                  <option value="Northbound (Airport Bound)">Northbound (Airport Bound)</option>
                  <option value="Southbound (Hosur Bound)">Southbound (Hosur Bound)</option>
                  <option value="Eastbound (Whitefield Bound)">Eastbound (Whitefield Bound)</option>
                  <option value="Westbound (Majestic Bound)">Westbound (Majestic Bound)</option>
                  <option value="Service road only">Service road only</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Photo Upload Evidence */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>3. Photo Evidence (Optional)</span>
              <span className="text-[11px] text-slate-400 font-normal">Max 5MB (JPG, PNG)</span>
            </label>

            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-48">
                <img src={photoPreview} alt="Incident preview" className="w-full h-44 object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-navy-950/80 hover:bg-red-600 text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl bg-navy-950/60 cursor-pointer transition group">
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mb-2 transition" />
                <span className="text-xs font-semibold text-slate-300">
                  Click or drag photo here
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Helps traffic wardens verify faster
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Location Picker Map (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                4. Location Selection *
              </label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
              >
                <Crosshair className="w-3.5 h-3.5" />
                GPS My Location
              </button>
            </div>

            {/* Address Search Field */}
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={addressText}
                onChange={e => handleAddressInputChange(e.target.value)}
                placeholder="Search junction or address..."
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />

              {/* Suggestions Dropdown */}
              {addressSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-navy-950 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto text-xs">
                  {addressSuggestions.map((item, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleSelectLandmark(item)}
                      className="w-full text-left p-2.5 hover:bg-slate-800 text-slate-200 border-b border-slate-800/80 last:border-none flex flex-col"
                    >
                      <span className="font-bold text-white">{item.name}</span>
                      {item.area && <span className="text-[11px] text-slate-400">{item.area}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Coordinate Indicators */}
            <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Lat: <strong className="text-cyan-400">{latitude.toFixed(4)}</strong></span>
              <span>Lng: <strong className="text-cyan-400">{longitude.toFixed(4)}</strong></span>
              <span className="text-emerald-400">✓ Pin Ready</span>
            </div>

            {/* Interactive Pin Drop Map */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400">
                Click anywhere on the map to pin-point exact coordinates:
              </span>
              <TrafficMap
                height="320px"
                onMapClick={handleMapPinDrop}
                selectedLocation={{ lat: latitude, lng: longitude }}
                interactive={true}
              />
            </div>
          </div>

          {/* Form Submit & Reset Buttons */}
          <div className="space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-red-600/25 flex items-center justify-center gap-2 transition active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Transmitting to Grid...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Submit Live Traffic Report</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePage('overview')}
              className="w-full py-2.5 rounded-xl bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition"
            >
              Cancel & Return to Dashboard
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
