-- Add schedule_snapshots table to store per-day snapshots of user schedules
CREATE TABLE public.schedule_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  blocks JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(username, snapshot_date)
);

-- RLS and policies
ALTER TABLE public.schedule_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read on schedule_snapshots" ON public.schedule_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow all insert on schedule_snapshots" ON public.schedule_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on schedule_snapshots" ON public.schedule_snapshots FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on schedule_snapshots" ON public.schedule_snapshots FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_snapshots;
