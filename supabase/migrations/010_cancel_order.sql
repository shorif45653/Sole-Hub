-- Allow customers to cancel their own orders while they are still placed.

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

  SELECT order_status INTO v_order_status
  FROM public.orders
  WHERE id = p_order_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order_status <> 'PLACED' THEN
    RAISE EXCEPTION 'Only placed orders can be cancelled';
  END IF;

  UPDATE public.products AS products
  SET stock = products.stock + items.quantity,
      updated_at = NOW()
  FROM public.order_items AS items
  WHERE items.order_id = p_order_id
    AND products.id = items.product_id;

  UPDATE public.orders
  SET order_status = 'CANCELLED',
      updated_at = NOW()
  WHERE id = p_order_id AND user_id = v_user_id;

  RETURN QUERY SELECT p_order_id, 'CANCELLED'::TEXT;
END;
$$;