import { Component, inject } from '@angular/core';
import { render } from '@testing-library/angular';
import { NgpTextarea } from 'ng-primitives/textarea';
import { describe, expect, it } from 'vitest';

@Component({
  selector: 'textarea[app-textarea]',
  hostDirectives: [{ directive: NgpTextarea, inputs: ['id', 'disabled'] }],
  template: '',
})
class ComposedTextarea {
  private readonly textarea = inject(NgpTextarea);

  setDisabled(value: boolean): void {
    this.textarea.setDisabled(value);
  }
}

describe('NgpTextarea composition', () => {
  it('should disable and re-enable the textarea through setDisabled while the input stays false', async () => {
    const { container, fixture } = await render(`<textarea app-textarea></textarea>`, {
      imports: [ComposedTextarea],
    });
    const textarea = container.querySelector('textarea')!;
    const host = fixture.debugElement.children[0].injector.get(ComposedTextarea);

    host.setDisabled(true);
    await fixture.whenStable();

    expect(textarea).toHaveAttribute('disabled');
    expect(textarea).toHaveAttribute('data-disabled');

    host.setDisabled(false);
    await fixture.whenStable();

    expect(textarea).not.toHaveAttribute('disabled');
    expect(textarea).not.toHaveAttribute('data-disabled');
  });
});
