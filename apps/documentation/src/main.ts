import { bootstrapApplication } from '@angular/platform-browser';
import 'prismjs';
import 'prismjs/components/prism-typescript';
import 'zone.js';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
