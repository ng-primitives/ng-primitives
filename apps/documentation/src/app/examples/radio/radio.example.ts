import { Component, signal } from '@angular/core';
import { NgpRadioGroup, NgpRadioIndicator, NgpRadioItem } from 'ng-primitives/radio';

@Component({
  selector: 'app-radio',
  imports: [NgpRadioGroup, NgpRadioItem, NgpRadioIndicator],
  styles: `
    [ngpRadioGroup] {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
    }

    [ngpRadioItem] {
      display: grid;
      cursor: pointer;
      grid-template-columns: auto 1fr;
      grid-template-rows: repeat(2, auto);
      column-gap: 0.625rem;
      row-gap: 0.125rem;
      border-radius: 0.625rem;
      background-color: var(--ngp-background);
      padding: 0.75rem 1rem;
      box-shadow: var(--ngp-button-shadow);
      outline: none;
      transition: box-shadow 0.16s ease;
    }

    [ngpRadioItem][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpRadioItem][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpRadioItem][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpRadioItem][data-checked] {
      box-shadow:
        var(--ngp-button-shadow),
        inset 0 0 0 1.5px var(--ngp-primary);
    }

    [ngpRadioIndicator] {
      display: inline-flex;
      grid-column-start: 1;
      grid-row-start: 1;
      justify-content: center;
      align-items: center;
      align-self: center;
      border-radius: 9999px;
      width: 1rem;
      height: 1rem;
      border: 1px solid var(--ngp-border);
    }

    .indicator-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      background-color: var(--ngp-primary);
      transform: scale(0);
      transition: transform 0.16s cubic-bezier(0.2, 0.8, 0.3, 1.2);
    }

    [ngpRadioItem][data-checked] [ngpRadioIndicator] {
      border-color: var(--ngp-primary);
    }

    [ngpRadioItem][data-checked] .indicator-dot {
      transform: scale(1);
    }

    .title {
      grid-column-start: 2;
      grid-row-start: 1;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      margin: 0;
    }

    .description {
      grid-column-start: 2;
      grid-row-start: 2;
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
      line-height: 1rem;
      letter-spacing: -0.006em;
      margin: 0;
    }
  `,
  template: `
    <div [(ngpRadioGroupValue)]="plan" ngpRadioGroup ngpRadioGroupOrientation="vertical">
      <div ngpRadioItem ngpRadioItemValue="indie">
        <div ngpRadioIndicator>
          <span class="indicator-dot"></span>
        </div>

        <p class="title">Indie Plan</p>
        <p class="description">For those who want to are just starting out</p>
      </div>

      <div ngpRadioItem ngpRadioItemValue="growth">
        <div ngpRadioIndicator>
          <span class="indicator-dot"></span>
        </div>

        <p class="title">Growth Plan</p>
        <p class="description">For those who want to grow their business</p>
      </div>

      <div ngpRadioItem ngpRadioItemValue="unicorn">
        <div ngpRadioIndicator>
          <span class="indicator-dot"></span>
        </div>

        <p class="title">Unicorn Plan</p>
        <p class="description">For those who are going to the moon</p>
      </div>
    </div>
  `,
})
export default class RadioExample {
  /**
   * Store the selected plan.
   */
  readonly plan = signal<Plan>('indie');
}

type Plan = 'indie' | 'growth' | 'unicorn';
