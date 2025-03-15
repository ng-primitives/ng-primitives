import { Component } from '@angular/core';
import { Button } from './button.ng';

@Component({
  selector: 'app-button-example',
  imports: [Button],
  template: '<button app-button>Click me</button>',
})
export default class App {}
