---
name: commit
description: Commit the current changes as atomic conventional commits. Use when the user asks to commit.
---

Turn the current changes into conventional commits, one per atomic change. A change is **atomic** when it has one reason and reverts on its own.

## Steps

1. **Select**: the **selection** is what this run commits, and staging is how the user names it.
   - **Something is staged**: the selection is exactly that. The rest of the working tree stays as it is.
   - **Nothing is staged**: the selection is the whole working tree, minus strays. A **stray** has no place in history: a secret, a scratch file, a debug leftover. Read every untracked file before staging it.
2. **Split**: divide the selection into atomic changes.
3. **Commit**: for each change in turn, stage only what belongs to it, then commit it with the message below.

## Done when

`git status` shows nothing left of the selection.

## Message

- **Subject**: `type(scope): summary`, imperative, ≤72 chars. Include the scope when one is obvious, spelled as `git log` spells it.
- **Body**: always present, always brief. The diff shows what changed; the body says why.
- **Footer**: only when the change calls for one: an issue ref, or `BREAKING CHANGE:` paired with `!` before the subject's colon.
