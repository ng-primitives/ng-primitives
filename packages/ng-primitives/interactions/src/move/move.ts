import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, HostListener, input, output, signal } from '@angular/core';
import { injectDisposables } from 'ng-primitives/utils';

// Inspired by react-aria useMove hook: https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/interactions/src/useMove.ts

/**
 * The `NgpMove` directive is used to enable the pointer and keyboard move interactions on an element.
 */
@Directive({
  selector: '[ngpMove]',
  exportAs: 'ngpMove',
  host: {
    '[attr.data-move]': 'isMoving() ? "" : null',
  },
})
export class NgpMove {
  /**
   * Access the disposable helper.
   */
  private readonly disposables = injectDisposables();

  /**
   * Whether movement is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpMoveDisabled',
    transform: booleanAttribute,
  });

  /**
   * Emit when the move event begins.
   */
  readonly start = output<NgpMoveStartEvent>({
    alias: 'ngpMoveStart',
  });

  /**
   * Emit when the element is moved.
   */
  readonly move = output<NgpMoveEvent>({
    alias: 'ngpMove',
  });

  /**
   * Emit when the move event ends.
   */
  readonly end = output<NgpMoveEndEvent>({
    alias: 'ngpMoveEnd',
  });

  /**
   * Whether the element is currently being moved.
   */
  protected isMoving = signal<boolean>(false);

  /**
   * Store the last x position of the element.
   */
  private x: number | null = null;

  /**
   * Store the last y position of the element.
   */
  private y: number | null = null;

  /**
   * Store the id of the last pointer.
   */
  private pointerId: number | null = null;

  /**
   * Store the disposable event listeners.
   */
  private disposableListeners: (() => void)[] = [];

  /**
   * Handle a move start.
   */
  private onMoveStart(event: PointerEvent | KeyboardEvent, pointerType: PointerType): void {
    this.start.emit({
      pointerType,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      altKey: event.altKey,
    });
    this.isMoving.set(true);
  }

  /**
   * Handle a move event.
   */
  private onMove(
    event: PointerEvent | KeyboardEvent,
    pointerType: PointerType,
    deltaX: number,
    deltaY: number,
  ): void {
    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    this.move.emit({
      deltaX,
      deltaY,
      pointerType,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      altKey: event.altKey,
    });
  }

  /**
   * Handle a move end.
   */
  private onMoveEnd(event: PointerEvent | KeyboardEvent, pointerType: PointerType): void {
    this.end.emit({
      pointerType,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      altKey: event.altKey,
    });
    this.isMoving.set(false);
  }

  /**
   * Handle the pointer down event.
   */
  @HostListener('pointerdown', ['$event'])
  protected onPointerDown(event: PointerEvent): void {
    // ignore right-click or additional pointers
    if (event.button !== 0 || this.pointerId !== null || this.disabled()) {
      return;
    }

    // prevent the default behavior
    event.preventDefault();
    event.stopPropagation();

    this.onMoveStart(event, event.pointerType as PointerType);

    // store the pointer id and initial position
    this.pointerId = event.pointerId;
    this.x = event.pageX;
    this.y = event.pageY;

    // add global event listeners
    const pointerMove = this.disposables.addEventListener(
      window,
      'pointermove',
      this.onPointerMove.bind(this) as EventListener,
      false,
    );

    const pointerUp = this.disposables.addEventListener(
      window,
      'pointerup',
      this.onPointerUp.bind(this) as EventListener,
      false,
    );

    const pointerCancel = this.disposables.addEventListener(
      window,
      'pointercancel',
      this.onPointerUp.bind(this) as EventListener,
      false,
    );

    // store the disposable event listeners
    this.disposableListeners = [pointerMove, pointerUp, pointerCancel];
  }

  /**
   * Handle the pointer up event.
   */
  protected onPointerUp(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) {
      return;
    }

    const pointerType = (event.pointerType ?? 'mouse') as PointerType;
    this.onMoveEnd(event, pointerType);
    this.pointerId = null;
    this.disposableListeners.forEach(dispose => dispose());
  }

  /**
   * Handle the pointer move event.
   */
  protected onPointerMove(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) {
      return;
    }

    // Problems with PointerEvent#movementX/movementY:
    // 1. it is always 0 on macOS Safari.
    // 2. On Chrome Android, it's scaled by devicePixelRatio, but not on Chrome macOS
    this.onMove(
      event,
      event.pointerType as PointerType,
      event.pageX - (this.x ?? 0),
      event.pageY - (this.y ?? 0),
    );
    this.x = event.pageX;
    this.y = event.pageY;
  }

  private triggerKeyboardMove(event: KeyboardEvent, deltaX: number, deltaY: number): void {
    if (this.disabled()) {
      return;
    }

    this.onMoveStart(event, 'keyboard');
    this.onMove(event, 'keyboard', deltaX, deltaY);
    this.onMoveEnd(event, 'keyboard');
  }

  @HostListener('keydown.ArrowUp', ['$event'])
  protected onArrowUp(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.triggerKeyboardMove(event as KeyboardEvent, 0, -1);
  }

  @HostListener('keydown.ArrowDown', ['$event'])
  protected onArrowDown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.triggerKeyboardMove(event as KeyboardEvent, 0, 1);
  }

  @HostListener('keydown.ArrowLeft', ['$event'])
  protected onArrowLeft(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.triggerKeyboardMove(event as KeyboardEvent, -1, 0);
  }

  @HostListener('keydown.ArrowRight', ['$event'])
  protected onArrowRight(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.triggerKeyboardMove(event as KeyboardEvent, 1, 0);
  }
}

interface NgpMoveBaseEvent {
  /**
   * Whether the event was triggered by a mouse or keyboard event.
   */
  pointerType: PointerType;
  /**
   * Whether the shift key was pressed during the event.
   */
  shiftKey: boolean;
  /**
   * Whether the control key was pressed during the event.
   */
  ctrlKey: boolean;
  /**
   * Whether the meta key was pressed during the event.
   */
  metaKey: boolean;
  /**
   * Whether the alt key was pressed during the event.
   */
  altKey: boolean;
}

export type NgpMoveStartEvent = NgpMoveBaseEvent;
export type NgpMoveEndEvent = NgpMoveBaseEvent;

export interface NgpMoveEvent extends NgpMoveBaseEvent {
  /**
   * The amount of pixels moved in the x-axis.
   */
  deltaX: number;
  /**
   * The amount of pixels moved in the y-axis.
   */
  deltaY: number;
}

export type PointerType = 'mouse' | 'pen' | 'touch' | 'keyboard' | 'virtual';
