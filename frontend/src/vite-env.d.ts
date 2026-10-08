/// <reference types="vite/client" />


declare global {
  interface TurnstileRenderOptions {
    sitekey: string;
    theme?: 'light' | 'dark' | 'auto';
    callback?: (token: string) => void;
    'expired-callback'?: () => void;
    'error-callback'?: () => void;
  }
  interface TurnstileApi {
    render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  }
  interface Window { turnstile?: TurnstileApi; }
}

export {};