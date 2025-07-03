import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button-sizes-tailwind',
  imports: [NgpButton],
  template: `
    <div class="flex items-center gap-3">
      <button ngpButton size="sm">Small</button>
      <button ngpButton>Medium</button>
      <button ngpButton size="lg">Large</button>
      <button ngpButton size="xl">Extra Large</button>
    </div>
  `,
  styles: `
    [ngpButton] {
      @apply rounded-md border border-gray-200 bg-white font-medium text-gray-900 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-white;
    }

    /* Size variants based on data-size attribute */
    [ngpButton][data-size='sm'] {
      @apply px-3 py-1.5 text-sm;
    }

    [ngpButton][data-size='md'] {
      @apply px-4 py-2;
    }

    [ngpButton][data-size='lg'] {
      @apply rounded-lg px-5 py-2.5;
    }

    [ngpButton][data-size='xl'] {
      @apply rounded-lg px-6 py-3 text-lg;
    }
  `,
})
export default class ButtonSizesTailwindExample {}
