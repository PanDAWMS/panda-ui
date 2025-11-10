export interface ErrorDescription {
  id: bigint,
  component: string;
  code: number;
  acronym?: string;
  diagnostics?: string;
  description?: string;
  category?: number;
}
