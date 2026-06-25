"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        // Unique storage key to prevent collision detection
        storageKey: "zerionstore-chat-realtime",
        // Use in-memory storage only (no localStorage)
        storage: {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        },
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }
  );

  return supabaseInstance;
}
