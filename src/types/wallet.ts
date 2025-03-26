export interface CtrlWallet {
  thorchain: {
    request: (request: { method: string; params: unknown[] }, callback: (error: Error | null, result: unknown) => void) => void;
  };
}

declare global {
  interface Window {
    xfi?: CtrlWallet;
  }
} 