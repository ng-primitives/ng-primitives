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

function maximumCssDuration(style: CSSStyleDeclaration): number {
  const durations = `${style.transitionDuration},${style.animationDuration}`
    .split(',')
    .map(toMilliseconds);
  const delays = `${style.transitionDelay},${style.animationDelay}`.split(',').map(toMilliseconds);
  return Math.max(0, ...durations.map((duration, index) => duration + (delays[index] ?? 0)));
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

  await new Promise<void>(resolve => {
    let remaining = elements.length;
    const controller = new AbortController();
    const finish = () => {
      remaining -= 1;
      if (remaining <= 0) {
        controller.abort();
        resolve();
      }
    };
    for (const element of elements) {
      element.addEventListener('transitionend', finish, {
        once: true,
        signal: controller.signal,
      });
      element.addEventListener('transitioncancel', finish, {
        once: true,
        signal: controller.signal,
      });
      element.addEventListener('animationend', finish, {
        once: true,
        signal: controller.signal,
      });
      element.addEventListener('animationcancel', finish, {
        once: true,
        signal: controller.signal,
      });
    }
    view.setTimeout(() => {
      controller.abort();
      resolve();
    }, duration + 34);
  });
}
