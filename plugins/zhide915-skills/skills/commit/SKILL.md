---
name: commit
description: Commit changes as atomic conventional commits, after a secret scan. Use when the user or another skill asks to commit.
argument-hint: "[worktree]"
---

This skill commits changes as **atomic** commits. An atomic commit has one reason, and you can revert it alone. A **stray** is a file that belongs in no commit: a secret, a scratch file, debug code, or build output. Stage each file by its path, so that each stray stays out.

## Steps

1. **Stage**: Work in the worktree that the caller names, or else in the current checkout. If the index holds changes, keep the index as it is. Else, stage each changed file except the strays, with `git add -- <path>`.
   - If nothing changed: say so, and stop.

   Done when you can name each staged file and its reason.
2. **Scan**: Run `zhide915-skills:no-secrets` on the staged changes. Unstage each stray with `git restore --staged -- <path>`.
   - If the scan finds a hit: stop before any commit.

   Done when the scan is clean, and the index holds no stray.
3. **Split**: Group the staged files into atomic commits. Order the groups so that each one needs only earlier groups.
   - If the user staged part of a file: commit the index as one commit. Staging the file again adds the unstaged part.
   - If one file holds two reasons: keep the file in one commit, and tell the user.

   Done when each group has its files and a subject.
4. **Commit**: Commit each group in order. Follow the message style that `git log` shows. With no style, the subject is `type(scope): summary` in the imperative, at most 72 characters. The body says why, in one or two lines.
   - If a hook fails: stop, and quote its message.
   - If a hook changes files: stage those files, and commit again.

   Done when each group is a commit, and you named each commit and each stray that you left out.
