export type AppConfig = {
  apiUrl: string;
  [key: string]: unknown; // allows future extension without TS errors
};
