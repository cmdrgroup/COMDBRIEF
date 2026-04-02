
-- Add new columns for the enhanced charge inventory
ALTER TABLE public.charge_items
  ADD COLUMN IF NOT EXISTS domain text DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'stated',
  ADD COLUMN IF NOT EXISTS evidence text,
  ADD COLUMN IF NOT EXISTS is_cleared boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cleared_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_rating integer,
  ADD COLUMN IF NOT EXISTS blind_spot_question text;

-- Create a domain enum check
ALTER TABLE public.charge_items
  ADD CONSTRAINT charge_items_domain_check CHECK (domain IN ('business', 'home', 'self', 'both'));

ALTER TABLE public.charge_items
  ADD CONSTRAINT charge_items_source_check CHECK (source IN ('stated', 'implied', 'universal', 'blind_spot', 'self_reported'));
