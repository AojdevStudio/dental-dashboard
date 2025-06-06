-- Create hygiene_production table for tracking daily hygiene metrics
-- Matches the structure from "Hygiene Production Tracker - Adriane - Dec-23.csv"

CREATE TABLE IF NOT EXISTS hygiene_production (
    id TEXT PRIMARY KEY, -- Using the UUID from the CSV
    clinic_id TEXT NOT NULL REFERENCES clinics(id),
    
    -- Basic tracking data
    date DATE NOT NULL,
    month_tab TEXT NOT NULL, -- e.g., "Dec-23", "Jan-24"
    
    -- Production metrics
    hours_worked DECIMAL(4,2) DEFAULT 0,
    estimated_production DECIMAL(10,2) DEFAULT 0,
    verified_production DECIMAL(10,2) DEFAULT 0,
    production_goal DECIMAL(10,2) DEFAULT 0,
    variance_percentage DECIMAL(5,2) DEFAULT 0, -- e.g., -77.5 for -77%
    bonus_amount DECIMAL(8,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(clinic_id, date, month_tab) -- Prevent duplicate entries for same date/month
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hygiene_production_clinic_date 
    ON hygiene_production(clinic_id, date DESC);
    
CREATE INDEX IF NOT EXISTS idx_hygiene_production_month_tab 
    ON hygiene_production(clinic_id, month_tab);

-- Enable Row Level Security
ALTER TABLE hygiene_production ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view hygiene production for their clinics" 
    ON hygiene_production FOR SELECT 
    USING (
        clinic_id IN (
            SELECT clinic_id 
            FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert hygiene production for their clinics" 
    ON hygiene_production FOR INSERT 
    WITH CHECK (
        clinic_id IN (
            SELECT clinic_id 
            FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update hygiene production for their clinics" 
    ON hygiene_production FOR UPDATE 
    USING (
        clinic_id IN (
            SELECT clinic_id 
            FROM user_clinic_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_hygiene_production_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hygiene_production_updated_at
    BEFORE UPDATE ON hygiene_production
    FOR EACH ROW
    EXECUTE FUNCTION update_hygiene_production_updated_at();

-- Insert sample data for testing (optional)
-- This matches the first row from your CSV
INSERT INTO hygiene_production (
    id, 
    clinic_id, 
    date, 
    month_tab,
    hours_worked,
    estimated_production,
    verified_production,
    production_goal,
    variance_percentage,
    bonus_amount
) VALUES (
    '5f05692b-b408-4787-9cb9-f32eee75fa2d',
    'sample-clinic-id', -- Replace with actual clinic ID
    '2023-12-04',
    'Dec-23',
    5.49,
    384.86,
    177.12,
    779.03,
    -77.26, -- ((177.12 - 779.03) / 779.03) * 100
    0.00
) ON CONFLICT (id) DO NOTHING;

-- Create a view for easier querying with calculated fields
CREATE OR REPLACE VIEW hygiene_production_summary AS
SELECT 
    hp.*,
    -- Calculate production per hour
    CASE 
        WHEN hours_worked > 0 THEN verified_production / hours_worked 
        ELSE 0 
    END AS production_per_hour,
    
    -- Variance amount (not just percentage)
    (verified_production - production_goal) AS variance_amount,
    
    -- Extract month and year for easier grouping
    EXTRACT(YEAR FROM date) AS year,
    EXTRACT(MONTH FROM date) AS month,
    
    -- Goal achievement status
    CASE 
        WHEN variance_percentage >= 0 THEN 'Met'
        WHEN variance_percentage >= -10 THEN 'Close'
        ELSE 'Missed'
    END AS goal_status
    
FROM hygiene_production hp;

-- Grant access to the anon role (for Apps Script API calls)
GRANT SELECT, INSERT, UPDATE ON hygiene_production TO anon;
GRANT SELECT ON hygiene_production_summary TO anon;