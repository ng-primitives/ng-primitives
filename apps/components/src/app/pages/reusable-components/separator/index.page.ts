import { Component } from '@angular/core';
import { Separator } from './separator';

@Component({
  selector: 'app-separator-example',
  imports: [Separator],
  template: `
    <div app-separator orientation="horizontal"></div>
  `,
})
export default class App {}
