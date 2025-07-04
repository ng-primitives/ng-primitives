import { Component } from '@angular/core';
import { Button } from './button';

@Component({
  selector: 'app-root',
  imports: [Button],
  template: '<button app-button>Click me</button>',
})
export default class App {}