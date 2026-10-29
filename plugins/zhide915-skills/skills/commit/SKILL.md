---
name: commit
description: Commit the current changes as atomic conventional commits. Use when the user asks to commit.
argument-hint: "[worktree]"
---

This skill commits the current changes as **atomic** commits. An atomic commit has one reason, and you can revert it alone. Stage each file by path with `git add -- <path>`, so that strays stay out: secrets, scratch files, debug code, and build output.

## Steps

Load `zhide915-skills:report-style` first. Work in the worktree that the caller names, or else in the checkout.

1. **Select**: If the index holds changes, use the index as it is. Else, stage each change except the strays.
   - If nothing changed: report `Nothing to commit.`

   Done when you can name each staged file.
2. **Sweep**: Run `zhide915-skills:no-secrets` on the staged changes.
   - If the sweep finds a hit: stop before any commit.
   - If the index holds a stray: unstage it with `git restore --staged -- <path>`. List it under Left out.

   Done when the sweep is clean, and you can give the reason for each hunk.
3. **Split**: Group the files into atomic commits. Order the commits so that each one needs only earlier commits.
   - If one file holds two reasons: keep the file in one commit, and say so in the report.
   - If the user staged part of a file: commit the index as one commit. Staging the file again adds the unstaged part.

   Done when each group has its files and a subject.
4. **Commit**: Commit each group in turn. Use the message style that `git log` shows. With no style, the subject is `type(scope): summary` in the imperative, at most 72 characters. The body says why, in one or two lines.
   - If a hook fails: stop, and quote its message.
   - If a hook changes files: stage those files, and commit again.

   Done when each group is committed.

## Report

```markdown
Committed 2 commits on `main`.

## Commits
- `abc1234` feat(cli): add --dry-run
- `def5678` docs(readme): document --dry-run

## Left out
- `debug.log`: scratch file.
```
