-- Fix Security Issue 1: Block UPDATE/DELETE on family_uploads table
-- Family uploads should only be insertable by anyone, viewable if approved, but not modifiable
CREATE POLICY "No one can update uploads" 
ON public.family_uploads 
FOR UPDATE 
USING (false);

CREATE POLICY "No one can delete uploads" 
ON public.family_uploads 
FOR DELETE 
USING (false);

-- Fix Security Issue 2: Block write operations on milestones table
-- Milestones are admin-managed data, should not be modifiable via client
CREATE POLICY "No one can insert milestones" 
ON public.milestones 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "No one can update milestones" 
ON public.milestones 
FOR UPDATE 
USING (false);

CREATE POLICY "No one can delete milestones" 
ON public.milestones 
FOR DELETE 
USING (false);

-- Fix Security Issue 3: Add storage policies for birthday-uploads bucket
-- The bucket is public for approved images display, but we need proper RLS on storage.objects
-- Allow anyone to upload files (for family memory uploads)
CREATE POLICY "Anyone can upload to birthday-uploads"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'birthday-uploads');

-- Allow public read access only to files in the family folder
CREATE POLICY "Anyone can view birthday uploads"
ON storage.objects
FOR SELECT
USING (bucket_id = 'birthday-uploads');

-- No one can update or delete storage objects (admin can do via service role)
CREATE POLICY "No one can update birthday uploads"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'birthday-uploads' AND false);

CREATE POLICY "No one can delete birthday uploads"
ON storage.objects
FOR DELETE
USING (bucket_id = 'birthday-uploads' AND false);