function toMilliseconds(value: string): number {
  const trimmed = value.trim();
  if (trimmed.endsWith('ms')) {
    return Number.parseFloat(trimmed) || 0;
  }
  if (trimmed.endsWith('s')) {
    return (Number.parseFloat(trimmed) || 0) * 1000;
  }
  return 0;
}

/**
 * The longest `duration + delay` of a single effect list. CSS repeats the shorter list until it
 * matches the longer one, so the delay of effect `index` is `delays[index % delays.length]` - the
 * transition and animation lists must therefore be expanded independently of each other.
 */
function maximumEffectDuration(durationList: string, delayList: string): number {
  const durations = durationList.split(',').map(toMilliseconds);
  const delays = delayList.split(',').map(toMilliseconds);
  return Math.max(
    0,
    ...durations.map(
      (duration, index) => duration + (delays.length ? delays[index % delays.length] : 0),
    ),
  );
}

function maximumCssDuration(style: CSSStyleDeclaration): number {
  return Math.max(
    maximumEffectDuration(style.transitionDuration, style.transitionDelay),
    maximumEffectDuration(style.animationDuration, style.animationDelay),
  );
}

export function nextDrawerFrame(document: Document): Promise<void> {
  const view = document.defaultView;
  return new Promise(resolve => {
    if (view?.requestAnimationFrame) {
      view.requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export async function waitForDrawerTransition(
  elements: readonly HTMLElement[],
  document: Document,
): Promise<void> {
  await nextDrawerFrame(document);

  const supportsWebAnimations = elements.every(
    element => typeof element.getAnimations === 'function',
  );

  if (supportsWebAnimations) {
    const animations = [...new Set(elements.flatMap(element => element.getAnimations()))].filter(
      animation => {
        const endTime = animation.effect?.getComputedTiming().endTime;
        return typeof endTime === 'number' && Number.isFinite(endTime);
      },
    );
    await Promise.all(animations.map(animation => animation.finished.catch(() => undefined)));
    return;
  }

  const view = document.defaultView;
  if (!view) {
    return;
  }
  const duration = Math.max(
    0,
    ...elements.map(element => maximumCssDuration(view.getComputedStyle(element))),
  );
  if (duration === 0) {
    return;
  }

  // Without `getAnimations` there is no way to tell which effect an end event belongs to, and the
  // first `transitionend` only reports the first property to finish - so wait out the longest
  // declared transition or animation instead.
  await new Promise<void>(resolve => {
    view.setTimeout(resolve, duration + 34);
  });
}
