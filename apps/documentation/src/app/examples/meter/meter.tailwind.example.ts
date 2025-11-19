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
      <span class="text-sm leading-6 font-semibold text-black dark:text-white" ngpMeterLabel>
        Label
      </span>
      <span
        class="col-start-2 text-end text-sm leading-6 font-medium text-slate-500 dark:text-white"
        ngpMeterValue
      >
        {{ value() }}%
      </span>

      <div
        class="col-span-2 h-2 overflow-hidden rounded-sm bg-white ring-1 ring-slate-200 ring-inset dark:bg-transparent dark:ring-zinc-700"
        ngpMeterTrack
      >
        <div
          class="h-full rounded-sm bg-lime-400 transition-[width] duration-200 ease-in-out"
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
