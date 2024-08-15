import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpDialog, NgpDialogPanel, NgpDialogTitle } from 'ng-primitives/dialog';

@Component({
  standalone: true,
  selector: 'app-dialog',
  imports: [NgpButton, NgpDialog, NgpDialogPanel, NgpDialogTitle],
  template: `
    <button ngpButton>Open Dialog</button>

    <div ngpDialog>
      <div class="dialog-backdrop">
        <div ngpDialogPanel>
          <div ngpDialogTitle>Delete blog post</div>
          <div>Are you sure you want to delete this post? This action cannot be undone.</div>

          <div class="dialog-footer">
            <button ngpButton>Cancel</button>
            <button ngpButton>Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class DialogExample {}
