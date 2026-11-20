#!/usr/bin/env node
// Prepares a hotfix: pick which of next's unreleased commits to ship, cherry-pick
// them onto the last release tag, verify that tree, and hand the branch to the
// Release workflow.
//
// Publishing deliberately stays in CI. npm's trusted publisher is bound to one
// exact workflow file (.github/workflows/release.yml), so anything that publishes
// from anywhere else - including a laptop - loses OIDC and provenance.
//
//   pnpm release:hotfix                      pick the commits interactively
//   pnpm release:hotfix --commits 934,#927   pick them by PR number or sha
//   pnpm release:hotfix --dry-run            stop before the push and dispatch
//   pnpm release:hotfix --resume             continue after resolving a conflict
import { checkbox, confirm } from '@inquirer/prompts';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  HotfixError,
  bumpPatch,
  classifyPickFailure,
  decodePicks,
  encodePicks,
  parseLog,
  pickNewestTag,
  selectCommits,
  unappliedPicks,
  versionFromBranch,
} from './hotfix.lib.mjs';

const RELEASE_PROJECTS = 'ng-primitives,state,mcp';

let options;

try {
  ({ values: options } = parseArgs({
    options: {
      commits: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      resume: { type: 'boolean', default: false },
      yes: { type: 'boolean', default: false },
    },
  }));
} catch (error) {
  console.error(`\n\x1b[31m✗\x1b[0m ${error.message}`);
  console.error(
    '  \x1b[2mUsage: pnpm release:hotfix [--commits <prs or shas>] [--dry-run] [--resume] [--yes]\x1b[0m',
  );
  process.exit(1);
}

const dryRun = options['dry-run'];
const resuming = options.resume;

const bold = s => `\x1b[1m${s}\x1b[0m`;
const dim = s => `\x1b[2m${s}\x1b[0m`;
const red = s => `\x1b[31m${s}\x1b[0m`;
const green = s => `\x1b[32m${s}\x1b[0m`;

function fail(message, hint) {
  console.error(`\n${red('✗')} ${message}`);
  if (hint) console.error(`  ${dim(hint)}`);
  process.exit(1);
}

