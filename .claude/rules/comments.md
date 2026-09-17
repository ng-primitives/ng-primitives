# Code Comments

Write the code so it explains itself, and add a comment where extra context
genuinely helps. Comments are for what the code cannot say.

## Prefer clearer code to a comment

A comment that compensates for an unclear name or shape is a missed refactor.
Rename the thing, extract the expression, and drop the comment.

```ts
// ❌ restates the code
// Return 'fixed' if the computed position is fixed, otherwise the configured strategy.
return getComputedStyle(el).position === 'fixed' ? 'fixed' : this.config.strategy;
```

## Comment the why

Constraints, trade-offs, browser quirks, and the reason a non-obvious shape is
the right one - these are worth a line.

```ts
// ✅ context the code cannot carry
// Resolved per pass so every caller agrees: `updatePosition()` used to take the
// `absolute` default, which offsets a `fixed` panel by the page scroll.
```

## Keep it concise

- A line or two. A JSDoc block longer than the member it documents is too long.
- If it needs paragraphs, the audience is a reviewer - put it in the commit
  message or PR description.
- Leave measurements, benchmarks, changelog notes and investigation write-ups out
  of source files. `git blame` and the PR cover them.
- Delete stale comments rather than let them drift.
