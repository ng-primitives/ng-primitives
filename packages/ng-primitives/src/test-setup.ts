import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import '@angular/compiler';
import '@testing-library/jest-dom';

setupTestBed({ zoneless: true, browserMode: true });
