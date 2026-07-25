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
      <span class="text-[14px] font-[590] text-black dark:text-white" ngpMeterLabel>Label</span>
      <span
        class="col-start-2 text-end text-[14px] font-[510] text-zinc-600 dark:text-zinc-300"
        ngpMeterValue
      >
        {{ value() }}%
      </span>

      <div
        class="col-span-2 h-2 overflow-hidden rounded-sm bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] dark:bg-zinc-950 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
        ngpMeterTrack
      >
        <div
          class="h-full rounded-sm bg-[#f01e2b] transition-[width] duration-200 ease-in-out dark:bg-[#ff4651]"
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
