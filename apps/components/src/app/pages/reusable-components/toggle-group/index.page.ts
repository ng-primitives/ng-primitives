import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3, heroBars3BottomLeft, heroBars3BottomRight } from '@ng-icons/heroicons/outline';
import { ToggleGroup } from './toggle-group';
import { ToggleGroupItem } from './toggle-group-item';

@Component({
  selector: 'app-toggle-group-example',
  imports: [ToggleGroup, ToggleGroupItem, NgIcon, FormsModule],
  providers: [provideIcons({ heroBars3, heroBars3BottomLeft, heroBars3BottomRight })],
  template: `
    <app-toggle-group [(ngModel)]="value">
      <button app-toggle-group-item value="left" aria-label="Left">
        <ng-icon name="heroBars3BottomLeft" />
      </button>
      <button app-toggle-group-item value="center" aria-label="Center">
        <ng-icon name="heroBars3" />
      </button>
      <button app-toggle-group-item value="right" aria-label="Right">
        <ng-icon name="heroBars3BottomRight" />
      </button>
    </app-toggle-group>
  `,
})
export default class App {
  value = signal<string[]>(['center']);
}
