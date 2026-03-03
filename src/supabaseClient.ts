
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://djbloiengqedfosppwga.supabase.co';
const supabaseAnonKey = 'sb_publishable_LzQ6dnrTbWQDxGtKYObbuw_6ogo46Sl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
