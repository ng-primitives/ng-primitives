import { Component } from '@angular/core';
import { Combobox } from './combobox';

@Component({
  selector: 'app-combobox-example',
  imports: [Combobox],
  template: `
    <app-combobox [options]="options" placeholder="Select a character" />
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
