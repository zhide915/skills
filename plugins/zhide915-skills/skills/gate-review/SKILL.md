---
name: gate-review
description: Give an Approve or Block verdict on the exact head of a branch or a pull request, from a fresh reviewer. Use when the user asks for a verdict, such as "approve or block" or "is it ready to merge".
argument-hint: "[branch, pull request number, or url]"
---

This skill gives an Approve or Block verdict on one head SHA of a branch or a pull request. A **fresh** reviewer gives the verdict: an agent with no context from the session that wrote the change. The reviewer follows `REVIEWER.md`. The skill judges committed work only, and keeps the code as it is.

## Steps

Load `zhide915-skills:report` first.

1. **Pin**: Find the head SHA, the base, and their merge-base. Use the head and the base that the caller names first.
   - For a pull request: read `gh pr view <n> --json headRefOid,baseRefName,isCrossRepository`. Then run `git fetch origin <base> pull/<n>/head`, because a plain fetch misses a head from a fork.
   - For a branch: run `git fetch`, and compare the current head with the default branch.
   - If the diff from the merge-base to the head is empty: report `Nothing to review.`

   Done when you have the head SHA and the merge-base.
2. **Gather**: Find the specification: the ticket or plan that the caller names, or else the issues that the pull request closes. Make a worktree at the head with `git worktree add --detach <worktree> <head>`, because the checkout can hold uncommitted code.

   Done when the worktree holds the head, and you have the specification or know that there is none.
3. **Review**: Start a fresh agent. Give it the text of `REVIEWER.md` as it is. Then give it the worktree, the head, the merge-base, the specification, and the fork status.
   - If no fresh agent can start: stop. The author cannot grade its own work.

   Done when the reviewer returned its findings and its criteria table.
4. **Judge**: The verdict is Block if a Must fix finding stays or a criterion is Fail. Else, the verdict is Approve. Remove the worktree.

   Done when you have the verdict, and the worktree is gone.

## Report

```markdown
Block at `abc1234`: 1 Must fix (crash on empty input). 1 of 2 criteria pass.

## Must fix
- `src/parse.ts:40`: `tokens[0]` is undefined when the input is empty.

## Criteria
| Criterion | Status | Evidence |
|---|---|---|
| Parses an empty file | Fail | Ran at `abc1234`: `npm test -- parse` |
| Keeps comments | Pass | Ran at `abc1234`: `npm test -- comments` |

## Consider
- `src/parse.ts:12`: the token list is copied twice.

## Dismissed
- `src/lex.ts:8`: style only.
```
