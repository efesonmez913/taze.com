import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase projesi henüz kurulmadıysa (.env.local doldurulmadıysa) uygulamanın
// çökmesi yerine "demo mod" olarak çalışmasını sağlıyoruz. Bu sayede arayüzü
// Supabase bağlanmadan önce de görüp test edebilirsin.
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("xxxx") &&
    !supabaseAnonKey.includes("xxxx")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
