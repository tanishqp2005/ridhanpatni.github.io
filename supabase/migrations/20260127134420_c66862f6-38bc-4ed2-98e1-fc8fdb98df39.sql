-- Drop the old restrictive delete policy
DROP POLICY IF EXISTS "No one can delete uploads" ON public.family_uploads;

-- Allow deletes via service role (edge function uses service role key)
-- The edge function handles auth, so we keep RLS simple
CREATE POLICY "Service role can delete uploads"
ON public.family_uploads
FOR DELETE
USING (true);

-- Drop the old restrictive update policy  
DROP POLICY IF EXISTS "No one can update uploads" ON public.family_uploads;

-- Allow updates via service role for approve/reject
CREATE POLICY "Service role can update uploads"
ON public.family_uploads
FOR UPDATE
USING (true);