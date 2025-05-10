// This file is needed to support autocomplete for process.env
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // convex public url
      NEXT_PUBLIC_CONVEX_URL: string;
      // application url for API endpoints and links
      NEXT_PUBLIC_APP_URL?: string;
      // OneSignal configuration
      ONESIGNAL_APP_ID?: string;
      ONESIGNAL_API_KEY?: string;
      EMAIL_FROM?: string;
      EMAIL_FROM_NAME?: string;
    }
  }
}
