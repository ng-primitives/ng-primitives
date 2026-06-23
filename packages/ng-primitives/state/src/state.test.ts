import { Component, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { state } from 'ng-primitives/state';
import { firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';

@Component({ template: '', standalone: true })
class NoopComponent {}

function createState<T>(...args: Parameters<typeof state<T>>) {
  const fixture = TestBed.createComponent(NoopComponent);
  const injector = fixture.componentRef.injector;
  const [value, set, change] = runInInjectionContext(injector, () => state<T>(...args));
  return { value, set, change };
}

describe('state', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  describe('initialization', () => {
    it('should use the defaultValue when value is undefined', () => {
      const result = createState<boolean>({
        value: signal(true),
      });
      expect(result.value()).toBe(true);
    });

    it('should handle value being undefined with no defaultValue', () => {
      const result = createState<boolean>({
        value: signal(undefined),
      });
      expect(result.value()).toBeUndefined();
    });

    it('should handle non-boolean types', () => {
      const result = createState<string>({
        value: signal('hello'),
      });
      expect(result.value()).toBe('hello');
    });

    it('should handle numeric types including zero', () => {
      const result = createState<number>({
        value: signal(0),
      });
      expect(result.value()).toBe(0);
    });

    it('should handle null as a valid controlled value', () => {
      const result = createState<string | null>({
        value: signal<string | null | undefined>(null),
      });
      expect(result.value()).toBeNull();
    });

    it('should handle empty string as a valid controlled value', () => {
      const result = createState<string>({
        value: signal<string | undefined>(''),
      });
      expect(result.value()).toBe('');
    });

    it('should handle false as a valid controlled value', () => {
      const result = createState<boolean>({
        value: signal<boolean | undefined>(false),
      });
      expect(result.value()).toBe(false);
    });
  });

  describe('uncontrolled mode (value is undefined)', () => {
    it('should update value when set is called', () => {
      const result = createState<boolean>({
        value: signal(undefined),
      });

      result.set(true);
      expect(result.value()).toBe(true);
    });

    it('should allow toggling back and forth', () => {
      const result = createState<boolean>({
        value: signal(undefined),
      });

      result.set(true);
      expect(result.value()).toBe(true);

      result.set(false);
      expect(result.value()).toBe(false);

      result.set(true);
      expect(result.value()).toBe(true);
    });

    it('should work with complex object types', () => {
      const result = createState<{ x: number; y: number }>({
        value: signal(undefined),
      });

      const newValue = { x: 10, y: 20 };
      result.set(newValue);
      expect(result.value()).toEqual(newValue);
    });

    it('should work with array types', () => {
      const result = createState<string[]>({
        value: signal(undefined),
      });

      result.set(['a', 'b']);
      expect(result.value()).toEqual(['a', 'b']);
    });
  });

  describe('controlled mode (value is defined)', () => {
    it('should always reflect the controlled value', () => {
      const value = signal<boolean | undefined>(true);
      const result = createState<boolean>({
        value,
      });

      expect(result.value()).toBe(true);

      value.set(false);
      expect(result.value()).toBe(false);

      value.set(true);
      expect(result.value()).toBe(true);
    });
  });

  describe('onChange callback', () => {
    it('should call onChange when set is called', () => {
      const onChange = vi.fn();
      const result = createState<boolean>({
        value: signal(undefined),
        onChange,
      });

      result.set(true);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with the new value each time set is called', () => {
      const onChange = vi.fn();
      const result = createState<boolean>({
        value: signal(undefined),
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
      const onChange = vi.fn();
      const value = signal<boolean | undefined>(false);
      const result = createState<boolean>({
        value,
        onChange,
      });

      result.set(true);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should not call onChange when controlled value changes externally', () => {
      const onChange = vi.fn();
      const value = signal<boolean | undefined>(false);
      createState<boolean>({
        value,
        onChange,
      });

      value.set(true);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should work without an onChange callback', () => {
      const result = createState<boolean>({
        value: signal(undefined),
      });
      expect(() => result.set(true)).not.toThrow();
    });

    it('should call onChange with complex types', () => {
      const onChange = vi.fn();
      const result = createState<{ id: number }>({
        value: signal(undefined),
        onChange,
      });

      const newValue = { id: 42 };
      result.set(newValue);
      expect(onChange).toHaveBeenCalledWith(newValue);
    });
  });

  describe('change observable', () => {
    it('should emit when set is called', async () => {
      const result = createState<boolean>({
        value: signal(undefined),
      });

      const promise = firstValueFrom(result.change);
      result.set(true);

      expect(await promise).toBe(true);
    });

    it('should emit multiple values', async () => {
      const result = createState<boolean>({
        value: signal(undefined),
      });

      const promise = firstValueFrom(result.change.pipe(take(3), toArray()));
      result.set(true);
      result.set(false);
      result.set(true);

      expect(await promise).toEqual([true, false, true]);
    });

    it('should emit in controlled mode so the parent can respond', async () => {
      const value = signal<boolean | undefined>(false);
      const result = createState<boolean>({ value });

      const promise = firstValueFrom(result.change);
      result.set(true);

      expect(await promise).toBe(true);
    });

    it('should not emit when controlled value changes externally', () => {
      const spy = vi.fn();
      const value = signal<boolean | undefined>(false);
      const result = createState<boolean>({ value });

      result.change.subscribe(spy);
      value.set(true);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('priority and precedence', () => {
    it('should treat null controlled value as a defined value (not fallback to default)', () => {
      const result = createState<string | null>({
        value: signal<string | null | undefined>(null),
      });

      expect(result.value()).toBeNull();
    });

    it('should treat false controlled value as a defined value', () => {
      const result = createState<boolean>({
        value: signal<boolean | undefined>(false),
      });

      expect(result.value()).toBe(false);
    });

    it('should treat 0 controlled value as a defined value', () => {
      const result = createState<number>({
        value: signal<number | undefined>(0),
      });

      expect(result.value()).toBe(0);
    });

    it('should treat empty string controlled value as a defined value', () => {
      const result = createState<string>({
        value: signal<string | undefined>(''),
      });

      expect(result.value()).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should not fire onChange when set is called with the same value', () => {
      const onChange = vi.fn();
      const result = createState<boolean>({
        value: signal(undefined),
        onChange,
      });

      result.set(true);
      result.set(true);

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid successive set calls', () => {
      const onChange = vi.fn();
      const result = createState<number>({
        value: signal(undefined),
        onChange,
      });

      for (let i = 1; i <= 100; i++) {
        result.set(i);
      }

      expect(result.value()).toBe(100);
      expect(onChange).toHaveBeenCalledTimes(100);
    });

    it('should handle set being called with undefined in a nullable type', () => {
      const onChange = vi.fn();
      const result = createState<string | undefined>({
        value: signal<string | undefined | undefined>('default'),
        onChange,
      });

      result.set(undefined);
      expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('should handle controlled value signal updating multiple times', () => {
      const value = signal<boolean | undefined>(true);
      const result = createState<boolean>({
        value,
      });

      expect(result.value()).toBe(true);
      value.set(false);
      expect(result.value()).toBe(false);
      value.set(true);
      expect(result.value()).toBe(true);
    });

    describe('set with emit: false', () => {
      it('should update internal state but not call onChange', () => {
        const onChange = vi.fn();
        const result = createState<boolean>({
          value: signal(undefined),
          onChange,
        });

        result.set(true, { emit: false });

        expect(result.value()).toBe(true);
        expect(onChange).not.toHaveBeenCalled();
      });

      it('should update internal state but not emit on the change observable', () => {
        const spy = vi.fn();
        const result = createState<boolean>({
          value: signal(undefined),
        });

        result.change.subscribe(spy);
        result.set(true, { emit: false });

        expect(result.value()).toBe(true);
        expect(spy).not.toHaveBeenCalled();
      });

      it('should default to emit: true when options are omitted', () => {
        const onChange = vi.fn();
        const result = createState<boolean>({
          value: signal(undefined),
          onChange,
        });

        result.set(true);
        expect(onChange).toHaveBeenCalledWith(true);
      });

      it('should respect emit: true explicitly', () => {
        const onChange = vi.fn();
        const result = createState<boolean>({
          value: signal(undefined),
          onChange,
        });

        result.set(true, { emit: true });
        expect(onChange).toHaveBeenCalledWith(true);
      });

      it('should update internal state in controlled mode even with emit: false', () => {
        const onChange = vi.fn();
        const value = signal<boolean | undefined>(false);
        const result = createState<boolean>({
          value,
          onChange,
        });

        result.set(true, { emit: false });

        expect(result.value()).toBe(true);
        expect(onChange).not.toHaveBeenCalled();
      });

      it('should still skip when called with the same value and emit: false', () => {
        const onChange = vi.fn();
        const result = createState<boolean>({
          value: signal(false),
          onChange,
        });

        result.set(false, { emit: false });
        expect(onChange).not.toHaveBeenCalled();
        expect(result.value()).toBe(false);
      });

      it('should allow subsequent set with emit:true to fire after emit:false', () => {
        const onChange = vi.fn();
        const result = createState<string>({
          value: signal(undefined),
          onChange,
        });

        result.set('b', { emit: false });
        expect(onChange).not.toHaveBeenCalled();
        expect(result.value()).toBe('b');

        result.set('c');
        expect(onChange).toHaveBeenCalledWith('c');
        expect(result.value()).toBe('c');
      });
    });
  });

  describe('form control integration (set with emit: false)', () => {
    it('should update the resolved value without calling onChange', () => {
      const onChange = vi.fn();
      const result = createState<boolean>({
        value: signal(undefined),
        onChange,
      });

      // Simulate ControlValueAccessor.writeValue — must not trigger onChange
      result.set(true, { emit: false });

      expect(result.value()).toBe(true);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not emit on the change observable', () => {
      const spy = vi.fn();
      const result = createState<boolean>({
        value: signal(undefined),
      });

      result.change.subscribe(spy);
      result.set(true, { emit: false });

      expect(result.value()).toBe(true);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should allow user interaction (set) after set with emit: false', () => {
      const onChange = vi.fn();
      const result = createState<boolean>({
        value: signal(undefined),
        onChange,
      });

      // Form control writes a value
      result.set(true, { emit: false });
      expect(result.value()).toBe(true);
      expect(onChange).not.toHaveBeenCalled();

      // User toggles — should call onChange
      result.set(false);
      expect(result.value()).toBe(false);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should reflect form control disabled via set with emit: false after user interaction', () => {
      const onChange = vi.fn();
      const result = createState<boolean>({
        value: signal(undefined),
        onChange,
      });

      // User interacts
      result.set(true);
      expect(onChange).toHaveBeenCalledWith(true);

      // Form control resets via set with emit: false — should not call onChange
      onChange.mockClear();
      result.set(false, { emit: false });
      expect(result.value()).toBe(false);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle set with emit: false with the same current value', () => {
      const onChange = vi.fn();
      const result = createState<boolean>({
        value: signal(true),
        onChange,
      });

      result.set(true, { emit: false });
      expect(result.value()).toBe(true);
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
