import { Component } from '@angular/core';
import {
  NgpDatePicker,
  NgpDatePickerCell,
  NgpDatePickerDateButton,
  NgpDatePickerGrid,
  NgpDatePickerLabel,
  NgpDatePickerNextMonth,
  NgpDatePickerPreviousMonth,
  NgpDatePickerRow,
} from 'ng-primitives/date-picker';

@Component({
  standalone: true,
  selector: 'app-date-picker',
  imports: [
    NgpDatePicker,
    NgpDatePickerLabel,
    NgpDatePickerNextMonth,
    NgpDatePickerPreviousMonth,
    NgpDatePickerGrid,
    NgpDatePickerRow,
    NgpDatePickerCell,
    NgpDatePickerCell,
    NgpDatePickerDateButton,
  ],
  template: `
    <div ngpDatePicker>
      <div>
        <button ngpDatePickerPreviousMonth type="button" aria-label="previous month">&lt;</button>
        <h2 ngpDatePickerLabel>February 2020</h2>
        <button ngpDatePickerNextMonth type="button" aria-label="next month">&gt;</button>
      </div>
      <table ngpDatePickerGrid aria-labelledby="id-grid-label">
        <thead>
          <tr>
            <th scope="col" abbr="Sunday">Su</th>
            <th scope="col" abbr="Monday">Mo</th>
            <th scope="col" abbr="Tuesday">Tu</th>
            <th scope="col" abbr="Wednesday">We</th>
            <th scope="col" abbr="Thursday">Th</th>
            <th scope="col" abbr="Friday">Fr</th>
            <th scope="col" abbr="Saturday">Sa</th>
          </tr>
        </thead>
        <tbody>
          <!-- <tr>
            <td class="disabled" tabindex="-1"></td>
            <td class="disabled" tabindex="-1"></td>
            <td class="disabled" tabindex="-1"></td>
            <td class="disabled" tabindex="-1"></td>
            <td class="disabled" tabindex="-1"></td>
            <td class="disabled" tabindex="-1"></td>
            <td tabindex="-1" data-date="2020-02-01">1</td>
          </tr> -->
          <tr *ngpDatePickerRow>
            <td *ngpDatePickerCell="let date" role="gridcell">
              <button ngpDatePickerDateButton>{{ date.getDate() }}</button>
            </td>
            <!-- <td tabindex="-1" data-date="2020-02-03">3</td>
            <td tabindex="-1" data-date="2020-02-04">4</td>
            <td tabindex="-1" data-date="2020-02-05">5</td>
            <td tabindex="-1" data-date="2020-02-06">6</td>
            <td tabindex="-1" data-date="2020-02-07">7</td>
            <td tabindex="-1" data-date="2020-02-08">8</td> -->
          </tr>
          <!-- <tr>
            <td tabindex="-1" data-date="2020-02-09">9</td>
            <td tabindex="-1" data-date="2020-02-10">10</td>
            <td tabindex="-1" data-date="2020-02-11">11</td>
            <td tabindex="-1" data-date="2020-02-12">12</td>
            <td tabindex="-1" data-date="2020-02-13">13</td>
            <td tabindex="0" data-date="2020-02-14" role="gridcell" aria-selected="true">14</td>
            <td tabindex="-1" data-date="2020-02-15">15</td>
          </tr>
          <tr>
            <td tabindex="-1" data-date="2020-02-16">16</td>
            <td tabindex="-1" data-date="2020-02-17">17</td>
            <td tabindex="-1" data-date="2020-02-18">18</td>
            <td tabindex="-1" data-date="2020-02-19">19</td>
            <td tabindex="-1" data-date="2020-02-20">20</td>
            <td tabindex="-1" data-date="2020-02-21">21</td>
            <td tabindex="-1" data-date="2020-02-22">22</td>
          </tr>
          <tr>
            <td tabindex="-1" data-date="2020-02-23">23</td>
            <td tabindex="-1" data-date="2020-02-24">24</td>
            <td tabindex="-1" data-date="2020-02-25">25</td>
            <td tabindex="-1" data-date="2020-02-26">26</td>
            <td tabindex="-1" data-date="2020-02-27">27</td>
            <td tabindex="-1" data-date="2020-02-28">28</td>
            <td tabindex="-1" data-date="2020-02-29">29</td>
          </tr>
          <tr>
            <td tabindex="-1" data-date="2020-02-30">30</td>
            <td tabindex="-1" data-date="2020-02-31">31</td>
            <td class="disabled" tabindex="-1"></td>
            <td class="disabled" tabindex="-1"></td>
            <td class="disabled" tabindex="-1"></td>
            <td class="disabled" tabindex="-1"></td>
            <td class="disabled" tabindex="-1"></td>
          </tr> -->
        </tbody>
      </table>
    </div>
  `,
})
export default class DatePickerExample {}
