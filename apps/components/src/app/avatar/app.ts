import { Component } from '@angular/core';
import { Avatar } from './avatar';

@Component({
  selector: 'app-avatar-example',
  imports: [Avatar],
  template: `
    <app-avatar image="https://mighty.tools/mockmind-api/content/human/104.jpg" fallback="AH" />
  `,
})
export default class App {}
