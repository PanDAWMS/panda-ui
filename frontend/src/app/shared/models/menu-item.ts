export type MenuItem = {
  label: string;
  icon?: string;
  badge?: string | number;
  shortcut?: string;
  routerLink?: string;
  command?: (event: Event) => void;
  items?: MenuItem[];
};
