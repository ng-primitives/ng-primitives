import type { Placement } from '@floating-ui/dom';

export function getTransformOrigin(placement: Placement): string {
  const basePlacement = placement.split('-')[0]; // Extract "top", "bottom", etc.
  const alignment = placement.split('-')[1]; // Extract "start" or "end"

  const map: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };

  let x = 'center';
  let y = 'center';

  if (basePlacement === 'top' || basePlacement === 'bottom') {
    y = map[basePlacement];
    if (alignment === 'start') x = 'left';
    else if (alignment === 'end') x = 'right';
  } else {
    x = map[basePlacement];
    if (alignment === 'start') y = 'top';
    else if (alignment === 'end') y = 'bottom';
  }

  return `${y} ${x}`;
}
