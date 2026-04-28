import { NumberInput } from '@angular/cdk/coercion';
import { Component, input, numberAttribute } from '@angular/core';
import {
  NgpMeter,
  NgpMeterIndicator,
  NgpMeterLabel,
  NgpMeterTrack,
  NgpMeterValue,
} from 'ng-primitives/meter';

@Component({
  selector: 'app-meter',
  hostDirectives: [
    { directive: NgpMeter, inputs: ['ngpMeterValue:value', 'ngpMeterMin:min', 'ngpMeterMax:max'] },
  ],
  imports: [NgpMeterIndicator, NgpMeterLabel, NgpMeterValue, NgpMeterTrack],
  template: `
    <span ngpMeterLabel>{{ label() }}</span>
    <span ngpMeterValue>{{ value() }}%</span>
    <div ngpMeterTrack>
      <div ngpMeterIndicator></div>
    </div>
  `,
})
export class MeterFixture {
  readonly value = input<number, NumberInput>(0, { transform: numberAttribute });
  readonly label = input.required<string>();
}
