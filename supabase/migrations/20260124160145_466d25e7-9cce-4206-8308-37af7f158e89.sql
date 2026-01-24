-- Create milestones table for the 12-month journey
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  month_label TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create milestone_media table for photos/videos
CREATE TABLE public.milestone_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family_uploads table
CREATE TABLE public.family_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uploader_name TEXT NOT NULL,
  memory_message TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guest_wishes table
CREATE TABLE public.guest_wishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_wishes ENABLE ROW LEVEL SECURITY;

-- Public read access for milestones (everyone can see the baby's journey)
CREATE POLICY "Anyone can view milestones" ON public.milestones FOR SELECT USING (true);

-- Public read access for milestone media
CREATE POLICY "Anyone can view milestone media" ON public.milestone_media FOR SELECT USING (true);

-- Public read access for approved family uploads
CREATE POLICY "Anyone can view approved uploads" ON public.family_uploads FOR SELECT USING (approved = true);

-- Anyone can insert family uploads (guests don't need auth)
CREATE POLICY "Anyone can upload memories" ON public.family_uploads FOR INSERT WITH CHECK (true);

-- Public read access for wishes
CREATE POLICY "Anyone can view wishes" ON public.guest_wishes FOR SELECT USING (true);

-- Anyone can leave wishes
CREATE POLICY "Anyone can leave wishes" ON public.guest_wishes FOR INSERT WITH CHECK (true);

-- Insert the 12 milestones
INSERT INTO public.milestones (month_number, month_label) VALUES
  (1, 'March 2025'),
  (2, 'April 2025'),
  (3, 'May 2025'),
  (4, 'June 2025'),
  (5, 'July 2025'),
  (6, 'August 2025'),
  (7, 'September 2025'),
  (8, 'October 2025'),
  (9, 'November 2025'),
  (10, 'December 2025'),
  (11, 'January 2026'),
  (12, 'February 2026');

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('birthday-uploads', 'birthday-uploads', true);

-- Storage policies
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'birthday-uploads');
CREATE POLICY "Anyone can upload files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'birthday-uploads');