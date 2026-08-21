-- 20260821000009_add_geotagged_attendance.sql
-- Add geo-tagged photo URL and GPS coordinate columns to attendance_records

ALTER TABLE public.attendance_records
  ADD COLUMN IF NOT EXISTS check_in_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS check_in_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS check_in_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS check_out_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS check_out_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS check_out_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_address TEXT;

-- Create storage bucket for attendance photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('attendance-photos', 'attendance-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS policies for attendance-photos
DROP POLICY IF EXISTS "Authenticated users can upload attendance photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload attendance photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attendance-photos');

DROP POLICY IF EXISTS "Public read access for attendance photos" ON storage.objects;
CREATE POLICY "Public read access for attendance photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attendance-photos');
