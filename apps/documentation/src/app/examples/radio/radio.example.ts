import { Component, signal } from '@angular/core';
import { NgpRadioGroup, NgpRadioIndicator, NgpRadioItem } from 'ng-primitives/radio';

@Component({
  standalone: true,
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
      border-radius: 0.5rem;
      background-color: white;
      padding: 0.75rem 1rem;
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
      outline: none;
    }

    [ngpRadioItem]:hover {
      background-color: rgb(250 250 250);
    }

    [ngpRadioItem]:focus-visible {
      box-shadow:
        0 0 0 2px #f5f5f5,
        0 0 0 4px rgb(59 130 246 / 50%);
    }

    [ngpRadioItem]:active {
      background-color: rgb(245 245 245);
    }

    [ngpRadioItem][data-state='checked'] {
      background-color: rgb(10 10 10);
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
      box-shadow: 0 0 0 1px rgb(0 0 0 / 0.1);
    }

    [ngpRadioItem][data-state='checked'] [ngpRadioIndicator] {
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5);
    }

    .indicator-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      background-color: white;
    }

    .title {
      grid-column-start: 2;
      grid-row-start: 1;
      font-weight: 500;
      color: rgb(10 10 10);
    }

    [ngpRadioItem][data-state='checked'] .title {
      color: white;
    }

    .description {
      grid-column-start: 2;
      grid-row-start: 2;
      font-size: 0.75rem;
      color: rgb(82 82 82);
      line-height: 1rem;
    }

    [ngpRadioItem][data-state='checked'] .description {
      color: rgb(212 212 212);
    }
  `,
  template: `
    <div [(ngpRadioGroupValue)]="plan" ngpRadioGroup>
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
