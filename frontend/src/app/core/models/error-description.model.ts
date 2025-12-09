export type ErrorDescription = {
  id: bigint | null;
  component: string;
  code: number;
  acronym?: string;
  diagnostics: string;
  description: string;
  category: number;
  categoryName?: string;
  categoryColor?: string;
};
