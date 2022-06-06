import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabase = null;
const useSupabase = () => {
  if (!supabase) supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
};

export { useSupabase };
