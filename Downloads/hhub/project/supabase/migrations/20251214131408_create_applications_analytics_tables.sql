/*
  # Applications & Analytics Tables for TikTok Recruitment Funnel

  1. New Tables
    - `applications` - Stores all job applications with source attribution
    - `application_metrics` - Real-time analytics tracking
    - `content_prompts` - AI-generated TikTok content prompts library
    
  2. Security
    - RLS enabled on all tables
    - Policies for data access and analytics viewing
*/

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  experience text NOT NULL,
  employment_type text NOT NULL,
  start_date date NOT NULL,
  resume_link text,
  work_authorization boolean NOT NULL DEFAULT true,
  selected_shift text NOT NULL,
  source_campaign text DEFAULT 'organic',
  source_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  ip_address text,
  user_agent text,
  submission_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Application Metrics Table (for analytics aggregation)
CREATE TABLE IF NOT EXISTS application_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date DEFAULT CURRENT_DATE,
  metric_hour integer,
  campaign_source text,
  shift_selected text,
  page_views integer DEFAULT 0,
  form_opens integer DEFAULT 0,
  form_submissions integer DEFAULT 0,
  conversion_rate decimal(5, 2),
  average_time_to_apply integer,
  geographic_location text,
  device_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(metric_date, campaign_source, shift_selected)
);

-- AI Content Prompts Library
CREATE TABLE IF NOT EXISTS content_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  hook text NOT NULL,
  description text,
  key_messaging text,
  duration_seconds integer DEFAULT 30,
  target_demographic text,
  authenticity_score integer DEFAULT 8,
  expected_conversion_rate decimal(5, 2),
  best_for_shifts text,
  content_status text DEFAULT 'active',
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_prompts ENABLE ROW LEVEL SECURITY;

-- Policies for applications (authenticated users can view their own)
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users cannot access applications"
  ON applications FOR SELECT
  TO anon
  USING (false);

-- Allow inserting applications
CREATE POLICY "Anyone can submit an application"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for metrics (admin/analytics only - restrictive by default)
CREATE POLICY "Metrics are read-only for now"
  ON application_metrics FOR SELECT
  TO authenticated
  USING (false);

-- Policies for content prompts (public read, admin write)
CREATE POLICY "Content prompts are viewable"
  ON content_prompts FOR SELECT
  TO public
  USING (content_status = 'active');

CREATE POLICY "Admins can insert content prompts"
  ON content_prompts FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Indexes for performance
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_applications_shift ON applications(selected_shift);
CREATE INDEX idx_applications_source ON applications(source_campaign);
CREATE INDEX idx_metrics_date ON application_metrics(metric_date DESC);
CREATE INDEX idx_prompts_category ON content_prompts(category);