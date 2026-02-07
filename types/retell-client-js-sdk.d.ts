// types/retell-client-js-sdk.d.ts
declare module 'retell-client-js-sdk' {
  export class RetellWebClient {
    stopCall: any;
    constructor();
    on(event: string, callback: (...args: any[]) => void): void;
    startConversation(config: {
      callId: string;
      sampleRate?: number;
      enableUpdate?: boolean;
    }): Promise<void>;
    stopConversation(): void;
  }
}