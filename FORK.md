# Fork Notes

This fork tracks [pingdotgg/t3code](https://github.com/pingdotgg/t3code). Source of truth for *what* diverges is git; this file captures *why* and *rebase gotchas*.

## Divergence categories

- **Desktop/marketing removal** — `apps/desktop` and `apps/marketing` stripped out (`e649ac1d`). Policy lives in [AGENTS.md](./AGENTS.md#fork-maintenance); rebase impact below.
- **Agent docs** — local edits to `AGENTS.md`.

## Rebase gotchas

- _(add new gotchas here as you hit them — one line each, with the offending upstream commit/PR if useful)_

## When to add to this file

Only add an entry when a change is **non-obvious from the diff** or has bitten you during a rebase. Routine features/fixes belong in commit messages, not here.
