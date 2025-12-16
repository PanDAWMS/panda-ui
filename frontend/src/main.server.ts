import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { ApplicationRef, provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext): Promise<ApplicationRef> =>
  bootstrapApplication(
    AppComponent,
    { ...config, providers: [provideZoneChangeDetection(), ...config.providers] },
    context,
  );

export default bootstrap;
