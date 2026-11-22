import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgpDrawerBackdrop } from './backdrop/drawer-backdrop';
import { NgpDrawerClose } from './close/drawer-close';
import { NgpDrawerContent } from './content/drawer-content';
import { NgpDrawerDescription } from './description/drawer-description';
import { NgpDrawer } from './drawer/drawer';
import { createDrawerHandle, NgpDrawerHandle } from './handle/drawer-handle';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerSwipeArea } from './swipe-area/drawer-swipe-area';
import { NgpDrawerSwipeIgnore } from './swipe-ignore/drawer-swipe-ignore';
import { NgpDrawerTitle } from './title/drawer-title';
import { NgpDrawerTrigger } from './trigger/drawer-trigger';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

@Component({
  imports: [
    NgpDrawerClose,
    NgpDrawerContent,
    NgpDrawerDescription,
    NgpDrawer,
    NgpDrawerSwipeIgnore,
    NgpDrawerTitle,
    NgpDrawerTrigger,
  ],
  template: `
    <button [ngpDrawerHandle]="handle" [ngpDrawerPayload]="{ detached: true }" ngpDrawerTrigger>
      Detached
    </button>
    <ng-container [handle]="handle" ngpDrawer>
      <button [ngpDrawerPayload]="{ id: 2 }" ngpDrawerTrigger>Open</button>
      <div ngpDrawerTrigger role="button" tabindex="0">
        Open non-native
        <input data-test-nested-input />
      </div>
      <h2 ngpDrawerTitle>Title</h2>
      <p ngpDrawerDescription>Description</p>
      <div ngpDrawerContent><span ngpDrawerSwipeIgnore>Content</span></div>
      <button ngpDrawerClose>Close</button>
    </ng-container>
  `,
})
class PartsHost {
  readonly handle: NgpDrawerHandle<unknown> = createDrawerHandle();
  readonly root = viewChild.required(NgpDrawer);
}

