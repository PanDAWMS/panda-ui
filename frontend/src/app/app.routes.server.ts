import { RenderMode, ServerRoute } from '@angular/ssr';

// Define server-side routes with their rendering modes
export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
