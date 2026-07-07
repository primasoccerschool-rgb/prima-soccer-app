import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Variables Supabase manquantes. Créez un fichier .env à partir de .env.example (voir README.md)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
