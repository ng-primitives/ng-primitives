/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgpToggle } from './toggle.directive';

@Component({
  standalone: true,
  imports: [NgpToggle],
  template:
    '<button ngpToggle [ngpTogglePressed]="pressed" [ngpToggleDisabled]="disabled" (ngpTogglePressedChange)="onToggle($event)">Toggle</button>',
})
class TestComponent {
  pressed: boolean = false;
  disabled: boolean = false;

  onToggle(pressed: boolean) {
    this.pressed = pressed;
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

  it('should create an instance', () => {
    const directive = new NgpToggle();
    expect(directive).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.pressed).toBe(false);
    expect(component.disabled).toBe(false);
  });

  it('should apply the correct aria-pressed attribute', () => {
    expect(button.nativeElement.getAttribute('aria-pressed')).toBe('false');
    component.pressed = true;
    fixture.detectChanges();
    expect(button.nativeElement.getAttribute('aria-pressed')).toBe('true');
  });

  it('should apply the correct data-state attribute', () => {
    expect(button.nativeElement.getAttribute('data-state')).toBe('off');
    component.pressed = true;
    fixture.detectChanges();
    expect(button.nativeElement.getAttribute('data-state')).toBe('on');
  });

  it('should apply the correct data-disabled attribute', () => {
    expect(button.nativeElement.getAttribute('data-disabled')).toBe('false');
    component.disabled = true;
    fixture.detectChanges();
    expect(button.nativeElement.getAttribute('data-disabled')).toBe('true');
  });

  it('should toggle the pressed state on click', () => {
    expect(component.pressed).toBe(false);
    button.nativeElement.click();
    expect(component.pressed).toBe(true);
    button.nativeElement.click();
    expect(component.pressed).toBe(false);
  });

  it('should not toggle the pressed state when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    expect(component.pressed).toBe(false);
    button.nativeElement.click();
    expect(component.pressed).toBe(false);
  });

  it('should emit the pressed state change event on toggle', () => {
    const spy = jest.spyOn(component, 'onToggle');
    button.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(true);
    button.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(false);
  });
});
