/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgpToggle } from './toggle.directive';

@Component({
  imports: [NgpToggle],
  template:
    '<button ngpToggle [ngpToggleSelected]="selected" [ngpToggleDisabled]="disabled" (ngpToggleSelectedChange)="onToggle($event)">Toggle</button>',
})
class TestComponent {
  selected: boolean = false;
  disabled: boolean = false;

  onToggle(selected: boolean) {
    this.selected = selected;
  }
}

describe('NgpToggle', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let button: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    button = fixture.debugElement.query(By.css('button'));
    fixture.detectChanges();
  });

  it('should initialize with default values', () => {
    expect(component.selected).toBe(false);
    expect(component.disabled).toBe(false);
  });

  it('should apply the correct aria-pressed attribute', () => {
    expect(button.nativeElement.getAttribute('aria-pressed')).toBe('false');
    component.selected = true;
    fixture.detectChanges();
    expect(button.nativeElement.getAttribute('aria-pressed')).toBe('true');
  });

  it('should apply the correct data-selected attribute', () => {
    expect(button.nativeElement.getAttribute('data-selected')).toBe('false');
    component.selected = true;
    fixture.detectChanges();
    expect(button.nativeElement.getAttribute('data-selected')).toBe('true');
  });

  it('should apply the correct data-disabled attribute', () => {
    expect(button.nativeElement.getAttribute('data-disabled')).toBe('false');
    component.disabled = true;
    fixture.detectChanges();
    expect(button.nativeElement.getAttribute('data-disabled')).toBe('true');
  });

  it('should toggle the pressed state on click', () => {
    expect(component.selected).toBe(false);
    button.nativeElement.click();
    expect(component.selected).toBe(true);
    button.nativeElement.click();
    expect(component.selected).toBe(false);
  });

  it('should not toggle the pressed state when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    expect(component.selected).toBe(false);
    button.nativeElement.click();
    expect(component.selected).toBe(false);
  });

  it('should emit the pressed state change event on toggle', () => {
    const spy = jest.spyOn(component, 'onToggle');
    button.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(true);
    button.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(false);
  });
});
