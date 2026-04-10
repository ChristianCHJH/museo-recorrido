import { bootstrapApplication } from '@angular/platform-browser';
import { configuracionApp } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, configuracionApp)
  .catch((err) => console.error(err));
