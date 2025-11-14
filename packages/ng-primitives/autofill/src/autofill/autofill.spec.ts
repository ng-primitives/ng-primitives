import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fireEvent } from '@testing-library/angular';
import { NgpAutofill } from './autofill';

// Mock AnimationEvent for Jest environment
class MockAnimationEvent extends Event {
  constructor(
    type: string,
    public readonly animationName: string,
  ) {
    super(type);
  }
}

// Make AnimationEvent available globally in Jest
(global as any).AnimationEvent = MockAnimationEvent;

@Component({
  template: `
    <input #autofillRef="ngpAutofill" (ngpAutofill)="onAutofillChange($event)" ngpAutofill />
  `,
  imports: [NgpAutofill],
})
class TestComponent {
  autofillState = signal<boolean | null>(null);

  onAutofillChange(autofilled: boolean): void {
    this.autofillState.set(autofilled);
  }
}

describe('NgpAutofill', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    inputElement = fixture.nativeElement.querySelector('input');
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should initialise correctly', () => {
    expect(inputElement).toBeTruthy();
    expect(inputElement.hasAttribute('data-autofill')).toBe(false);
    expect(component.autofillState()).toBeNull();
  });

  it('should have the correct selector', () => {
    expect(inputElement.hasAttribute('ngpAutofill')).toBe(true);
  });

  it('should export as ngpAutofill', () => {
    const autofillRef = fixture.debugElement.children[0].references['autofillRef'];
    expect(autofillRef).toBeInstanceOf(NgpAutofill);
  });

  it('should emit autofillChange when autofill starts', () => {
    const animationEvent = new MockAnimationEvent('animationstart', 'ngp-autofill-start');

    fireEvent(inputElement, animationEvent);
    fixture.detectChanges();

    expect(component.autofillState()).toBe(true);
    expect(inputElement.hasAttribute('data-autofill')).toBe(true);
    expect(inputElement.getAttribute('data-autofill')).toBe('');
  });

  it('should emit autofillChange when autofill ends', () => {
    // First trigger autofill start
    const startEvent = new MockAnimationEvent('animationstart', 'ngp-autofill-start');
    fireEvent(inputElement, startEvent);
    fixture.detectChanges();

    expect(component.autofillState()).toBe(true);

    // Then trigger autofill end
    const endEvent = new MockAnimationEvent('animationstart', 'ngp-autofill-end');
    fireEvent(inputElement, endEvent);
    fixture.detectChanges();

    expect(component.autofillState()).toBe(false);
    expect(inputElement.hasAttribute('data-autofill')).toBe(false);
  });

  it('should not react to unrelated animation events', () => {
    const animationEvent = new MockAnimationEvent('animationstart', 'some-other-animation');

    fireEvent(inputElement, animationEvent);
    fixture.detectChanges();

    expect(component.autofillState()).toBeNull();
    expect(inputElement.hasAttribute('data-autofill')).toBe(false);
  });

  it('should handle multiple autofill state changes', () => {
    // Start autofill
    fireEvent(inputElement, new MockAnimationEvent('animationstart', 'ngp-autofill-start'));
    fixture.detectChanges();
    expect(component.autofillState()).toBe(true);

    // End autofill
    fireEvent(inputElement, new MockAnimationEvent('animationstart', 'ngp-autofill-end'));
    fixture.detectChanges();
    expect(component.autofillState()).toBe(false);

    // Start autofill again
    fireEvent(inputElement, new MockAnimationEvent('animationstart', 'ngp-autofill-start'));
    fixture.detectChanges();
    expect(component.autofillState()).toBe(true);
  });

  it('should work without output handler', async () => {
    @Component({
      template: '<input ngpAutofill />',
      imports: [NgpAutofill],
    })
    class SimpleComponent {}

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [SimpleComponent],
    }).compileComponents();

    const simpleFixture = TestBed.createComponent(SimpleComponent);
    const input = simpleFixture.nativeElement.querySelector('input');
    simpleFixture.detectChanges();

    expect(() => {
      fireEvent(input, new MockAnimationEvent('animationstart', 'ngp-autofill-start'));
    }).not.toThrow();
  });

  it('should inject autofill detection styles', () => {
    // Check if styles are injected in the document head
    const allStyles = document.querySelectorAll('style');
    const autofillStyles = Array.from(allStyles).find(
      style =>
        style.textContent?.includes('ngp-autofill-start') || style.dataset['id'] === 'ngp-autofill',
    );

    expect(autofillStyles).toBeTruthy();

    if (autofillStyles?.textContent) {
      expect(autofillStyles.textContent).toContain('@keyframes ngp-autofill-start');
      expect(autofillStyles.textContent).toContain('@keyframes ngp-autofill-end');
      expect(autofillStyles.textContent).toContain('[data-autofill]:-webkit-autofill');
      expect(autofillStyles.textContent).toContain('[data-autofill]:not(:-webkit-autofill)');
    }
  });
});
