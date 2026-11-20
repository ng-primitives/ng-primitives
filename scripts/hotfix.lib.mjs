// The decisions a hotfix turns on - which commits, in what order, at what version -
// kept free of git and gh so they can be tested directly.

export class HotfixError extends Error {
  constructor(message, hint) {
    super(message);
    this.name = 'HotfixError';
    this.hint = hint;
  }
}

/** Parses `git log --format=%H%x00%h%x00%s` output into commits, oldest first. */
export function parseLog(log) {
  if (!log) return [];

  return log
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [sha, short, subject] = line.split('\0');
      // Dimmed in the picker as unlikely to be wanted - not forbidden, because a
      // chore(deps) bump of a shipped dependency is a fair thing to hotfix.
      const noise = /^(docs|chore)(\(.+\))?:/.test(subject);
      return { sha, short, subject, noise };
    });
}

// A semver numeric identifier: no leading zeros, so v01.2.3 is not a release tag.
const NUMBER = String.raw`(?:0|[1-9]\d*)`;
const RELEASE_TAG = new RegExp(`^v(${NUMBER})\\.(${NUMBER})\\.(${NUMBER})$`);
const HOTFIX_BRANCH = new RegExp(`^hotfix/(v${NUMBER}\\.${NUMBER}\\.${NUMBER})$`);

/** The patch version a tag releases next: v0.130.1 -> 0.130.2. */
export function bumpPatch(tag) {
  const match = RELEASE_TAG.exec(tag);
  if (!match) throw new HotfixError(`${tag} is not a plain version tag.`);

  const [, major, minor, patch] = match;
  return `${major}.${minor}.${Number(patch) + 1}`;
}

/**
 * Resolves `--commits 934,#927,c081a23` against the unreleased list. Every token
 * must name a merged, unreleased commit, and the result is ordered by when the
 * commits landed rather than how they were typed. `lookupPr` returns null when no
 * such pull request exists.
 */
export function selectCommits(spec, commits, base, { lookupPr, resolveSha }) {
  const picked = [];

  for (const token of spec.split(/[\s,]+/).filter(Boolean)) {
    let sha;

    const explicitPr = token.startsWith('#');

    if (explicitPr || /^\d+$/.test(token)) {
      const pr = token.replace('#', '');
      const found = lookupPr(pr);

      // A bare number is a pull request; only if no such pull request exists is it
      // worth trying as a revision, which is how an all-digit short sha gets through.
      if (!found && !explicitPr) {
        sha = resolveSha(token);
        if (!sha) throw new HotfixError(`${token} is neither a pull request nor a commit.`);
      } else {
        if (!found) throw new HotfixError(`Could not read PR #${pr}.`);

        const { state, mergeCommit } = found;
        if (state !== 'MERGED') throw new HotfixError(`PR #${pr} is ${state}, not MERGED.`);
        if (!mergeCommit?.oid) {
          throw new HotfixError(
            `PR #${pr} has no merge commit.`,
            'Only a squash- or merge-committed PR can be cherry-picked by number.',
          );
        }
        sha = mergeCommit.oid;
      }
    } else {
      sha = resolveSha(token);
      if (!sha) throw new HotfixError(`${token} is not a commit in this repository.`);
    }

    const commit = commits.find(candidate => candidate.sha === sha);
    if (!commit) {
      throw new HotfixError(
        `${token} is not in ${base}..next.`,
        'A hotfix can only ship commits that are merged and unreleased.',
      );
    }

    if (!picked.includes(commit)) picked.push(commit);
  }

  return picked.sort((a, b) => commits.indexOf(a) - commits.indexOf(b));
}

/**
 * Resume state is stamped with the branch that owns it, so an abandoned hotfix
 * cannot feed its leftover picks to a different branch later.
 */
export function encodePicks(branch, shas) {
  return `${[branch, ...shas].join('\n')}\n`;
}

export function decodePicks(contents, branch) {
  const [owner, ...shas] = (contents ?? '').split('\n').filter(Boolean);
  return owner === branch ? shas : [];
}

/** An already-applied commit fails the same way a conflict does, but needs different advice. */
export function classifyPickFailure(output) {
  return /is now empty|nothing to commit/i.test(output) ? 'empty' : 'conflict';
}

/** The newest tag a patch bump can be derived from, ignoring prereleases and the like. */
export function pickNewestTag(tags) {
  return tags.find(tag => RELEASE_TAG.test(tag));
}

/** The version a hotfix branch names, rejecting anything a release could not carry. */
export function versionFromBranch(branch) {
  const match = HOTFIX_BRANCH.exec(branch);

  if (!match) {
    throw new HotfixError(
      `${branch} is not a hotfix branch.`,
      '--resume expects the hotfix/v<major>.<minor>.<patch> branch a previous run created.',
    );
  }

  return match[1].slice(1);
}

/**
 * Which recorded picks a branch does not already carry. `cherry-pick -x` records
 * the origin of each applied commit, so a pick that was aborted or skipped rather
 * than continued still shows as pending and is re-attempted instead of dropped.
 */
export function unappliedPicks(pending, log) {
  // The whole trailer line, so a message merely quoting the phrase cannot be read
  // as the commit having landed - which would drop it from the release silently.
  const trailer = sha => new RegExp(String.raw`^\(cherry picked from commit ${sha}\)$`, 'm');
  return pending.filter(sha => !trailer(sha).test(log ?? ''));
}
