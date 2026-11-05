import { Params } from '@angular/router';

export type MenuItem = {
  label: string;
  icon?: string;
  badge?: string | number;
  shortcut?: string;
  routerLink?: string;
  queryParams?: Params;
  command?: (event: Event) => void;
  items?: MenuItem[];
};
