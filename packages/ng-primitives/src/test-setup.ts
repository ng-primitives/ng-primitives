import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import '@analogjs/vitest-angular/setup-zone';
import '@angular/compiler';
import '@testing-library/jest-dom';

setupTestBed({ zoneless: false, browserMode: true });
