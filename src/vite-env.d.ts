/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" enables real ad markup in ad slots. Slots reserve space regardless. */
  readonly VITE_ADS_ENABLED?: string
  /** Supabase project URL. Absent → daily leaderboard + global counter disabled. */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase anon / publishable key. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
