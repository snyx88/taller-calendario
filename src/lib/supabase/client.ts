import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Entrega, EntregaInsert, EntregaUpdate } from "@/types/entrega";

export type Database = {
  public: {
    Tables: {
      entregas: {
        Row: Entrega;
        Insert: EntregaInsert;
        Update: EntregaUpdate;
      };
    };
    Functions: {
      reprogramar_entrega: {
        Args: { p_id: string; p_fecha: string; p_hora: string | null };
        Returns: Entrega;
      };
    };
  };
};

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/, "");
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local",
    );
  }

  return {
    url: normalizeSupabaseUrl(url),
    anonKey,
  };
}

let browserClient: SupabaseClient<Database> | undefined;

export function createBrowserClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createClient<Database>(url, anonKey);
}

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient();
  }

  return browserClient;
}
