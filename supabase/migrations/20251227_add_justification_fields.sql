-- Add justification fields to tracking_data table
ALTER TABLE public.tracking_data 
ADD COLUMN IF NOT EXISTS delay_reason TEXT,
ADD COLUMN IF NOT EXISTS is_impossible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT false;

-- Add comment to document the new fields
COMMENT ON COLUMN public.tracking_data.delay_reason IS 'Reason for delay: high_demand, system_slowness, external_factor, break_adjustment, other, impossible_to_complete';
COMMENT ON COLUMN public.tracking_data.is_impossible IS 'Whether the block was marked as impossible to complete';
COMMENT ON COLUMN public.tracking_data.escalated IS 'Whether the delay was escalated to supervisor';
