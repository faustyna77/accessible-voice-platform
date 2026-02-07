// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Typy
export interface LEDData {
  id: number;
  pin: number;
  label: string;
  state: boolean;
  updated_at: string;
}

export interface DHTData {
  id: number;
  temperature: number;
  humidity: number;
  created_at: string;
}