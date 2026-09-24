export type AppConfig = {
  apiUrl: string;
  logLevel: string;
  production: boolean;
  installedApps?: string[];
  [key: string]: unknown; // allows future extension without TS errors
};
