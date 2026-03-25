
-- Drop existing charge_items table and rebuild with full schema
DROP TABLE IF EXISTS public.charge_items CASCADE;

-- Create charge status enum
CREATE TYPE public.charge_status AS ENUM ('not_started', 'in_progress', 'cleared');

-- Create roadmap phase enum
CREATE TYPE public.roadmap_phase AS ENUM ('phase_1', 'phase_2', 'phase_3', 'phase_4');

-- Create roadmap item type enum
CREATE TYPE public.roadmap_item_type AS ENUM ('standard', 'personalised');

-- Recreate charge_items with full schema
CREATE TABLE public.charge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid REFERENCES public.operators(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  statement text NOT NULL,
  charge_level integer NOT NULL DEFAULT 5 CHECK (charge_level >= 1 AND charge_level <= 10),
  current_charge_level integer CHECK (current_charge_level >= 0 AND current_charge_level <= 10),
  priority_rank integer CHECK (priority_rank IN (1, 2, 3)),
  status charge_status NOT NULL DEFAULT 'not_started',
  command_notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create clearing_logs table
CREATE TABLE public.clearing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id uuid REFERENCES public.charge_items(id) ON DELETE CASCADE NOT NULL,
  operator_id uuid REFERENCES public.operators(id) ON DELETE CASCADE NOT NULL,
  pre_clearing_level integer NOT NULL CHECK (pre_clearing_level >= 0 AND pre_clearing_level <= 10),
  post_clearing_level integer NOT NULL CHECK (post_clearing_level >= 0 AND post_clearing_level <= 10),
  operator_notes text,
  logged_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create roadmap_items table
CREATE TABLE public.roadmap_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid REFERENCES public.operators(id) ON DELETE CASCADE NOT NULL,
  phase roadmap_phase NOT NULL,
  item_type roadmap_item_type NOT NULL DEFAULT 'standard',
  icon text,
  title text NOT NULL,
  description text,
  target_week integer CHECK (target_week >= 1 AND target_week <= 12),
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create weekly_focus table
CREATE TABLE public.weekly_focus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid REFERENCES public.operators(id) ON DELETE CASCADE NOT NULL,
  week_number integer NOT NULL CHECK (week_number >= 1 AND week_number <= 12),
  headline text NOT NULL,
  priority_charge_ids uuid[] DEFAULT '{}',
  priority_action_ids uuid[] DEFAULT '{}',
  command_briefing_datetime timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(operator_id, week_number)
);

-- RLS for charge_items
ALTER TABLE public.charge_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select charge_items" ON public.charge_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert charge_items" ON public.charge_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update charge_items" ON public.charge_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete charge_items" ON public.charge_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon can read charge_items" ON public.charge_items FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can update charge status" ON public.charge_items FOR UPDATE TO anon USING (true) WITH CHECK (status IS NOT NULL);

-- RLS for clearing_logs
ALTER TABLE public.clearing_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select clearing_logs" ON public.clearing_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon can read clearing_logs" ON public.clearing_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert clearing_logs" ON public.clearing_logs FOR INSERT TO anon WITH CHECK (true);

-- RLS for roadmap_items
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select roadmap_items" ON public.roadmap_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roadmap_items" ON public.roadmap_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roadmap_items" ON public.roadmap_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roadmap_items" ON public.roadmap_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon can read roadmap_items" ON public.roadmap_items FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can update roadmap_items" ON public.roadmap_items FOR UPDATE TO anon USING (true) WITH CHECK (completed IS NOT NULL);

-- RLS for weekly_focus
ALTER TABLE public.weekly_focus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can select weekly_focus" ON public.weekly_focus FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert weekly_focus" ON public.weekly_focus FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update weekly_focus" ON public.weekly_focus FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete weekly_focus" ON public.weekly_focus FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anon can read weekly_focus" ON public.weekly_focus FOR SELECT TO anon USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_charge_items_updated_at BEFORE UPDATE ON public.charge_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_roadmap_items_updated_at BEFORE UPDATE ON public.roadmap_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_weekly_focus_updated_at BEFORE UPDATE ON public.weekly_focus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.charge_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clearing_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.roadmap_items;
