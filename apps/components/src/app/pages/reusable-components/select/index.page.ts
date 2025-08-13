import { Component } from '@angular/core';
import { Select } from './select';

@Component({
  selector: 'app-select-example',
  imports: [Select],
  template: `
    <app-select [options]="options" placeholder="Select a character" />
  `,
})
export default class App {
  readonly options: string[] = [
    'Marty McFly',
    'Doc Brown',
    'Biff Tannen',
    'George McFly',
    'Jennifer Parker',
    'Emmett Brown',
    'Einstein',
    'Clara Clayton',
    'Needles',
    'Goldie Wilson',
    'Marvin Berry',
    'Lorraine Baines',
    'Strickland',
  ];
}
