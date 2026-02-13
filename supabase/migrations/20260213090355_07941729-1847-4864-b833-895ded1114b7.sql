
-- Drop the current overly permissive SELECT policy on future_letters
DROP POLICY IF EXISTS "Service role can view letters" ON public.future_letters;

-- Create a restrictive SELECT policy that only allows service_role
CREATE POLICY "Only service role can read letters"
ON public.future_letters
FOR SELECT
USING ((current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

-- Create a SECURITY DEFINER function so the public can get the count without reading content
CREATE OR REPLACE FUNCTION public.get_future_letters_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer FROM public.future_letters;
$$;