describe('Drawer semantic parts', () => {
  let fixture: ComponentFixture<PartsHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PartsHost] }).compileComponents();
    fixture = TestBed.createComponent(PartsHost);
    fixture.detectChanges();
  });

  it('opens from in-tree and detached triggers with payload and ARIA state', () => {
    const triggers = fixture.debugElement.queryAll(By.directive(NgpDrawerTrigger));
    const detached = triggers[0].nativeElement as HTMLButtonElement;
    const inTree = triggers[1].nativeElement as HTMLButtonElement;

    expect(detached.type).toBe('button');
    expect(inTree.getAttribute('aria-expanded')).toBe('false');
    inTree.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(fixture.componentInstance.root().payload()).toEqual({ id: 2 });
    expect(inTree.getAttribute('aria-expanded')).toBe('true');

    fixture.componentInstance.root().hide();
    detached.click();
    expect(fixture.componentInstance.root().payload()).toEqual({ detached: true });
  });

  it('publishes the trigger id through triggerIdChange when an in-tree trigger opens', () => {
    const root = fixture.componentInstance.root();
    const inTree = fixture.debugElement.queryAll(By.directive(NgpDrawerTrigger))[1]
      .nativeElement as HTMLButtonElement;
    const emitted: (string | null)[] = [];
    root.triggerIdChange.subscribe(triggerId => emitted.push(triggerId));

    inTree.click();
    fixture.detectChanges();

    expect(root.triggerId()).toBe(inTree.id);
    expect(emitted).toEqual([inTree.id]);
  });

  it('leaves the trigger id untouched when an in-tree trigger open is canceled', () => {
    const root = fixture.componentInstance.root();
    const inTree = fixture.debugElement.queryAll(By.directive(NgpDrawerTrigger))[1]
      .nativeElement as HTMLButtonElement;
    const emitted: (string | null)[] = [];
    root.triggerIdChange.subscribe(triggerId => emitted.push(triggerId));
    root.beforeOpenChange.subscribe(event => event.cancel());

    inTree.click();
    fixture.detectChanges();

    expect(root.open()).toBe(false);
    expect(root.triggerId()).toBeNull();
    expect(emitted).toEqual([]);
  });

  it('activates non-native triggers once from keyboard', () => {
    const nonNative = fixture.debugElement.queryAll(By.directive(NgpDrawerTrigger))[2]
      .nativeElement as HTMLDivElement;
    nonNative.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('ignores Enter and Space from controls nested in a non-native trigger', () => {
    const input = fixture.nativeElement.querySelector('[data-test-nested-input]') as HTMLElement;
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      input.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('closes with close-press and preserves content/ignore markers', () => {
    const reasons: string[] = [];
    fixture.componentInstance
      .root()
      .beforeOpenChange.subscribe(event => reasons.push(event.reason));
    fixture.componentInstance.root().show();

    fixture.debugElement.query(By.directive(NgpDrawerClose)).nativeElement.click();

    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(reasons.at(-1)).toBe('close-press');
    const content = fixture.debugElement.query(By.directive(NgpDrawerContent))
      .nativeElement as HTMLElement;
    const ignore = fixture.debugElement.query(By.directive(NgpDrawerSwipeIgnore))
      .nativeElement as HTMLElement;
    expect(content.hasAttribute('data-drawer-content')).toBe(true);
    expect(content.hasAttribute('data-ngp-drawer-swipe-ignore')).toBe(false);
    expect(ignore.hasAttribute('data-ngp-drawer-swipe-ignore')).toBe(true);
  });
});

@Component({
  imports: [NgpDrawer, NgpDrawerDescription, NgpDrawerPopup, NgpDrawerTitle],
  template: `
    <ng-container ngpDrawer>
      <section ngpDrawerPopup>
        <h2 [id]="titleId()" ngpDrawerTitle>Title</h2>
        <p ngpDrawerDescription>Description</p>
      </section>
    </ng-container>
  `,
})
class LabellingHost {
  readonly titleId = signal('custom-title');
}

describe('Drawer title and description registration', () => {
  it('labels the popup with the dynamic title and generated description IDs', async () => {
    await TestBed.configureTestingModule({ imports: [LabellingHost] }).compileComponents();
    const fixture = TestBed.createComponent(LabellingHost);
    fixture.detectChanges();

    const popup = fixture.debugElement.query(By.directive(NgpDrawerPopup))
      .nativeElement as HTMLElement;
    const description = fixture.debugElement.query(By.directive(NgpDrawerDescription))
      .nativeElement as HTMLElement;
    expect(popup.getAttribute('aria-labelledby')).toBe('custom-title');
    expect(description.id).toMatch(/^ngp-drawer-description-/);
    expect(popup.getAttribute('aria-describedby')).toBe(description.id);

    fixture.componentInstance.titleId.set('changed-title');
    fixture.detectChanges();
    expect(popup.getAttribute('aria-labelledby')).toBe('changed-title');
  });
});

@Component({
  imports: [
    NgpDrawerBackdrop,
    NgpDrawerClose,
    NgpDrawerPopup,
    NgpDrawer,
    NgpDrawerSwipeArea,
    NgpDrawerTrigger,
    NgpDrawerViewport,
  ],
  template: `
    <ng-container [modal]="false" ngpDrawer>
      <button data-test-binding-trigger ngpDrawerTrigger>Open</button>
      <button data-test-binding-close ngpDrawerClose>Close</button>
      <div data-test-binding-backdrop ngpDrawerBackdrop></div>
      <div data-test-binding-viewport ngpDrawerViewport></div>
      <section data-test-binding-popup ngpDrawerPopup></section>
      <div data-test-binding-swipe-area ngpDrawerSwipeArea></div>
    </ng-container>
  `,
})
class BindingHost {
  readonly root = viewChild.required(NgpDrawer);
}

describe('Drawer host attribute writes', () => {
  it('skips settled no-op writes and updates only changed open attributes', async () => {
    await TestBed.configureTestingModule({ imports: [BindingHost] }).compileComponents();
    const bindingFixture = TestBed.createComponent(BindingHost);
    bindingFixture.detectChanges();
    await bindingFixture.whenStable();
    bindingFixture.detectChanges();

    const elements = {
      trigger: queryBindingElement(bindingFixture, 'trigger'),
      close: queryBindingElement(bindingFixture, 'close'),
      backdrop: queryBindingElement(bindingFixture, 'backdrop'),
      viewport: queryBindingElement(bindingFixture, 'viewport'),
      popup: queryBindingElement(bindingFixture, 'popup'),
      swipeArea: queryBindingElement(bindingFixture, 'swipe-area'),
    };
    const mutations = Object.fromEntries(
      Object.entries(elements).map(([name, element]) => [
        name,
        {
          set: vi.spyOn(element, 'setAttribute'),
          remove: vi.spyOn(element, 'removeAttribute'),
        },
      ]),
    );

    bindingFixture.detectChanges();
    bindingFixture.detectChanges();
    await bindingFixture.whenStable();
    expect(attributeNames(mutations)).toEqual({});

    bindingFixture.componentInstance.root().show();
    bindingFixture.detectChanges();
    await bindingFixture.whenStable();

    expect(attributeNames(mutations)).toEqual({
      backdrop: ['data-closed', 'data-open'],
      popup: ['data-closed', 'data-open'],
      swipeArea: ['data-closed', 'data-open'],
      trigger: ['aria-expanded', 'data-closed', 'data-open'],
      viewport: ['data-closed', 'data-open'],
    });
    bindingFixture.destroy();
  });
});

@Component({
  imports: [NgpDrawerContent],
  template: `
    <div ngpDrawerContent></div>
  `,
})
class InvalidContentHost {}

describe('Drawer part validation', () => {
  it('throws a focused error outside Root', async () => {
    await TestBed.configureTestingModule({ imports: [InvalidContentHost] }).compileComponents();
    expect(() => TestBed.createComponent(InvalidContentHost)).toThrowError(
      /ngpDrawerContent must be used inside/,
    );
  });
});

function queryBindingElement(fixture: ComponentFixture<BindingHost>, name: string): HTMLElement {
  return fixture.nativeElement.querySelector(`[data-test-binding-${name}]`);
}

function attributeNames(
  mutations: Record<
    string,
    {
      set: ReturnType<typeof vi.spyOn>;
      remove: ReturnType<typeof vi.spyOn>;
    }
  >,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(mutations)
      .map(([name, spies]) => [
        name,
        [...spies.set.mock.calls, ...spies.remove.mock.calls]
          .map(([attribute]) => String(attribute))
          .filter(attribute => attribute.startsWith('aria-') || attribute.startsWith('data-'))
          .sort(),
      ])
      .filter(([, attributes]) => attributes.length > 0),
  );
}
