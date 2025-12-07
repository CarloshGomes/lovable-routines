-- Create profiles table for users (operators and supervisors)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('operator', 'supervisor')),
  position TEXT,
  avatar TEXT,
  color TEXT DEFAULT '#3B82F6',
  pin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedule_blocks table for routines
CREATE TABLE public.schedule_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id TEXT NOT NULL,
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  color TEXT DEFAULT '#3B82F6',
  tasks TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(block_id, username)
);

-- Create tracking_data table for task completion
CREATE TABLE public.tracking_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_key TEXT NOT NULL,
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  completed_tasks TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tracking_key, username)
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL REFERENCES public.profiles(username) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supervisor_settings table
CREATE TABLE public.supervisor_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supervisor_pin TEXT NOT NULL DEFAULT '1234',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all authenticated and anonymous users to read/write
-- Since this is a team management app without auth, we use permissive policies
CREATE POLICY "Allow all read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow all insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on profiles" ON public.profiles FOR DELETE USING (true);

CREATE POLICY "Allow all read on schedule_blocks" ON public.schedule_blocks FOR SELECT USING (true);
CREATE POLICY "Allow all insert on schedule_blocks" ON public.schedule_blocks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on schedule_blocks" ON public.schedule_blocks FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on schedule_blocks" ON public.schedule_blocks FOR DELETE USING (true);

CREATE POLICY "Allow all read on tracking_data" ON public.tracking_data FOR SELECT USING (true);
CREATE POLICY "Allow all insert on tracking_data" ON public.tracking_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on tracking_data" ON public.tracking_data FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on tracking_data" ON public.tracking_data FOR DELETE USING (true);

CREATE POLICY "Allow all read on activity_logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow all insert on activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all read on supervisor_settings" ON public.supervisor_settings FOR SELECT USING (true);
CREATE POLICY "Allow all update on supervisor_settings" ON public.supervisor_settings FOR UPDATE USING (true);

-- Insert default profiles
INSERT INTO public.profiles (username, name, role, position, avatar, color, pin) VALUES
('isabela', 'Isabela', 'operator', 'Operador', '👩‍💼', '#EC4899', '1234'),
('rhyan', 'Rhyan', 'operator', 'Operador', '👨‍💼', '#3B82F6', '1234');

-- Insert default supervisor settings
INSERT INTO public.supervisor_settings (supervisor_pin) VALUES ('1234');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedule_blocks_updated_at
  BEFORE UPDATE ON public.schedule_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracking_data_updated_at
  BEFORE UPDATE ON public.tracking_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;