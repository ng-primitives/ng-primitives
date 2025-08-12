import { Component, signal } from '@angular/core';
import {
  NgpMeter,
  NgpMeterIndicator,
  NgpMeterLabel,
  NgpMeterTrack,
  NgpMeterValue,
} from 'ng-primitives/meter';

@Component({
  selector: 'app-meter',
  imports: [NgpMeter, NgpMeterLabel, NgpMeterValue, NgpMeterIndicator, NgpMeterTrack],
  template: `
    <div
      class="box-border grid w-[200px] grid-cols-2 gap-y-2 p-2"
      [ngpMeterValue]="value()"
      ngpMeter
    >
      <span class="text-sm font-semibold leading-6 text-black dark:text-white" ngpMeterLabel>
        Label
      </span>
      <span
        class="col-start-2 text-end text-sm font-medium leading-6 text-slate-500 dark:text-white"
        ngpMeterValue
      >
        {{ value() }}%
      </span>

      <div
        class="col-span-2 h-2 overflow-hidden rounded bg-white ring-1 ring-inset ring-slate-200 dark:bg-transparent dark:ring-zinc-700"
        ngpMeterTrack
      >
        <div
          class="h-full rounded bg-lime-400 transition-[width] duration-200 ease-in-out"
          ngpMeterIndicator
        ></div>
      </div>
    </div>
  `,
})
export default class MeterExample {
  /** The value of the meter. */
  value = signal(30);
}
