
ALTER TABLE public.operators
ADD COLUMN step_9_completed boolean NOT NULL DEFAULT false,
ADD COLUMN step_9_completed_at timestamp with time zone;
