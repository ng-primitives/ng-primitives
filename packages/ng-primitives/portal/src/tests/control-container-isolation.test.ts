import { Component, Directive, inject } from '@angular/core';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { render } from '@testing-library/angular';
import { provideControlContainerIsolation } from 'ng-primitives/portal';
import { describe, expect, it } from 'vitest';

@Directive({ selector: '[testReadContainer]', exportAs: 'testReadContainer' })
class ReadContainerDirective {
  readonly container = inject(ControlContainer, { optional: true });
}

@Component({
  selector: 'test-isolated',
  imports: [ReadContainerDirective, ReactiveFormsModule],
  providers: [provideControlContainerIsolation()],
  template: `
    <span #isolated="testReadContainer" testReadContainer></span>
    <form [formGroup]="innerForm">
      <span #inner="testReadContainer" testReadContainer></span>
    </form>
  `,
})
class IsolatedComponent {
  readonly innerForm = new FormGroup({});
}

@Component({
  imports: [IsolatedComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="outerForm">
      <test-isolated />
    </form>
  `,
})
class HostComponent {
  readonly outerForm = new FormGroup({});
}

describe('provideControlContainerIsolation', () => {
  it('hides an enclosing form from descendants while a form declared inside still wins', async () => {
    const { fixture } = await render(HostComponent);
    const host = fixture.componentInstance;
    const readers = fixture.debugElement
      .queryAll(el => el.injector.get(ReadContainerDirective, null) !== null)
      .map(el => el.injector.get(ReadContainerDirective));

    const [isolated, inner] = readers;

    expect(isolated.container).toBeNull();
    expect(inner.container?.control).toBe(
      fixture.debugElement.query(el => el.componentInstance instanceof IsolatedComponent)
        .componentInstance.innerForm,
    );
    expect(inner.container?.control).not.toBe(host.outerForm);
  });
});
