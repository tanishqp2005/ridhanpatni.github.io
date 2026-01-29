-- Create table for "The Firsts" milestones
CREATE TABLE public.baby_firsts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_key TEXT NOT NULL UNIQUE,
  milestone_title TEXT NOT NULL,
  caption TEXT,
  photo_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.baby_firsts ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Anyone can view baby firsts" 
ON public.baby_firsts 
FOR SELECT 
USING (true);

-- Service role can manage (via edge function)
CREATE POLICY "Service role can manage baby firsts" 
ON public.baby_firsts 
FOR ALL 
USING (true);

-- Insert default milestones
INSERT INTO public.baby_firsts (milestone_key, milestone_title, display_order) VALUES
  ('first_smile', 'First Smile', 1),
  ('first_word', 'First Word', 2),
  ('first_step', 'First Step', 3),
  ('first_bath', 'First Bath', 4),
  ('first_festival', 'First Festival', 5),
  ('first_trip', 'First Trip', 6);

-- Create table for voice notes
CREATE TABLE public.voice_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Anyone can view voice notes" 
ON public.voice_notes 
FOR SELECT 
USING (true);

-- Anyone can add
CREATE POLICY "Anyone can add voice notes" 
ON public.voice_notes 
FOR INSERT 
WITH CHECK (true);

-- Create table for future letters
CREATE TABLE public.future_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT NOT NULL,
  letter_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;

-- Anyone can add letters (but not view - they're sealed!)
CREATE POLICY "Anyone can add future letters" 
ON public.future_letters 
FOR INSERT 
WITH CHECK (true);

-- Only service role can view (for admin)
CREATE POLICY "Service role can view letters" 
ON public.future_letters 
FOR SELECT 
USING (true);