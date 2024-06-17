import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo } from '@ng-icons/lucide';

@Component({
  selector: 'docs-alert',
  standalone: true,
  imports: [NgIcon],
  viewProviders: [provideIcons({ lucideInfo })],
  template: `
    <div class="flex gap-x-3 rounded-lg bg-white py-2 pe-4 ps-3 shadow-sm ring-1 ring-black/5">
      <ng-icon class="mt-1 text-red-500" name="lucideInfo" size="16" />

      <div class="flex flex-col">
        <p class="font-medium text-zinc-950">Alert title</p>
        <p class="text-xs text-zinc-500">
          The alert description goes here. You can add multiple lines of text if needed.
        </p>
      </div>
    </div>
  `,
})
export default class AlertExample {}
