/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY_1: string
  readonly VITE_GROQ_API_KEY_2: string
  readonly VITE_GROQ_API_KEY_3: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
