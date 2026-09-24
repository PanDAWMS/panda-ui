export type Option = {
  label: string;
  value: string | number;
};

export type MultiselectOption<T = string | number> = {
  label: string;
  value: T;
};

export type MultiselectFieldConfig<T = string | number> = {
  key: string;
  label: string;
  options: MultiselectOption<T>[];
  placeholder?: string;
};

export type TextFieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
};
