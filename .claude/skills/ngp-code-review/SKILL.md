---
name: ngp-code-review
description: Review changed code in the ng-primitives repo against project conventions. Use when the user asks for a code review, asks "review my changes", or asks if a PR/branch is ready. Do not invoke automatically before commits.
---

# ng-primitives code review

Use this skill when reviewing changes on a branch or PR in this repo. The goal is a structured, file-by-file review against project conventions — not a generic code review.

## How to run the review

1. Scope the diff: `git diff next...HEAD --stat`, then `git diff next...HEAD` for content. (Main is `next` in this repo.) For a remote PR, use `gh pr diff <num>`.
2. For each changed file, walk the checklist below and cite specific `file:line` locations for any finding.
3. Cross-check against `CONTRIBUTING.md` and the PR template at `.github/PULL_REQUEST_TEMPLATE.md` (tests added, docs updated, issue linked, breaking-change disclosure).
4. If substantive code changed, suggest running `pnpm lint` and `nx test <project>` — don't run them silently; let the user decide.

### Review scope rules

**Review only the changed lines, not the whole file.** If a file is touched, do not raise issues with surrounding code that the diff did not modify. Pre-existing issues are out of scope — e.g. if an existing getter elsewhere in the file should be a `computed()` but the diff didn't touch it, leave it alone. Use `git diff next...HEAD -- <file>` to keep your focus tight.

**Verify "unused" / "unreferenced" claims before raising them.** Symbols can be referenced where a plain `grep` won't show: directive attribute selectors used in templates (`ngpButton`), CSS classes in styles, DI tokens, downstream barrel exports, generator templates under `packages/tools/`. Before flagging something as unused, grep the selector, check templates (`*.html` and inline), check `index.ts`. **Time-box this to a couple of greps per claim.** If you can't confirm in a quick check, soften the finding to "possibly unused — please verify".

**Filter speculative findings.** Drop any finding whose justification only kicks in under hypothetical future changes ("if someone later adds X…", "if this describe block grows…", "if this primitive ever supports Y…"). Only raise issues that affect the code **as it stands today** — i.e. there is a concrete current call site, test, or usage that demonstrates the problem. If a future-proofing concern is genuinely important, reframe it as a concrete present-day risk or drop it. This rule supersedes anything else in the checklist.

## Checklist

### 0. Scope of the change

Before reviewing details, judge whether the PR is appropriately scoped. A large diff is fine when the work genuinely requires it — a new complex primitive with state, sub-directives, tests, and docs is expected to be big. A large diff is **not** fine when it's an accident of process. Flag:

- Drive-by edits unrelated to the stated PR title (formatting churn in untouched files, unrelated renames, opportunistic refactors).
- Mass changes across many primitives bundled into one PR when each could ship independently — suggest splitting.
- New documentation that pads existing pages with AI-generated waffle: long pre-ambles, marketing copy, redundant restatements of what the code already shows, generic "best practices" boilerplate. Docs should be terse, concrete, and tied to actual primitive behaviour. If a docs change adds paragraphs without adding information, flag it for trimming.
- Speculative additions: extra inputs, options, or abstractions that aren't required by the issue being fixed.
- Test files balloon out of proportion to the behaviour change (e.g. dozens of describes for a one-line fix).

The bar: every line in the diff should be defensible against "is this needed for the stated change?" If not, suggest pulling it into a separate PR or dropping it.

### 1. Angular & signal APIs

Read `.claude/rules/angular-patterns.md` and flag any violation. Common ones in PRs: decorator inputs/outputs/queries (should be signal forms), non-`readonly` signals, `@internal` JSDoc on private members.

### 2. Naming & inputs

Read `.claude/rules/naming-conventions.md` and flag any violation. Common ones: missing `ngp` selector prefix, `Directive`/`Component`/`Service` class suffix, `.directive.ts` file names, inputs without `ngp`-prefixed aliases, number/boolean inputs without `NumberInput`/`BooleanInput` + coercion.

### 3. State pattern

Every primitive uses the same four exports from `packages/ng-primitives/state/src/`:

- `NgpXStateToken = createStateToken<NgpX>('X')`
- `provideXState = createStateProvider(NgpXStateToken)`
- `injectXState = createStateInjector<NgpX>(NgpXStateToken)`
- `xState = createState(NgpXStateToken)`

Flag new primitives that don't follow this quadruple. Specific rule violations (early state, missing generic, emitting state, reading raw input) are owned by §4.

### 4. Custom workspace lint rules

The following live under `tools/eslint-rules/rules/` and run automatically via `pnpm lint`. This table is the single source of truth for rule names — call them out by name in the review so the user knows why something is flagged.

