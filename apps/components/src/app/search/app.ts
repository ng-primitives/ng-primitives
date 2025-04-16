import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Search } from './search';

@Component({
  selector: 'app-search-example',
  imports: [Search, FormsModule],
  template: `
    <app-search [(ngModel)]="query" placeholder="Search customers" />
  `,
})
export default class App {
  readonly query = signal<string>('');
}
