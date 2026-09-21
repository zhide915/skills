---
name: submit-pr
description: Open or update the pull request for the current branch. Use when the user wants a branch put up for review, or an existing PR brought up to date.
---

Put the current branch up for review as one pull request against the default branch: opened if new, updated if it exists.

## Steps

Every commit these steps make goes through `zhide915-skills:commit`.

1. **Branch**: when on the default branch, ask the user for a branch name and switch to it.
2. **Commit**: ask the user which uncommitted changes belong in the PR. Stage those and commit them, so the checks run on what the PR will contain.
3. **Sweep**: `git fetch`, then read the whole **PR diff**: `git diff origin/<default-branch>...HEAD`, everything the reviewer will see. Remove strays and commit the removal. A **stray** has no place in history: a secret, a scratch file, a debug leftover. Ask the user about any hunk you doubt, and wait for the answer.
4. **Check**: run the **checks**: whichever of lint, typecheck, and tests the project defines. On a failure, report the output and stop.
5. **Push**: `git push -u origin HEAD`.
6. **Submit**: write the title and description below from the whole PR diff. If `gh pr view` shows an open PR for the branch, `gh pr edit` it; otherwise `gh pr create`.

## Done when

- Every hunk of the PR diff belongs in the PR.
- `git status` shows nothing left to push.
- `gh pr view` shows an open PR for the branch with the title and description below.

## Title

A conventional commit subject: `type(scope): summary`, imperative, ≤72 chars. Squash-merge makes it the commit that lands on the default branch.

## Description

These `##` sections, in this order:

- **Summary**: a few bullets: the problem, and why this change solves it.
- **Related Issues**: `Closes #123`. Omit when there are none.
- **Verification**: evidence over claims. The checks with their results, or a note that the project defines none. Where the changed path has no test, manual steps a reviewer can reproduce.
- **Screenshots**: only for UI changes. `gh` cannot upload images, so leave a placeholder line for the user to replace with before/after screenshots.
