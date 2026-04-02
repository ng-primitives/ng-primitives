import { Component, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { controlledState, ControlledStateResult } from 'ng-primitives/state';
import { firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';

@Component({ template: '', standalone: true })
class NoopComponent {}

function createControlledState<T>(
  ...args: Parameters<typeof controlledState<T>>
): ControlledStateResult<T> {
  const fixture = TestBed.createComponent(NoopComponent);
  const injector = fixture.componentRef.injector;
  return runInInjectionContext(injector, () => controlledState<T>(...args));
}

describe('controlledState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  describe('initialization', () => {
    it('should use the defaultValue when value is undefined', () => {
      const result = createControlledState<boolean>({
        value: signal(undefined),
        defaultValue: signal(true),
      });
      expect(result.value()).toBe(true);
    });

    it('should use the controlled value when defined', () => {
      const result = createControlledState<boolean>({
        value: signal(false),
        defaultValue: signal(true),
      });
      expect(result.value()).toBe(false);
    });

    it('should handle value being undefined with no defaultValue', () => {
      const result = createControlledState<boolean>({
        value: signal(undefined),
      });
      expect(result.value()).toBeUndefined();
    });

    it('should handle non-boolean types', () => {
      const result = createControlledState<string>({
        value: signal(undefined),
        defaultValue: signal('hello'),
      });
      expect(result.value()).toBe('hello');
    });

    it('should handle numeric types including zero', () => {
      const result = createControlledState<number>({
        value: signal(0),
        defaultValue: signal(42),
      });
      expect(result.value()).toBe(0);
    });

    it('should handle null as a valid controlled value', () => {
      const result = createControlledState<string | null>({
        value: signal<string | null | undefined>(null),
        defaultValue: signal<string | null>('fallback'),
      });
      expect(result.value()).toBeNull();
    });

    it('should handle empty string as a valid controlled value', () => {
      const result = createControlledState<string>({
        value: signal<string | undefined>(''),
        defaultValue: signal('fallback'),
      });
      expect(result.value()).toBe('');
    });

    it('should handle false as a valid controlled value', () => {
      const result = createControlledState<boolean>({
        value: signal<boolean | undefined>(false),
        defaultValue: signal(true),
      });
      expect(result.value()).toBe(false);
    });
  });

  describe('uncontrolled mode (value is undefined)', () => {
    it('should update value when set is called', () => {
      const result = createControlledState<boolean>({
        value: signal(undefined),
        defaultValue: signal(false),
      });

      result.set(true);
      expect(result.value()).toBe(true);
    });

    it('should allow toggling back and forth', () => {
      const result = createControlledState<boolean>({
        value: signal(undefined),
        defaultValue: signal(false),
      });

      result.set(true);
      expect(result.value()).toBe(true);

      result.set(false);
      expect(result.value()).toBe(false);

      result.set(true);
      expect(result.value()).toBe(true);
    });

    it('should not reset when defaultValue changes after user interaction', () => {
      const defaultValue = signal(true);
      const result = createControlledState<boolean>({
        value: signal(undefined),
        defaultValue,
      });

      expect(result.value()).toBe(true);

      // User sets a value
      result.set(false);
      expect(result.value()).toBe(false);

      // defaultValue changes — should NOT override user's value
      defaultValue.set(true);
      expect(result.value()).toBe(false);
    });

    it('should not reset when defaultValue changes to a different value after user interaction', () => {
      const defaultValue = signal('a');
      const result = createControlledState<string>({
        value: signal(undefined),
        defaultValue,
      });

      expect(result.value()).toBe('a');

      result.set('user-value');
      expect(result.value()).toBe('user-value');

      defaultValue.set('b');
      expect(result.value()).toBe('user-value');

      defaultValue.set('c');
      expect(result.value()).toBe('user-value');
    });

    it('should use initial defaultValue before any user interaction', () => {
      const defaultValue = signal(10);
      const result = createControlledState<number>({
        value: signal(undefined),
        defaultValue,
      });
      expect(result.value()).toBe(10);
    });

    it('should work with complex object types', () => {
      const result = createControlledState<{ x: number; y: number }>({
        value: signal(undefined),
        defaultValue: signal({ x: 0, y: 0 }),
      });

      const newValue = { x: 10, y: 20 };
      result.set(newValue);
      expect(result.value()).toEqual(newValue);
    });

    it('should work with array types', () => {
      const result = createControlledState<string[]>({
        value: signal(undefined),
        defaultValue: signal<string[]>([]),
      });

      result.set(['a', 'b']);
      expect(result.value()).toEqual(['a', 'b']);
    });
  });

  describe('controlled mode (value is defined)', () => {
    it('should always reflect the controlled value', () => {
      const value = signal<boolean | undefined>(true);
      const result = createControlledState<boolean>({
        value,
        defaultValue: signal(false),
      });

      expect(result.value()).toBe(true);

      value.set(false);
      expect(result.value()).toBe(false);

      value.set(true);
      expect(result.value()).toBe(true);
    });

    it('should not allow set to change the resolved value', () => {
      const value = signal<boolean | undefined>(false);
      const result = createControlledState<boolean>({
        value,
        defaultValue: signal(false),
      });

      // In controlled mode, set should not change the resolved value
      result.set(true);
      expect(result.value()).toBe(false); // controlled value wins
    });

    it('should remain controlled once value has been defined, even if it later becomes undefined', () => {
      const value = signal<boolean | undefined>(true);
      const result = createControlledState<boolean>({
        value,
        defaultValue: signal(false),
      });

      expect(result.value()).toBe(true);

      // Value becomes undefined — still controlled, set() should not update internal
      value.set(undefined);

      result.set(true);
      // onChange fires but internal state is not updated
      expect(result.value()).not.toBe(true);
    });

    it('should become permanently controlled when value transitions from undefined to defined', () => {
      const value = signal<string | undefined>(undefined);
      const onChange = jest.fn();
      const result = createControlledState<string>({
        value,
        defaultValue: signal('default'),
        onChange,
      });

      expect(result.value()).toBe('default');

      result.set('user'); // uncontrolled update
      expect(result.value()).toBe('user');

      value.set('controlled'); // now permanently controlled
      expect(result.value()).toBe('controlled');

      // Even if value goes back to undefined, set() still fires onChange but doesn't update internal
      value.set(undefined);
      onChange.mockClear();
      result.set('attempted');
      expect(onChange).toHaveBeenCalledWith('attempted');
      expect(result.value()).toBe('user'); // still the old internal, not 'attempted'
    });
  });

  describe('onChange callback', () => {
    it('should call onChange when set is called', () => {
      const onChange = jest.fn();
      const result = createControlledState<boolean>({
        value: signal(undefined),
        defaultValue: signal(false),
        onChange,
      });

      result.set(true);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with the new value each time set is called', () => {
      const onChange = jest.fn();
      const result = createControlledState<boolean>({
        value: signal(undefined),
        defaultValue: signal(false),
        onChange,
      });

      result.set(true);
      result.set(false);
      result.set(true);

      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenNthCalledWith(1, true);
      expect(onChange).toHaveBeenNthCalledWith(2, false);
      expect(onChange).toHaveBeenNthCalledWith(3, true);
    });

    it('should call onChange in controlled mode so the parent can respond', () => {
      const onChange = jest.fn();
      const value = signal<boolean | undefined>(false);
      const result = createControlledState<boolean>({
        value,
        onChange,
      });

      result.set(true);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should not call onChange when controlled value changes externally', () => {
      const onChange = jest.fn();
      const value = signal<boolean | undefined>(false);
      createControlledState<boolean>({
        value,
        onChange,
      });

      value.set(true);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not call onChange when defaultValue changes', () => {
      const onChange = jest.fn();
      const defaultValue = signal(false);
      createControlledState<boolean>({
        value: signal(undefined),
        defaultValue,
        onChange,
      });

      defaultValue.set(true);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should work without an onChange callback', () => {
      const result = createControlledState<boolean>({
        value: signal(undefined),
        defaultValue: signal(false),
      });
      expect(() => result.set(true)).not.toThrow();
    });

    it('should call onChange with complex types', () => {
      const onChange = jest.fn();
      const result = createControlledState<{ id: number }>({
        value: signal(undefined),
        defaultValue: signal({ id: 0 }),
        onChange,
      });

      const newValue = { id: 42 };
      result.set(newValue);
      expect(onChange).toHaveBeenCalledWith(newValue);
    });
  });

  describe('change observable', () => {
    it('should emit when set is called', async () => {
      const result = createControlledState<boolean>({
        value: signal(undefined),
        defaultValue: signal(false),
      });

      const promise = firstValueFrom(result.change);
      result.set(true);

      expect(await promise).toBe(true);
    });

    it('should emit multiple values', async () => {
      const result = createControlledState<boolean>({
        value: signal(undefined),
        defaultValue: signal(false),
      });

      const promise = firstValueFrom(result.change.pipe(take(3), toArray()));
      result.set(true);
      result.set(false);
      result.set(true);

      expect(await promise).toEqual([true, false, true]);
    });

    it('should emit in controlled mode so the parent can respond', async () => {
      const value = signal<boolean | undefined>(false);
      const result = createControlledState<boolean>({ value });

      const promise = firstValueFrom(result.change);
      result.set(true);

      expect(await promise).toBe(true);
    });

    it('should not emit when controlled value changes externally', () => {
      const spy = jest.fn();
      const value = signal<boolean | undefined>(false);
      const result = createControlledState<boolean>({ value });

      result.change.subscribe(spy);
      value.set(true);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit when defaultValue changes', () => {
      const spy = jest.fn();
      const defaultValue = signal(false);
      const result = createControlledState<boolean>({
        value: signal(undefined),
        defaultValue,
      });

      result.change.subscribe(spy);
      defaultValue.set(true);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('priority and precedence', () => {
    it('should follow precedence: controlled > internal (user set) > defaultValue', () => {
      const value = signal<boolean | undefined>(undefined);
      const defaultValue = signal(true);
      const result = createControlledState<boolean>({
        value,
        defaultValue,
      });

      // defaultValue wins when value is undefined
      expect(result.value()).toBe(true);

      // user set wins over defaultValue
      result.set(false);
      expect(result.value()).toBe(false);

      // controlled wins over everything — and once controlled, always controlled
      value.set(true);
      expect(result.value()).toBe(true);
    });

    it('should treat null controlled value as a defined value (not fallback to default)', () => {
      const result = createControlledState<string | null>({
        value: signal<string | null | undefined>(null),
        defaultValue: signal<string | null>('default'),
      });

      expect(result.value()).toBeNull();
    });

    it('should treat false controlled value as a defined value', () => {
      const result = createControlledState<boolean>({
        value: signal<boolean | undefined>(false),
        defaultValue: signal(true),
      });

      expect(result.value()).toBe(false);
    });

    it('should treat 0 controlled value as a defined value', () => {
      const result = createControlledState<number>({
        value: signal<number | undefined>(0),
        defaultValue: signal(42),
      });

      expect(result.value()).toBe(0);
    });

    it('should treat empty string controlled value as a defined value', () => {
      const result = createControlledState<string>({
        value: signal<string | undefined>(''),
        defaultValue: signal('default'),
      });

      expect(result.value()).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should not fire onChange when set is called with the same value', () => {
      const onChange = jest.fn();
      const result = createControlledState<boolean>({
        value: signal(undefined),
        defaultValue: signal(false),
        onChange,
      });

      result.set(true);
      result.set(true);

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid successive set calls', () => {
      const onChange = jest.fn();
      const result = createControlledState<number>({
        value: signal(undefined),
        defaultValue: signal(0),
        onChange,
      });

      for (let i = 1; i <= 100; i++) {
        result.set(i);
      }

      expect(result.value()).toBe(100);
      expect(onChange).toHaveBeenCalledTimes(100);
    });

    it('should handle set being called with undefined in a nullable type', () => {
      const onChange = jest.fn();
      const result = createControlledState<string | undefined>({
        value: signal<string | undefined | undefined>(undefined),
        defaultValue: signal<string | undefined>('default'),
        onChange,
      });

      result.set(undefined);
      expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('should handle controlled value signal updating multiple times', () => {
      const value = signal<boolean | undefined>(true);
      const result = createControlledState<boolean>({
        value,
        defaultValue: signal(false),
      });

      expect(result.value()).toBe(true);
      value.set(false);
      expect(result.value()).toBe(false);
      value.set(true);
      expect(result.value()).toBe(true);
    });

    it('should stay controlled once value becomes defined', () => {
      const value = signal<string | undefined>(undefined);
      const onChange = jest.fn();
      const result = createControlledState<string>({
        value,
        defaultValue: signal('default'),
        onChange,
      });

      // Start uncontrolled, user sets a value
      result.set('user-value');
      expect(result.value()).toBe('user-value');

      // Switch to controlled — permanently
      value.set('controlled');
      expect(result.value()).toBe('controlled');

      // set() fires onChange but doesn't update internal in controlled mode
      onChange.mockClear();
      result.set('attempted');
      expect(onChange).toHaveBeenCalledWith('attempted');
      expect(result.value()).toBe('controlled'); // controlled value still wins
    });
  });
});
