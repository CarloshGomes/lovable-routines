import { supabase } from './integrations/supabase/client';

// Run this script once to add the justification fields to the tracking_data table
async function applyMigration() {
    try {
        console.log('Applying migration: Adding justification fields to tracking_data...');

        const { error } = await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE public.tracking_data 
        ADD COLUMN IF NOT EXISTS delay_reason TEXT,
        ADD COLUMN IF NOT EXISTS is_impossible BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT false;
      `
        });

        if (error) {
            console.error('Migration failed:', error);
            // Try alternative approach using direct SQL
            console.log('Trying alternative approach...');

            // Since rpc might not exist, we'll need to run this manually in Supabase SQL Editor
            console.log('\n=== MANUAL MIGRATION REQUIRED ===');
            console.log('Please run the following SQL in your Supabase SQL Editor:');
            console.log(`
ALTER TABLE public.tracking_data 
ADD COLUMN IF NOT EXISTS delay_reason TEXT,
ADD COLUMN IF NOT EXISTS is_impossible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT false;
      `);
            console.log('=================================\n');
        } else {
            console.log('✅ Migration applied successfully!');
        }
    } catch (err) {
        console.error('Error applying migration:', err);
        console.log('\n=== MANUAL MIGRATION REQUIRED ===');
        console.log('Please run the following SQL in your Supabase SQL Editor:');
        console.log(`
ALTER TABLE public.tracking_data 
ADD COLUMN IF NOT EXISTS delay_reason TEXT,
ADD COLUMN IF NOT EXISTS is_impossible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT false;
    `);
        console.log('=================================\n');
    }
}

applyMigration();
