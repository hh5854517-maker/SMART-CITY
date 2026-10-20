-- ==============================================================================
-- SmartRoute AI — Comprehensive PostgreSQL & PostGIS Database Schema
-- Intelligent Traffic & Commuter Assistance Platform
-- ==============================================================================

-- 1. Enable PostGIS Extension for geospatial queries (if available)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- PostGIS for real geographic coordinates, distance calculations, and bounding box searches
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Create Custom ENUM Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('commuter', 'warden', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_type AS ENUM (
        'accident', 
        'congestion', 
        'closure', 
        'pothole', 
        'flooding', 
        'breakdown', 
        'hazard'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM (
        'reported', 
        'under_review', 
        'confirmed', 
        'resolved', 
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_state AS ENUM ('verified', 'community', 'flagged');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'commuter',
    avatar_url TEXT,
    phone TEXT,
    trust_score INT NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email & role for quick lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 4. Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reporter_name TEXT,
    incident_type incident_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address_text TEXT,
    severity severity_level NOT NULL DEFAULT 'medium',
    status incident_status NOT NULL DEFAULT 'reported',
    verification_state verification_state NOT NULL DEFAULT 'community',
    upvotes INT NOT NULL DEFAULT 1,
    photo_url TEXT,
    estimated_delay_minutes INT DEFAULT 0,
    affected_direction TEXT DEFAULT 'Both directions',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add spatial index if PostGIS is enabled
CREATE INDEX IF NOT EXISTS idx_incidents_lat_lon ON public.incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON public.incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);

-- 5. Incident Updates Table (Audit Log of Status Transitions)
CREATE TABLE IF NOT EXISTS public.incident_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by_name TEXT,
    previous_status incident_status NOT NULL,
    new_status incident_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_updates_incident_id ON public.incident_updates(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_updates_created_at ON public.incident_updates(created_at DESC);

-- 6. Saved Routes Table
CREATE TABLE IF NOT EXISTS public.saved_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    route_name TEXT NOT NULL,
    origin_name TEXT NOT NULL,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lng DOUBLE PRECISION NOT NULL,
    destination_name TEXT NOT NULL,
    destination_lat DOUBLE PRECISION NOT NULL,
    destination_lng DOUBLE PRECISION NOT NULL,
    preferred_route_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_routes_user_id ON public.saved_routes(user_id);

-- 7. Trigger to automatically update `updated_at` on Incidents
CREATE OR REPLACE FUNCTION update_incident_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_incident_timestamp ON public.incidents;
CREATE TRIGGER trg_update_incident_timestamp
BEFORE UPDATE ON public.incidents
FOR EACH ROW
EXECUTE FUNCTION update_incident_timestamp();

-- 8. Row Level Security (RLS) Configuration
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;

-- Incidents RLS Policies:
-- Anyone can view incidents
CREATE POLICY "Public incidents are viewable by everyone" 
ON public.incidents FOR SELECT USING (true);

-- Authenticated or guest commuters can report incidents
CREATE POLICY "Commuters can insert incidents" 
ON public.incidents FOR INSERT WITH CHECK (true);

-- Admins and wardens can update any incident; reporters can update their own
CREATE POLICY "Authorized users can update incidents" 
ON public.incidents FOR UPDATE USING (
    auth.uid() = reporter_id 
    OR EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('warden', 'admin')
    )
);

-- Saved Routes Policies:
CREATE POLICY "Users can manage their own saved routes"
ON public.saved_routes FOR ALL USING (auth.uid() = user_id);

-- 9. Sample Seed Data for Bengaluru, Karnataka
INSERT INTO public.users (id, name, email, role, avatar_url, trust_score) VALUES
('11111111-1111-1111-1111-111111111111', 'Arjun Rao (Commuter)', 'commuter@smartroute.ai', 'commuter', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', 120),
('22222222-2222-2222-2222-222222222222', 'Inspector Ramesh Kumar', 'warden@smartroute.ai', 'warden', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', 450),
('33333333-3333-3333-3333-333333333333', 'Bengaluru Traffic Control Room', 'admin@smartroute.ai', 'admin', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80', 1000)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.incidents (
    id, reporter_id, reporter_name, incident_type, title, description,
    latitude, longitude, address_text, severity, status, verification_state,
    upvotes, estimated_delay_minutes, affected_direction, created_at
) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Inspector Ramesh Kumar',
    'accident',
    'Multi-vehicle collision on Hebbal Flyover incline',
    '3-car pileup blocking 2 lanes towards Yelahanka / Airport. Traffic police crane dispatched. Heavy tailbacks extending to Esteem Mall.',
    13.0358, 77.5970,
    'Hebbal Flyover, Bellary Road, Bengaluru',
    'critical', 'confirmed', 'verified',
    42, 40, 'Northbound (Airport Bound)', NOW() - INTERVAL '25 minutes'
),
(
    'a2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Arjun Rao',
    'flooding',
    'Severe Waterlogging under Marathahalli Railway Bridge',
    'Monsoon rainwater accumulated up to 2.5 feet. Cars stalled. Heavy vehicles only passing slowly. Avoid and use HAL Old Airport Road bypass.',
    12.9562, 77.7011,
    'Outer Ring Road, Marathahalli, Bengaluru',
    'critical', 'confirmed', 'verified',
    89, 50, 'Both directions', NOW() - INTERVAL '50 minutes'
),
(
    'a3333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Community Reporter',
    'congestion',
    'Massive bottleneck at Central Silk Board Junction',
    'Signal cycle delays combined with metro construction barricades. Waiting time exceeds 4 cycles. Tailback up to HSR 5th Main.',
    12.9176, 77.6234,
    'Central Silk Board, Hosur Road, Bengaluru',
    'high', 'confirmed', 'verified',
    115, 35, 'Towards Electronic City & BTM', NOW() - INTERVAL '15 minutes'
),
(
    'a4444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Siddharth M.',
    'breakdown',
    'Broken-down BMTC Volvo Bus at Tin Factory Junction',
    'Engine failure in rightmost lane before KR Puram railway bridge. Tow truck en route. Extreme crawl towards Whitefield.',
    12.9934, 77.6608,
    'Old Madras Road, Tin Factory, Bengaluru',
    'high', 'under_review', 'community',
    28, 25, 'Eastbound towards Whitefield', NOW() - INTERVAL '18 minutes'
),
(
    'a5555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'Pooja Nair',
    'pothole',
    'Deep crater potholes near Bellandur EcoWorld Gate 2',
    'Multiple crater-sized potholes exposed after rain. Two-wheelers at high risk of skidding. BBMP complaint registered.',
    12.9260, 77.6833,
    'Outer Ring Road, Bellandur, Bengaluru',
    'medium', 'reported', 'community',
    19, 10, 'Service road & Left lane', NOW() - INTERVAL '2 hours'
),
(
    'a6666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    'Traffic Police Control',
    'closure',
    'Road closed for BMRCL Metro underground utility diversion',
    'Chickpet to Avenue Road closed for vehicular transit from 10 PM to 6 AM daily. Detours via Mysore Road.',
    12.9702, 77.5752,
    'Avenue Road, Chickpet, Bengaluru',
    'medium', 'confirmed', 'verified',
    34, 15, 'Full road closure', NOW() - INTERVAL '5 hours'
),
(
    'a7777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    'Rohan K.',
    'hazard',
    'Diesel slick on Electronic City Phase 1 exit ramp',
    'Spilled fuel making ramp slippery. Sand being applied by NHAI maintenance patrol. Reduce speed to 20 km/h.',
    12.8452, 77.6602,
    'Electronic City Elevated Tollway Exit, Bengaluru',
    'high', 'confirmed', 'verified',
    52, 20, 'Exit ramp', NOW() - INTERVAL '40 minutes'
),
(
    'a8888888-8888-8888-8888-888888888888',
    '22222222-2222-2222-2222-222222222222',
    'Traffic Warden',
    'accident',
    'Fender bender cleared at Sony World Junction Koramangala',
    'Minor two-car collision moved to side of road. Debris cleared. Normal traffic flow restored.',
    12.9345, 77.6277,
    '100ft Road, Koramangala 4th Block, Bengaluru',
    'low', 'resolved', 'verified',
    64, 0, 'Cleared', NOW() - INTERVAL '3 hours'
)
ON CONFLICT (id) DO NOTHING;
