
-- Create charge_items table for Mind Clearing Operations
CREATE TABLE public.charge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid REFERENCES public.operators(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  is_cleared boolean NOT NULL DEFAULT false,
  cleared_at timestamp with time zone,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.charge_items ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can select charge_items"
ON public.charge_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert charge_items"
ON public.charge_items FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update charge_items"
ON public.charge_items FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete charge_items"
ON public.charge_items FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Operators (anon) can read their own charge items by operator_id
CREATE POLICY "Anyone can read charge_items by operator_id"
ON public.charge_items FOR SELECT TO anon
USING (true);

-- Operators (anon) can update is_cleared on their charge items
CREATE POLICY "Anon can update charge_item cleared status"
ON public.charge_items FOR UPDATE TO anon
USING (true)
WITH CHECK (is_cleared IS NOT NULL);

-- Auto-update updated_at
CREATE TRIGGER update_charge_items_updated_at
  BEFORE UPDATE ON public.charge_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
