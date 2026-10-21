/// <reference types="vite/client" />

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on(event: string, listener: (...args: unknown[]) => void): void;
  removeListener(event: string, listener: (...args: unknown[]) => void): void;
}

interface ImportMetaEnv {
  readonly VITE_TOKEN_ADDRESS: string;
  readonly VITE_DEPLOY_BLOCK?: string;
  readonly VITE_API_URL?: string;
}

interface Window {
  ethereum?: Eip1193Provider;
}
