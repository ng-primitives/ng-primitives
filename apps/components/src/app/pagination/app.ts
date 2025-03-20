import { Component } from '@angular/core';
import { Pagination } from './pagination';

@Component({
  selector: 'app-pagination-example',
  imports: [Pagination],
  template: `
    <app-pagination pageCount="5" />
  `,
})
export default class App {}
