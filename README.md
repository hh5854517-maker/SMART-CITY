# SmartRoute AI — Intelligent Traffic and Commuter Assistance Platform

SmartRoute AI is an intelligent smart-city traffic management and commuter assistance platform built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, **Leaflet Maps**, **OSRM Routing**, and **Recharts**.

The platform is designed to assist urban commuters in Bengaluru, Karnataka (with global coordinate support) in monitoring real-time congestion, reporting road hazards, finding alternative detour routes, accessing public transport schedules, and moderating community submissions.

---

## 🌟 Key Capabilities & Features

### 1. 🎛️ Main Dashboard (Home / Overview)
- **Real-time KPI Metrics**: Active incidents, critical hazards, severe congestion choke points, and today's resolved incidents.
- **Interactive Road Network Map**: Leaflet map preview with animated pulse pins categorized by severity (Critical, High, Medium, Low).
- **Quick Route Finder Widget**: Rapid origin-to-destination search with instant routing bridge.
- **Live Incidents Feed**: Up-to-the-minute reports with verification tags (*Verified by Traffic Control* vs *Community Report*), timestamps, and upvotes.
- **Congestion Legend**: Standardized traffic status indicators (Green, Yellow, Orange, Red).

### 2. 🗺️ Interactive Traffic Map
- **Geographic Exploration**: Centered on Bengaluru with instant-zoom presets (Silk Board, Marathahalli ORR, Hebbal Flyover, Electronic City).
- **Custom Pulse Markers**: Categorized SVG pins for Accidents, Congestion, Road Closures, Potholes, Flooding, and Vehicle Breakdowns.
- **Rich Interactive Popups**: Description, lane blockage, delay in minutes, photo preview, and 1-click confirmation upvoting.
- **Multi-Criteria Filtering**: Filter simultaneously by Incident Type, Severity, Status, and Verification source.
- **Tile Providers**: Cyber Dark Mode, OpenStreetMap City Streets, and Satellite Imagery.
- **Accessible List View**: 1-click toggle between map canvas and accessible structured card list for screen readers and mobile users.
- **Pin Drop Mode**: Click anywhere on the map to extract precise latitude/longitude coordinates.

### 3. 🚨 Report Traffic or Road Incidents
- **Comprehensive Form**: Zod-validated input fields covering category, title, description, severity, delay estimation, and affected direction.
- **Flexible Location Input**:
  - Interactive click-to-pin on the Leaflet map
  - Address search with live auto-suggestions (OpenStreetMap Nominatim)
  - Browser HTML5 Geolocation (`Use My GPS Location`)
- **Evidence Attachment**: Drag-and-drop photo upload with file format validation (JPEG, PNG, WebP) and 5MB size limit.
- **Spam & Duplicate Protection**: In-memory rate limiting (max 6 reports/min per IP) and geographic duplicate detection (prevents duplicate submissions within 150m in a 20-minute window by automatically upvoting the existing report).

### 4. 🛣️ Alternative Route Finder
- **Real OSRM Routing Engine**: Queries Open Source Routing Machine (`router.project-osrm.org`) for actual road geometry, distances (km), and durations (mins).
- **Corridor Hazard Intersect**: Calculates active incidents and waterlogged sections along the calculated route corridor.
- **Route Options**:
  - Primary Recommended Route
  - Bypass / Ring Road Corridor
  - Transit Corridor
- **Turn-by-Turn Navigation**: Expandable step-by-step maneuver drawer with segment distances and timings.
- **External Navigation Export**: 1-click "Open in Google Maps" link with origin & destination coordinates.
- **Profile Persistence**: "Save Route to Profile" for one-click status checks before daily commutes.

### 5. 🚌 Public Transport Information
- **Transit Categories**:
  - **Namma Metro**: Purple Line (Challaghatta ↔ Whitefield) and Green Line (Madavara ↔ Silk Institute) with interchange station indicators.
  - **BMTC City Bus**: ORR Express 500-D, Vayu Vajra Airport Express KIA-8, and feeder routes.
  - **Suburban Commuter Rail**: South Western Railway MEMU commuter lines.
- **Live Station Timeline**: Interactive stop list displaying next departure wait times and connecting services.
- **Disruption Alerts**: Real-time service delay notices (e.g. Outer Ring Road bus delays during heavy rain).
- **Official Portals**: Direct links to BMRCL and BMTC official portals.

