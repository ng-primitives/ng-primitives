import { Component } from '@angular/core';
import { Textarea } from './textarea';

@Component({
  selector: 'app-textarea-example',
  imports: [Textarea],
  template: `
    <textarea app-textarea placeholder="Enter your message"></textarea>
  `,
})
export default class App {}