function step(message) {
  console.log(`${green('→')} ${message}`);
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function tryGit(...args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  return { ok: result.status === 0, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function runInherit(command, args) {
  return spawnSync(command, args, { stdio: 'inherit' }).status === 0;
}

main().catch(error => {
  // Ctrl-C out of a prompt is a choice, not a crash.
  if (error?.name === 'ExitPromptError') process.exit(130);
  // git and gh throw; report them the way every other failure is reported.
  fail(error.hint ? error.message : (error.message ?? String(error)).split('\n')[0], error.hint);
});

async function main() {
  requireTools();

  const branch = resuming ? resumeBranch() : null;
  const head = git('rev-parse', '--abbrev-ref', 'HEAD');
  const returnTo = head === 'HEAD' ? git('rev-parse', 'HEAD') : head;

  // Always: on resume, uncommitted edits would be verified but never pushed.
  requireCleanTree();

  // Also on resume: a release or back-merge may have landed while a conflict was
  // being resolved, and the guards below are only meaningful against current refs.
  step('fetching origin');
  git('fetch', 'origin', 'next', 'main', '--tags', '--prune');

  const base = newestTag();
  const version = resuming ? versionFromBranch(branch) : nextVersion(base);
  const target = resuming ? branch : `hotfix/v${version}`;

  guardBase(base);

  if (resuming && version !== bumpPatch(base)) {
    fail(
      `${branch} would release v${version}, but ${base} is now the newest release.`,
      'Something was released while you were resolving. Start over from the current tag.',
    );
  }

  if (!resuming) {
    const commits = unreleasedCommits(base);
    if (commits.length === 0) fail(`next has nothing unreleased since ${base}.`);

    const picked = options.commits
      ? resolve(options.commits, commits, base)
      : await pick(commits, base);

    if (picked.length === 0) fail('Nothing selected.');

    console.log(`\n${bold(`${base} → v${version}`)} on ${bold(target)}\n`);
    for (const commit of picked) {
      console.log(`  ${dim(commit.short)}  ${commit.subject}`);
    }
    console.log();

    if (!(await ask(`Cherry-pick ${picked.length === 1 ? 'this' : 'these'} onto ${base}?`))) {
      process.exit(0);
    }

    createBranch(target, base);
    cherryPick(picked, base, target);
  } else {
    const pending = unappliedPicks(readPicks(target), git('log', '--format=%B', `${base}..HEAD`));

    if (pending.length > 0) {
      step(`continuing ${pending.length} remaining cherry-pick(s)`);
      cherryPick(
        pending.map(sha => ({ sha, short: sha.slice(0, 8) })),
        base,
        target,
      );
    }
  }

  if (git('rev-list', '--count', `${base}..HEAD`) === '0') {
    fail(
      `${target} carries nothing beyond ${base} - there is nothing to release.`,
      `Start over: git checkout - && git branch -D ${target}`,
    );
  }

  step('verifying the picked tree - lint, build and test');
  const verified = runInherit('pnpm', [
    'exec',
    'nx',
    'run-many',
    '-t',
    'lint,build,test',
    `--projects=${RELEASE_PROJECTS}`,
  ]);

  if (!verified) {
    fail(
      'The hotfix tree does not pass lint, build and test.',
      `Fix it on ${target}, commit, then rerun with --resume.`,
    );
  }

  previewChangelog(version);

  if (dryRun) {
    console.log(`\n${dim('--dry-run: nothing pushed, nothing dispatched.')}`);
    console.log(
      dim(`  You are on ${target}. To discard it: git checkout - && git branch -D ${target}`),
    );
    return;
  }

  if (!(await ask(`Push ${target} and dispatch the Release workflow?`))) {
    console.log(dim(`\nLeft ${target} local. Rerun with --resume when you are ready.`));
    return;
  }

  step(`pushing ${target}`);
  git('push', 'origin', `HEAD:refs/heads/${target}`, '--no-verify');

  // Dispatched from next, not from the hotfix branch: workflow_dispatch loads the
  // workflow file from the ref it runs against, and a hotfix branch carries whatever
  // release.yml its release tag was cut from.
  const dispatch = [
    'workflow',
    'run',
    'release.yml',
    '--ref',
    'next',
    '-f',
    'version=patch',
    '-f',
    `ref=${target}`,
  ];

  step(`dispatching Release against ${target}`);
  if (!runInherit('gh', dispatch)) {
    fail('Could not dispatch the workflow.', `Run it by hand: gh ${dispatch.join(' ')}`);
  }

  // Cosmetic cleanup: the release is already away, so a failure here is a warning,
  // not a failed run.
  if (!resuming && !tryGit('checkout', returnTo).ok) {
    console.error(dim(`  Could not return to ${returnTo}; you are on ${target}.`));
  }

  console.log(`\n${green('✓')} v${version} is releasing from ${bold(target)}.`);
  if (resuming) console.log(dim(`  You are still on ${target}; \`git checkout -\` to leave it.`));
  console.log(dim('  Watch it: gh run watch'));
  console.log(
    dim(
      '  The workflow back-merges main into next itself; check that job before the next release.',
    ),
  );
}

function requireTools() {
  // Checked even for --dry-run: `nx release changelog` shells out to `gh auth token`
  // for the preview, so an unauthenticated rehearsal fails several minutes in instead.
  if (spawnSync('gh', ['auth', 'status'], { stdio: 'ignore' }).status !== 0) {
    fail('The GitHub CLI is not available or not authenticated.', 'Run: gh auth login');
  }

  if (resuming && options.commits) {
    fail(
      '--commits has no effect with --resume.',
      'A resume continues the selection already recorded.',
    );
  }

  // A resume has nothing to pick, so it only needs the confirmations waived.
  if (!process.stdin.isTTY && !((options.commits || resuming) && options.yes)) {
    fail(
      'No terminal to prompt on.',
      'Non-interactively, pass --yes plus --commits <prs or shas> (or --resume).',
    );
  }
}

function requireCleanTree() {
  if (git('status', '--porcelain') !== '') {
    fail('The working tree is not clean.', 'Commit or stash before cutting a hotfix.');
  }
}

function resumeBranch() {
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  versionFromBranch(branch);

  if (tryGit('rev-parse', '--verify', 'CHERRY_PICK_HEAD').ok) {
    fail(
      'A cherry-pick is still in progress.',
      'Finish it with `git cherry-pick --continue` (or `--skip` if resolving left nothing to apply), then rerun with --resume.',
    );
  }
  return branch;
}

function newestTag() {
  const tag = pickNewestTag(git('tag', '--list', 'v*', '--sort=-v:refname').split('\n'));
  if (!tag) fail('No release tags found.');
  return tag;
}

// A hotfix is always built on the newest tag. `npm publish --tag latest` is
// hardcoded in project.json, so releasing an older line would drag npm's `latest`
// backwards for everyone.
function guardBase(base) {
  // An unmerged hotfix makes the unreleased list wrong: next does not contain the
  // last release, so commits already shipped still show up as unreleased.
  if (!tryGit('merge-base', '--is-ancestor', 'origin/main', 'origin/next').ok) {
    fail(
      'main is not merged into next - an earlier hotfix is unmerged.',
      'Merge the back-merge pull request first, then cut this one.',
    );
  }

  // The release pushes the hotfix branch to main, so main has to be behind the tag
  // it is built on or that push is not a fast-forward.
  if (!tryGit('merge-base', '--is-ancestor', 'origin/main', `${base}^{commit}`).ok) {
    fail(
      `origin/main is ahead of ${base}.`,
      'Something was pushed to main outside a release; reconcile it before cutting a hotfix.',
    );
  }
}

function unreleasedCommits(base) {
  // --first-parent lists what landed on next, so a merge commit appears once rather
  // than alongside the commits it brought in - picking both would abort as empty.
  // --topo-order, not the default date order: picks are applied parents-first, and
  // the two only coincide while the history stays linear.
  return parseLog(
    git(
      'log',
      '--first-parent',
      '--reverse',
      '--topo-order',
      '--format=%H%x00%h%x00%s',
      `${base}..origin/next`,
    ),
  );
}

function pick(commits, base) {
  return checkbox({
    message: `Commits on next since ${base}`,
    pageSize: 20,
    loop: false,
    choices: commits.map(commit => ({
      value: commit,
      name: `${commit.short}  ${commit.noise ? dim(commit.subject) : commit.subject}`,
    })),
  });
}

// Non-interactive selection, validated and ordered by the same rules as the picker.
function resolve(spec, commits, base) {
  return selectCommits(spec, commits, base, {
    lookupPr: pr => {
      const view = spawnSync('gh', ['pr', 'view', pr, '--json', 'state,mergeCommit'], {
        encoding: 'utf8',
      });

      if (view.status !== 0) {
        // No such pull request is an answer; anything else is a failure.
        if (/could not resolve|not found|no pull requests/i.test(view.stderr ?? '')) return null;
        throw new HotfixError(`Could not read PR #${pr}.`, view.stderr?.trim().split('\n')[0]);
      }

      return JSON.parse(view.stdout);
    },
    resolveSha: token => {
      const parsed = tryGit('rev-parse', '--verify', `${token}^{commit}`);
      return parsed.ok ? parsed.stdout.trim() : null;
    },
  });
}

function nextVersion(tag) {
  const version = bumpPatch(tag);

  if (tryGit('rev-parse', '--verify', `refs/tags/v${version}`).ok) {
    fail(`Tag v${version} already exists.`);
  }
  return version;
}

function createBranch(branch, base) {
  if (tryGit('rev-parse', '--verify', branch).ok) {
    fail(`Branch ${branch} already exists locally.`, `Delete it: git branch -D ${branch}`);
  }

  if (git('ls-remote', '--heads', 'origin', branch) !== '') {
    fail(
      `Branch ${branch} already exists on origin - an earlier hotfix was prepared but never released.`,
      `Release it, or delete it: git push origin --delete ${branch}`,
    );
  }
  git('checkout', '-b', branch, base);
}

// The picks still to apply, kept in .git so a conflict can be resolved and resumed
// without the file itself dirtying the tree.
function picksFile() {
  return join(git('rev-parse', '--absolute-git-dir'), 'hotfix-picks');
}

function readPicks(branch) {
  const file = picksFile();
  return decodePicks(existsSync(file) ? readFileSync(file, 'utf8') : undefined, branch);
}

function writePicks(branch, shas) {
  if (shas.length === 0) rmSync(picksFile(), { force: true });
  else writeFileSync(picksFile(), encodePicks(branch, shas));
}

function cherryPick(commits, base, branch) {
  const remaining = commits.map(commit => commit.sha);

  for (const commit of commits) {
    // A merge commit needs a mainline; a squash commit does not.
    const parents = git('rev-list', '--parents', '-n', '1', commit.sha).split(' ').length - 1;
    const args = parents > 1 ? ['cherry-pick', '-x', '-m', '1'] : ['cherry-pick', '-x'];

    const attempt = tryGit(...args, commit.sha);

    if (!attempt.ok) {
      // An already-applied commit leaves an empty pick, which `--continue` cannot
      // finish - and it means the selection is wrong, not that a merge needs help.
      if (classifyPickFailure(attempt.stderr + attempt.stdout) === 'empty') {
        tryGit('cherry-pick', '--abort');
        writePicks(branch, []);
        fail(
          `${commit.short} has nothing left to apply - its change is already on ${branch}.`,
          `The run was aborted, so any earlier picks were undone too. Start over without it: git checkout - && git branch -D ${branch}`,
        );
      }

      // The conflicted pick stays recorded: --resume decides whether it landed by
      // looking at the branch, so an --abort cannot silently drop it.
      writePicks(branch, remaining);
      console.error(`\n${red('✗')} ${commit.short} does not apply cleanly onto ${base}.`);
      console.error(dim('\n  The conflict is in your working tree. Resolve it, then:'));
      console.error(
        dim('    git cherry-pick --continue    # or --skip, if resolving left nothing to apply'),
      );
      console.error(dim('    pnpm release:hotfix --resume'));
      console.error(
        dim(
          `\n  Or start over: git cherry-pick --abort && git checkout - && git branch -D ${branch}`,
        ),
      );
      process.exit(1);
    }

    remaining.shift();
    writePicks(branch, remaining);
  }
}

function previewChangelog(version) {
  console.log(`\n${bold('Changelog preview')}\n`);
  const result = spawnSync('pnpm', ['exec', 'nx', 'release', 'changelog', version, '--dry-run'], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    fail('Could not generate the changelog preview.', result.stderr?.trim().split('\n')[0]);
  }

  const lines = (result.stdout ?? '').split('\n');
  const start = lines.findIndex(line => line.startsWith('+ ## '));
  const body = start === -1 ? [] : lines.slice(start).filter(line => line.startsWith('+'));
  // nx prints the same diff more than once; one copy is enough.
  const repeat = body.findIndex((line, index) => index > 0 && line.startsWith('+ ## '));
  const preview = repeat === -1 ? body : body.slice(0, repeat);

  if (preview.length === 0) {
    console.log(dim('  (nx produced no preview - check `nx release changelog` by hand)'));
  } else {
    for (const line of preview) console.log(`  ${line.replace(/^\+ ?/, '')}`);
  }
}

function ask(message) {
  return options.yes ? Promise.resolve(true) : confirm({ message, default: false });
}