### 6. 📊 Incident Analytics & Traffic Summaries
- **Daily Disruption Curve**: Interactive AreaChart showing peak congestion hours (8:00–10:00 AM & 5:00–8:00 PM).
- **Severity Distribution**: Donut PieChart depicting critical vs high vs moderate disruption ratios.
- **Hazard Categories**: BarChart comparing accident, waterlogging, pothole, and breakdown counts.
- **Corridor Crawl Speeds**: Live speed vs normal capacity across Silk Board, Marathahalli, Hebbal, and Old Madras Road.
- **Data Export**: Export analytics report to CSV.

### 7. 🛡️ Admin Moderation Dashboard
- **Incident Queue**: Filter by Pending, Confirmed, Resolved, or Rejected.
- **Moderator Actions**: Verify community reports, mark cleared/resolved, or reject spam.
- **Status Audit Trail**: Real-time log tracking status transitions, timestamps, and dispatcher notes.
- **Emergency Broadcast Tool**: Push city-wide priority traffic advisories to all commuters.

### 8. 👤 User Authentication & Tester Role Switcher
- **Instant 1-Click Evaluation Personas**:
  - 👤 **Citizen Commuter** (`commuter@smartroute.ai`): View maps, find routes, submit hazard reports, view personal submissions.
  - 🛡️ **Traffic Warden** (`warden@smartroute.ai`): On-ground field officer with report verification and clearance powers.
  - 👑 **Municipal Admin** (`admin@smartroute.ai`): Traffic command dispatcher with full moderation and city broadcast capabilities.
- **Authentication**: Built-in credential validation + Supabase Auth compatibility.

---

## 🏗️ Project Architecture & Folder Structure

```
anti/
├── index.html                   # HTML entry point with Leaflet & Inter fonts
├── package.json                 # Dependencies & scripts
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Smart city navy & traffic color tokens
├── tsconfig.json                # TypeScript project configuration
├── tsconfig.app.json            # React compiler options
├── vite.config.ts               # Vite configuration with API proxy to port 3001
├── supabase-schema.sql          # PostgreSQL & PostGIS migrations with RLS policies
├── .env.example                 # Environment configuration template
│
├── server/                      # Node.js Express Backend
│   ├── db.js                    # Persistent store, Bengaluru seed data, CRUD & analytics
│   ├── server.js                # Express REST API, rate limiter, Zod validation
│   └── data/
│       └── store.json           # File-backed incident database
│
└── src/                         # Frontend Application
    ├── main.tsx                 # React DOM mount
    ├── App.tsx                  # Root component & page router
    ├── index.css                # Tailwind, Leaflet overrides & pulse animations
    │
    ├── types/
    │   └── traffic.ts           # Comprehensive TypeScript interfaces & types
    │
    ├── services/
    │   └── api.ts               # OSRM routing, Nominatim search, REST API client & cache
    │
    ├── context/
    │   └── TrafficContext.tsx   # Global state, demo user switching, filters & alerts
    │
    └── components/
        ├── layout/
        │   ├── Navbar.tsx       # Brand header, city status beacon, persona dropdown
        │   └── Sidebar.tsx      # 10 navigation views with live hazard count badges
        ├── map/
        │   └── TrafficMap.tsx   # Interactive Leaflet map, custom SVG pulse pins & routes
        ├── common/
        │   └── ToastContainer.tsx # Dynamic toast feedback notifications
        ├── modals/
        │   └── AuthModal.tsx    # Sign in, registration, and 1-click demo login
        └── views/
            ├── OverviewView.tsx       # Main dashboard with KPI cards & quick route box
            ├── LiveMapView.tsx        # Fullscreen map with accessible list view toggle
            ├── ReportIncidentView.tsx # Zod-validated incident reporting form
            ├── RoutesView.tsx         # Alternative route planner with OSRM engine
            ├── TransitView.tsx        # Namma Metro, BMTC & Commuter Rail schedules
            ├── AnalyticsView.tsx      # Recharts visualizations & CSV export
            ├── MyReportsView.tsx      # Personal submitted reports & status tracker
            ├── ProfileView.tsx        # User profile, commuter badges & saved routes
            └── AdminView.tsx          # Incident moderation queue & advisory broadcast
```

---

## 🚀 Installation and Startup Instructions

### Prerequisites
- **Node.js**: v20+ recommended
- **npm**: v10+

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Full-Stack Application
Start both the Express backend server (port 3001) and Vite dev server (port 5173) concurrently:
```bash
npm run dev
```

