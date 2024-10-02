import { Component, signal } from '@angular/core';
import { NgpRadioGroup, NgpRadioIndicator, NgpRadioItem } from 'ng-primitives/radio';

@Component({
  standalone: true,
  selector: 'app-radio',
  imports: [NgpRadioGroup, NgpRadioItem, NgpRadioIndicator],
  styles: `
    :host {
      --radio-item-background-color: rgb(255 255 255);
      --radio-item-hover-background-color: rgb(250 250 250);
      --radio-item-pressed-background-color: rgb(245 245 245);
      --radio-item-checked-background-color: rgb(10 10 10);

      --radio-item-background-color-dark: rgb(39 39 42);
      --radio-item-hover-background-color-dark: rgb(49, 49, 54);
      --radio-item-pressed-background-color-dark: rgb(68, 68, 68);
      --radio-item-checked-background-color-dark: rgb(68, 68, 68);
    }

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
      background-color: light-dark(
        var(--radio-item-background-color),
        var(--radio-item-background-color-dark)
      );
      padding: 0.75rem 1rem;
      box-shadow:
        0 1px 3px 0 light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1)),
        0 1px 2px -1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05));
      outline: none;
    }

    [ngpRadioItem][data-hover] {
      background-color: light-dark(
        var(--radio-item-hover-background-color),
        var(--radio-item-hover-background-color-dark)
      );
    }

    [ngpRadioItem][data-focus-visible] {
      box-shadow:
        0 0 0 2px light-dark(#f5f5f5, #3f3f46),
        0 0 0 4px rgb(59 130 246 / 50%);
    }

    [ngpRadioItem][data-press] {
      background-color: light-dark(
        var(--radio-item-pressed-background-color),
        var(--radio-item-pressed-background-color-dark)
      );
    }

    [ngpRadioItem][data-checked] {
      background-color: light-dark(
        var(--radio-item-checked-background-color),
        var(--radio-item-checked-background-color-dark)
      );
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
      box-shadow: 0 0 0 1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
    }

    [ngpRadioItem][data-checked] [ngpRadioIndicator] {
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 1);
    }

    .indicator-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      background-color: light-dark(white, transparent);
    }

    [ngpRadioItem][data-checked] .indicator-dot {
      background-color: white;
    }

    .title {
      grid-column-start: 2;
      grid-row-start: 1;
      font-weight: 500;
      color: light-dark(rgb(10 10 10), rgb(169, 169, 169));
      margin: 0;
    }

    [ngpRadioItem][data-checked] .title {
      color: white;
    }

    .description {
      grid-column-start: 2;
      grid-row-start: 2;
      font-size: 0.75rem;
      color: light-dark(rgb(82 82 82), rgb(138, 138, 138));
      line-height: 1rem;
      margin: 0;
    }

    [ngpRadioItem][data-checked] .description {
      color: light-dark(rgb(212 212 212), rgb(169, 169, 169));
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
