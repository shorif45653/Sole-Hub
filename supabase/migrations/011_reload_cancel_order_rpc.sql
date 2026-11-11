-- Recreate the customer cancellation RPC and reload the Supabase API schema cache.

CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id UUID)
RETURNS TABLE (order_id UUID, order_status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order_status TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT o.order_status INTO v_order_status
  FROM public.orders AS o
  WHERE o.id = p_order_id AND o.user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order_status <> 'PLACED' THEN
    RAISE EXCEPTION 'Only placed orders can be cancelled';
  END IF;

  UPDATE public.products AS p
  SET stock = p.stock + oi.quantity,
      updated_at = NOW()
  FROM public.order_items AS oi
  WHERE oi.order_id = p_order_id
    AND p.id = oi.product_id;

  UPDATE public.orders AS o
  SET order_status = 'CANCELLED',
      updated_at = NOW()
  WHERE o.id = p_order_id AND o.user_id = v_user_id;

  RETURN QUERY SELECT p_order_id, 'CANCELLED'::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_order(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';