### 3. Open in Browser
Navigate to:
```
http://localhost:5173
```

*(Optional)* To run services individually:
```bash
# Start backend API only (Port 3001)
npm run dev:server

# Start Vite client only (Port 5173)
npm run dev:client
```

---

## 🗄️ Database Schema & Supabase Setup

The repository includes a production-ready database migration script in [`supabase-schema.sql`](file:///c:/Users/Hitesh%20C/Downloads/anti/supabase-schema.sql).

### Tables Overview
1. **`users`**: User identity, role (`commuter`, `warden`, `admin`), trust score, and timestamps.
2. **`incidents`**: Geographic coordinates (`latitude`, `longitude`), incident category, severity, status, verification state, upvotes, delay minutes, and photo URL.
3. **`incident_updates`**: Immutable audit log of status transitions recording dispatcher ID, previous status, new status, and notes.
4. **`saved_routes`**: User-saved routes with origin, destination, and preferred route details.

### How to apply to Supabase:
1. Open [Supabase Dashboard](https://supabase.com/dashboard) and create a project.
2. Go to the **SQL Editor** tab.
3. Paste the contents of `supabase-schema.sql` and click **Run**.
4. All tables, PostGIS extensions, spatial indexes, triggers, and Row Level Security (RLS) policies will be configured automatically.

---

## 📡 REST API Endpoint Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and timestamp |
| `GET` | `/api/incidents` | List incidents with optional filters (`type`, `severity`, `status`, `verification`, `query`) |
| `GET` | `/api/incidents/:id` | Get incident details including status transition history |
| `POST` | `/api/incidents` | Report new incident (Zod validated, rate limited, duplicate checked) |
| `PATCH` | `/api/incidents/:id/status` | Moderator status transition (`confirmed`, `resolved`, `rejected`) |
| `POST` | `/api/incidents/:id/upvote` | Community verification upvote |
| `GET` | `/api/incidents-updates` | Audit trail of all incident status changes |
| `GET` | `/api/analytics` | Aggregated traffic metrics, hourly trends, and corridor delays |
| `GET` | `/api/routes/saved` | Fetch saved commuter routes |
| `POST` | `/api/routes/saved` | Save a route to user profile |
| `DELETE` | `/api/routes/saved/:id` | Remove a saved route |
| `GET` | `/api/transit` | Public transit lines and stop arrival estimates |
| `GET` | `/api/advisories` | Active city-wide traffic advisories |
| `POST` | `/api/advisories` | Broadcast new traffic advisory (Admin/Warden) |
| `POST` | `/api/auth/login` | Commuter authentication |
| `POST` | `/api/auth/register` | User registration |

---

## 🗺️ Maps, Routing & Transport Integrations

### Map Provider
- **Leaflet 1.9.4** with OpenStreetMap tiles.
- Default layer uses CartoDB Dark Matter for high-contrast smart-city aesthetics, with 1-click toggles for Standard Streets and Satellite Imagery.
- Custom HTML/SVG div-icons avoid 404 asset path issues and dynamically pulse according to severity.

### Routing Provider
- **OSRM (Open Source Routing Machine)** public API:
  `https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson&steps=true&alternatives=true`
- Evaluates real turn-by-turn road geometry, distances (km), and durations (mins).
- If offline or external API rate limits are reached, the platform falls back to an integrated synthetic corridor engine to ensure zero commuter disruption.

### Geocoding
- **Nominatim OpenStreetMap Geocoder**:
  `https://nominatim.openstreetmap.org/search?format=json&q=...`
- Preloaded with major Bengaluru landmarks (Central Silk Board, Marathahalli ORR, Hebbal Flyover, Electronic City, Whitefield ITPL, Kempegowda Airport, Majestic Station) for instant zero-latency suggestions.

---

## 🔒 Security & Privacy Practices

- **Zero Plaintext Credentials**: All secrets configured via environment variables.
- **Server-Side Validation**: Zod schemas validate coordinates, titles, and payloads on both client and Express server.
- **Rate Limiting**: IP-based submission throttling prevents automated spamming.
- **Duplicate Prevention**: Submissions within 150m of an active report in a 20-minute window are flagged and merged as confirmations.
- **Permission Guards**: Moderator endpoints require authorized role (`warden` or `admin`).
- **Privacy First**: Sensitive personal details are excluded from public incident feeds.
