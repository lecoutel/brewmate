/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FEEDBACK_FORM_URL: string;
  readonly VITE_DONATION_PAYPAL_ME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
