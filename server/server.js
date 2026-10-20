import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Simple in-memory rate limiter per IP for incident submissions
const submissionTracker = new Map();
function rateLimitSubmissions(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const history = submissionTracker.get(ip) || [];
  // Keep only submissions in the last 60 seconds
  const recent = history.filter(t => now - t < 60000);
  if (recent.length >= 6) {
    return res.status(429).json({
      error: 'Rate limit exceeded: Too many reports submitted in a short window. Please wait a minute.'
    });
  }
  recent.push(now);
  submissionTracker.set(ip, recent);
  next();
}

// Validation Schemas
const incidentSchema = z.object({
  incidentType: z.enum(['accident', 'congestion', 'closure', 'pothole', 'flooding', 'breakdown', 'hazard'], {
    message: 'Invalid incident type'
  }),
  title: z.string().min(5, 'Title must be at least 5 characters').max(180, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  latitude: z.number({ invalid_type_error: 'Valid latitude is required' }),
  longitude: z.number({ invalid_type_error: 'Valid longitude is required' }),
  addressText: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  estimatedDelayMinutes: z.union([z.number(), z.string()]).optional(),
  affectedDirection: z.string().optional(),
  photoUrl: z.string().optional(),
  reporterId: z.string().optional(),
  reporterName: z.string().optional(),
  reporterRole: z.string().optional()
});

const statusUpdateSchema = z.object({
  status: z.enum(['reported', 'under_review', 'confirmed', 'resolved', 'rejected']),
  updatedBy: z.string().optional(),
  updatedByName: z.string().optional(),
  notes: z.string().optional()
});

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'SmartRoute AI Backend Engine',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// 1. Incidents Endpoints
app.get('/api/incidents', (req, res) => {
  try {
    const { type, severity, status, verification, query, reporterId } = req.query;
    const incidents = db.getIncidents({
      type: type ? String(type) : undefined,
      severity: severity ? String(severity) : undefined,
      status: status ? String(status) : undefined,
      verification: verification ? String(verification) : undefined,
      query: query ? String(query) : undefined,
      reporterId: reporterId ? String(reporterId) : undefined
    });
    res.json(incidents);
  } catch (err) {
    console.error('Error fetching incidents:', err);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

app.get('/api/incidents/:id', (req, res) => {
  const incident = db.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  const updates = db.getIncidentUpdates(req.params.id);
  res.json({ ...incident, updates });
});

app.post('/api/incidents', rateLimitSubmissions, (req, res) => {
  try {
    const parseResult = incidentSchema.safeParse({
      ...req.body,
      latitude: Number(req.body.latitude),
      longitude: Number(req.body.longitude)
    });

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.format()
      });
    }

    const { latitude, longitude, incidentType } = parseResult.data;

    // Check duplicate reports within 150m in last 20 mins
    const duplicate = db.checkDuplicateIncident(latitude, longitude, incidentType);
    if (duplicate) {
      // Rather than hard failing, we upvote existing duplicate and inform user
      db.upvoteIncident(duplicate.id);
      return res.status(200).json({
        duplicateDetected: true,
        message: 'A similar incident was recently reported at this exact location. We added your confirmation/upvote to it!',
        incident: duplicate
      });
    }

    const created = db.createIncident(parseResult.data);
    res.status(201).json({
      success: true,
      message: 'Incident reported successfully and pinned to live network',
      incident: created
    });
  } catch (err) {
    console.error('Error creating incident:', err);
    res.status(500).json({ error: 'Failed to report incident' });
  }
});

app.patch('/api/incidents/:id/status', (req, res) => {
  try {
    const parse = statusUpdateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid status update parameters', details: parse.error.format() });
    }

    const { status, updatedBy, updatedByName, notes } = parse.data;
    const result = db.updateIncidentStatus(req.params.id, status, updatedBy, updatedByName, notes);

    if (!result) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json({
      success: true,
      message: `Incident status transitioned to '${status}'`,
      incident: result.incident,
      audit: result.audit
    });
  } catch (err) {
    console.error('Error updating incident status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

app.post('/api/incidents/:id/upvote', (req, res) => {
  const updated = db.upvoteIncident(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json({ success: true, upvotes: updated.upvotes, incident: updated });
});

app.get('/api/incidents-updates', (req, res) => {
  const updates = db.getIncidentUpdates(req.query.incidentId ? String(req.query.incidentId) : undefined);
  res.json(updates);
});

// 2. Traffic Analytics
app.get('/api/analytics', (req, res) => {
  try {
    const stats = db.getAnalytics();
    res.json(stats);
  } catch (err) {
    console.error('Error getting analytics:', err);
    res.status(500).json({ error: 'Failed to calculate analytics' });
  }
});

// 3. Saved Routes
app.get('/api/routes/saved', (req, res) => {
  const userId = req.query.userId ? String(req.query.userId) : undefined;
  const routes = db.getSavedRoutes(userId);
  res.json(routes);
});

app.post('/api/routes/saved', (req, res) => {
  try {
    const { userId, routeName, originName, originLat, originLng, destinationName, destinationLat, destinationLng, preferredRouteDetails } = req.body;
    if (!originName || !destinationName || originLat === undefined || destinationLat === undefined) {
      return res.status(400).json({ error: 'Origin and destination details are required' });
    }
    const created = db.createSavedRoute({
      userId,
      routeName,
      originName,
      originLat,
      originLng,
      destinationName,
      destinationLat,
      destinationLng,
      preferredRouteDetails
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save route' });
  }
});

app.delete('/api/routes/saved/:id', (req, res) => {
  const success = db.deleteSavedRoute(req.params.id, req.query.userId ? String(req.query.userId) : undefined);
  if (!success) {
    return res.status(404).json({ error: 'Route not found or unauthorized' });
  }
  res.json({ success: true, message: 'Saved route deleted' });
});

// 4. Public Transit
app.get('/api/transit', (req, res) => {
  const type = req.query.type ? String(req.query.type) : undefined;
  const lines = db.getPublicTransit(type);
  res.json(lines);
});

// 5. Advisories
app.get('/api/advisories', (req, res) => {
  res.json(db.getAdvisories());
});

app.post('/api/advisories', (req, res) => {
  const { title, message, severity } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message required' });
  }
  const advisory = db.createAdvisory({ title, message, severity });
  res.status(201).json(advisory);
});

// 6. Auth Simulation & Users
app.get('/api/users', (req, res) => {
  res.json(db.getUsers());
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or user not found' });
  }
  res.json({
    token: `jwt-sim-${user.id}-${Date.now()}`,
    user
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, role, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }
  const newUser = db.createUser({ name, email, role: role || 'commuter', phone });
  res.status(201).json({
    token: `jwt-sim-${newUser.id}-${Date.now()}`,
    user: newUser
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SmartRoute AI Express Server running on port ${PORT}`);
  console.log(`📡 Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`🚦 Live Incidents:  http://localhost:${PORT}/api/incidents`);
  console.log(`=======================================================`);
});
