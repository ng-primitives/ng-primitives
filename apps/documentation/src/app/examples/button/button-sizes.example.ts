import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button-sizes',
  imports: [NgpButton],
  template: `
    <div class="button-container">
      <button ngpButton size="sm">Small</button>
      <button ngpButton>Medium</button>
      <button ngpButton size="lg">Large</button>
      <button ngpButton size="xl">Extra Large</button>
    </div>
  `,
  styles: `
    .button-container {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      border: none;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
    }

    [ngpButton][data-size='sm'] {
      height: 2rem;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      font-size: 0.875rem;
    }

    [ngpButton][data-size='md'],
    [ngpButton]:not([data-size]) {
      height: 2.5rem;
      padding-left: 1rem;
      padding-right: 1rem;
      font-size: 0.875rem;
    }

    [ngpButton][data-size='lg'] {
      height: 3rem;
      padding-left: 1.25rem;
      padding-right: 1.25rem;
      font-size: 1rem;
    }

    [ngpButton][data-size='xl'] {
      height: 3.5rem;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      font-size: 1.125rem;
    }
  `,
})
export default class ButtonSizesExample {}
