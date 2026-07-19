# Drawer Snap Release Continuity

## Problem

When a drawer is dragged from a partial snap point past the fully open edge, releasing the gesture briefly restores the previous snap offset before the new snap point is rendered. The drawer therefore moves down and then back up.

The active snap point signal changes synchronously, but its CSS variables are applied later by an `afterRenderEffect`. Gesture cleanup currently restores the swipe movement immediately, leaving one frame that combines the old snap offset with zero swipe movement.

## Design

Keep the existing snap selection and overshoot resistance. After requesting the target snap point, synchronously apply the visual variables for the effective snap point before restoring the gesture movement and transition styles. This makes the snap offset and swipe reset part of the same visual release.

If `beforeSnapPointChange` cancels the request, the effective state remains unchanged and the drawer returns smoothly to the previous snap point.

No public API or demo styling changes are required.

## Verification

Add a browser regression test that drags from a lower point to the fully open point and verifies immediately after release that:

- the selected snap point is the fully open point;
- the snap offset already matches that point;
- the swipe movement has been reset without exposing the previous offset.

Run the drawer snap-point tests and the relevant Nx build target.
