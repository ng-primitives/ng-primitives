import { bootstrapApplication } from '@angular/platform-browser';
import 'prismjs';
import 'prismjs/components/prism-typescript';
import 'zone.js';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch(err => console.error(err));