| Rule                          | What to flag                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `prefer-state`                | Direct `this.input()` access in stateful directives — use `this.state.*`.                                         |
| `avoid-model`                 | Any `model()` usage — use an explicit input/output pair.                                                          |
| `avoid-state-emit`            | Outputs that emit `this.state.X` — emit the local controlled value so parent bindings round-trip.                 |
| `avoid-early-state`           | State registration not at the end of the class property block.                                                    |
| `require-state-generic`       | `createStateInjector()` missing `<T>`.                                                                            |
| `take-until-destroyed`        | `takeUntilDestroyed` from `@angular/core/rxjs-interop` — use `safeTakeUntilDestroyed` from `ng-primitives/utils`. |
| `rxjs-compat`                 | Operators imported from `rxjs` — import from `rxjs/operators`.                                                    |
| `prefer-entrypoint-imports`   | Cross-package relative imports — use package aliases (`ng-primitives/foo`).                                       |
| `prefer-document-from-common` | `DOCUMENT` imported from `@angular/core` — import from `@angular/common`.                                         |

### 5. Tests

Tests live next to source as `*.test.ts` and use vitest + `@testing-library/angular` (`render`, `screen`, `userEvent`, `waitFor`, `fireEvent`). Flag:

- New behaviour or bug fix without a `*.test.ts` change — PR template requires tests.
- Inside dialog/overlay portals rooted on `ApplicationRef`, prefer `fireEvent.input` over `userEvent.type` to avoid NG0101 races.
- Tests that open dialogs/overlays without an `afterEach` that closes them and `waitFor`s their DOM removal before destroying the fixture. Portals attach to root, not the fixture, so `fixture.destroy()` alone leaks DOM.
- Animation tests that rely on time instead of mocking `Element.prototype.getAnimations`.
- Two-way binding tests asserting on close ordering that use `{escape}` — Escape fires `immediate: true` in capture phase, which races; use `userEvent.click(document.body)` instead.
- Missing `afterEach` cleanup for overlays opened directly (e.g. `document.querySelectorAll('[ngpTooltip]').forEach(el => el.remove())`).

### 6. Accessibility

Accessibility is first-class per `CONTRIBUTING.md`. Flag:

- Interactive primitives missing ARIA roles, `aria-*` attributes, or `tabindex`.
- Controls not reachable by keyboard, or focus order broken after a state change.
- Focus-trap interactions that don't account for `NgpOverlayRegistry` — if a new overlay/portal primitive lets focus move outside a host element, verify focus-trap will treat it as an allowed external target.
- Hardcoded `tabindex` values that conflict with `FocusMonitor` / focus-trap logic.

### 7. Documentation & examples

PR template requires docs updates for features and bug fixes. For new public behaviour:

- Look for a matching example under `apps/documentation/src/app/examples/<primitive>/`.
- Look for a docs page under `apps/documentation/src/app/pages/primitives/<primitive>/`.
- Generators: `nx g @ng-primitives/tools:example <name> --primitive <primitive>` and `nx g @ng-primitives/tools:documentation`.

If the diff touches files under `apps/documentation/src/app/examples/`, check them against `.claude/rules/docs-example-styling.md`. Common violations to flag by `file:line`:

- **Off-brand colour.** Brand red (`--ngp-primary` / `#f01e2b` / `#ff4651`) on a focus ring (`:focus`, `[data-focus]`, `[data-focus-visible]`, `:focus-within`) - focus must be blue (`--ngp-focus-ring` / `blue-500` / `blue-400`). Conversely, blue / `--ngp-background-inverse` / off-palette tokens (`--ngp-text-blue`, `--ngp-background-blue`, `--ngp-background-success`) used for a _state_ (checked, selected, active, fill, primary button) - those must be brand red.
- **Menu/option focus as an outline** instead of a background highlight, or a missing `outline: none` on the dropdown panel.
- **CSS ↔ Tailwind drift.** A change to `<name>.example.ts` without the matching change to `<name>.tailwind.example.ts` (or vice-versa), so the two variants no longer match.
- **Typography/radii off-scale** (500/600 weights instead of 510/590, no negative tracking, dark panels using `bg-black` / `gray-700` instead of `zinc-950` / `zinc-800`).
- **Dialog overlay** missing `z-index: 1000` / `z-[1000]` (backdrop renders under the navbar).

### 8. Commits & PR template

- Conventional Commits required: `feat(scope): …`, `fix(scope): …`, `docs(scope): …`, `chore(scope): …`. Scope is usually the primitive name (`combobox`, `focus-trap`, `tooltip`).
- Flag malformed commit messages before suggesting merge.
- PR template checklist: tests added, docs updated, issue linked (`Closes #...`), breaking change disclosed.

### 9. Formatting

Formatting is enforced by `.prettierrc` plus the Prettier plugins (`@trivago/prettier-plugin-sort-imports`, `prettier-plugin-organize-attributes`, `prettier-plugin-tailwindcss`). If something looks off, suggest `pnpm format` rather than nitpicking line-by-line.

