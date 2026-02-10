export type AppConfig = {
  apiUrl: string;
  logLevel: string;
  production: boolean;
  [key: string]: unknown; // allows future extension without TS errors
};
