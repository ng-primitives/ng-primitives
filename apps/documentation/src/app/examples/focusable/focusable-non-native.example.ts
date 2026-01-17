import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-focusable-non-native',
  imports: [NgpButton],
  template: `
    <div class="demo">
      <p class="description">
        These non-native elements are keyboard-accessible.
        <br />
        Try using Tab to navigate and Enter/Space to activate.
      </p>

      <div class="buttons">
        <div class="card-button" (click)="selected.set('option1')" ngpButton>
          <span class="icon">🎨</span>
          <span class="label">Design</span>
          @if (selected() === 'option1') {
            <span class="check">✓</span>
          }
        </div>

        <div class="card-button" (click)="selected.set('option2')" ngpButton>
          <span class="icon">💻</span>
          <span class="label">Develop</span>
          @if (selected() === 'option2') {
            <span class="check">✓</span>
          }
        </div>

        <div class="card-button" [disabled]="true" (click)="selected.set('option3')" ngpButton>
          <span class="icon">🚀</span>
          <span class="label">Deploy</span>
          <span class="badge">Coming Soon</span>
        </div>
      </div>

      <p class="result">Selected: {{ selected() || 'None' }}</p>
    </div>
  `,
  styles: `
    .demo {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      text-align: center;
    }

    .description {
      line-height: 1.5;
    }

    .result {
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      margin: 0;
    }

    .buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .card-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem 2rem;
      border-radius: 0.75rem;
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      cursor: pointer;
      transition: all 200ms ease;
      position: relative;
    }

    .card-button[data-hover] {
      background-color: var(--ngp-background-hover);
      border-color: var(--ngp-border-hover, var(--ngp-border));
      transform: translateY(-2px);
    }

    .card-button[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .card-button[data-press] {
      background-color: var(--ngp-background-active);
      transform: translateY(0);
    }

    .card-button[data-disabled] {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .icon {
      font-size: 2rem;
    }

    .label {
      font-weight: 500;
      color: var(--ngp-text-primary);
    }

    .check {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      color: var(--ngp-success, #22c55e);
      font-weight: bold;
    }

    .badge {
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
      background-color: var(--ngp-background-active);
      border-radius: 0.25rem;
      color: var(--ngp-text-secondary);
    }
  `,
})
export default class focusableNonNativeExample {
  selected = signal<string | null>(null);
}
