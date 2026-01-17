/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_RPC_URL?: string;
  readonly VITE_EXPLORER_URL?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
