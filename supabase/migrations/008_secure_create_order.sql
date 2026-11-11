-- Allow checkout to create orders through the trusted database function while RLS remains enabled.
ALTER FUNCTION public.create_order(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID
) SECURITY DEFINER;

ALTER FUNCTION public.create_order(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID
) SET search_path = public;