## Output format

Each finding is its own block. Group blocks under the file they belong to, ordered by severity (High → Medium → Low). Do not pack multiple findings into one bullet — one finding per block so they're easy to read and triage. Always cite `file:line`. Use real markdown — the structure below shows the literal shape (do not emit it as a code fence).

```
## Summary
<1-3 sentences: what the diff does and overall verdict>

## <path/to/file.ts>

### 🔴 [HIGH · 95%] <one-line title> — `file.ts:42`
<one or two sentences explaining the issue and why it matters today>

**Fix:**
\`\`\`ts
<short before/after or single-line replacement — only if it fits in ~10 lines>
\`\`\`

### 🟡 [MEDIUM · 80%] <title> — `file.ts:60`
<explanation>

(no fix block if the change isn't short enough to show inline — describe it in prose instead)
```

### Severity

Always prefix the severity tag with its emoji so the reader can scan the review visually:

- 🔴 **HIGH** — correctness bug, lint-rule violation, public API regression, accessibility regression, broken test, missing required test for a behaviour change. The PR should not merge without addressing it.
- 🟡 **MEDIUM** — clarity, maintainability, type-safety, or a convention miss that isn't lint-enforced. Worth fixing in this PR but not a blocker.
- 🟢 **LOW** — style or naming nits, usually auto-fixable by `pnpm format`. Mention briefly or omit.

### Confidence

Express as a percentage (e.g. `85%`) reflecting how sure you are the finding is real and the fix is correct, **given the code as it stands today**:

- **90–100%** — verified against the rule, the file, and any referenced symbols. Safe to act on.
- **70–89%** — strong signal but one assumption unverified (e.g. didn't run lint, didn't grep all call sites).
- **50–69%** — soft finding; phrase as "verify" rather than "fix".
- **Below 50%** — do not raise. If you can't get above 50% with the information at hand, either dig further or drop the finding.

If a finding's confidence is below 70% **and** severity is LOW, drop it entirely — it's noise.

### Inline fixes

When the fix is short (≤10 lines, ideally ≤3), include a `**Fix:**` code block showing the suggested change. For longer or more invasive changes, describe the fix in prose instead — do not paste large diffs into the review.

### What not to include

- Speculative future-proofing (see "Filter speculative findings" above).
- Findings outside the diff scope.
- Praise sections, restatements of the diff, or summaries longer than three sentences.
- Categories with no findings (don't print empty headings).

Keep the review tight — fewer, sharper findings beat a long list.

## After the review

Once the findings have been printed, follow this flow. Do **not** start fixing anything proactively — wait for the user to choose.

### 1. Ask what to fix

Use `AskUserQuestion` with a single question (`header: "Fixes"`) offering these options. Skip severities that produced no findings — if there are no LOW findings, don't offer "Fix LOW". If there are no findings at all, skip this step entirely and go straight to step 3.

- **Fix HIGH only** — apply fixes for 🔴 HIGH findings.
- **Fix HIGH + MEDIUM** — apply fixes for 🔴 HIGH and 🟡 MEDIUM findings.
- **Fix all** — apply fixes for every finding regardless of severity.
- **Choose specific issues** — user will list which findings to fix (by `file:line` or title).
- **Skip fixes** — don't change anything.

When the user picks a subset, apply only those fixes and report what changed. Do not bundle unrequested cleanups.

### 2. Re-run after fixing

After applying any fixes, summarise in one or two sentences what was changed (cite `file:line`). Do not re-run the full review unless the user asks for it.

### 3. Offer to create a pull request

After fixes (or immediately, if the user chose "Skip fixes" or there were no findings), prompt the user about a PR.

**First check for uncommitted changes** with `git status --porcelain`. If there are any tracked changes that aren't committed:

- Print the list of uncommitted files.
- Ask via `AskUserQuestion` (`header: "Commit?"`):
  - **Commit now** — stage the relevant files and create a conventional-commit message. Confirm the message with the user before committing.
  - **Skip commit** — leave the working tree as-is; do not create the PR (a PR built off an uncommitted tree won't include the fixes).
  - **Cancel** — don't commit and don't open a PR.

Do **not** auto-stage `.env`, credentials, or files outside the diff scope. Mention any such files in the prompt rather than including them.

Once the tree is clean (or already was), ask via `AskUserQuestion` (`header: "Open PR?"`):

- **Create pull request** — run the PR-creation flow against `next` (this repo's main branch). Use the `.github/PULL_REQUEST_TEMPLATE.md` sections: PR Checklist, PR Type, linked issue, description, breaking-change disclosure. Confirm the title and body with the user before invoking `gh pr create`.
- **Not yet** — stop here; the review is done.

Never push branches or open PRs without explicit user confirmation at this prompt.
