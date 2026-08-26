/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" enables real ad markup in ad slots. Slots reserve space regardless. */
  readonly VITE_ADS_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
