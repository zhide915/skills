---
name: implement
description: Build one ticket or agreed plan test-first into committed and reviewed work on a branch. Use when the user asks to implement a ticket or a plan, or a `zhide915-skills:orchestrate` brief names it.
argument-hint: "[ticket or plan]"
---

This skill takes one ticket or plan to committed and reviewed work on a branch. It chains the other skills of this plugin, so that the order lives in one place. The **predicate** is the list of checks that tells when the item is complete. Write it before any code.

## Rules

- Ask the user only in the Agree step. After that step, put each open question in the report.
- A **round** is a return to the Build step after a Block, a failed claim, or a real bug. Stop after three rounds.
- If a `zhide915-skills:orchestrate` brief started this run: the brief replaces the Agree step. The orchestrator does the Review and Field-test steps.

## Steps

Load `zhide915-skills:report` first.

1. **Branch**: Use the worktree that the caller names. Else, run `git fetch`, and make a worktree with `git worktree add <worktree> -b <branch> origin/<base>`. Do each later step in the worktree.

   Done when the worktree is on its branch.
2. **Plan**: Read the specification and the code that it touches. Write `.scratch/implement/<item>/predicate.md` in the main checkout, with these parts:
   - Each criterion as a check.
   - The runtime claims: the criteria that only a running app can show.
   - The files to change, and the seams where the tests call the code.
   - The approach, in a few sentences.
   - If the specification has no criteria: write them from the type of work. A fix needs a reproduction. A feature needs its user flows. A refactor keeps the suite green.

   Done when each criterion has a check and a seam.
3. **Agree**: Give one Your call that shows `predicate.md`. Add each unclear criterion, and each place where the plan and the code disagree. Update `predicate.md` from the letter.

   Done when the user gave the letter.
4. **Build**: Build test-first with `mattpocock-skills:tdd`, at the seams of `predicate.md`.
   - If the work needs a file or a check that `predicate.md` does not hold: stop. Say what you expected and what you found.

   Done when each check passes.
5. **Commit**: Run `zhide915-skills:commit`. Then run `zhide915-skills:harden-tests` and `zhide915-skills:tighten-writing` on the branch, and commit after each one.
   - If `zhide915-skills:commit` stops: stop.
   - If `zhide915-skills:harden-tests` finds a real bug that the specification rules out: start a new round.

   Done when `git status` in the worktree is clean.
6. **Review**: Run `zhide915-skills:gate-review` on the branch, with `predicate.md` as the specification.
   - If the verdict is Block: fix each Must fix finding and each Fail criterion in a new round.

   Done when the verdict is Approve.
7. **Field-test**: Give the runtime claims to `zhide915-skills:field-test` in a fresh agent, with the worktree.
   - If a claim fails: fix it in a new round.

   Done when each runtime claim has a status.
8. **Finish**: Run each check again at the head. Remove the worktree, and keep the branch.

   Done when each criterion has a status and evidence at the head.

## Report

```markdown
csv-export built: 3 commits, gate-review Approve at `abc1234`, not pushed. 2 of 2 criteria pass.

## Criteria
| Criterion | Status | Evidence |
|---|---|---|
| Exports CSV | Pass | Ran at `abc1234`: `npm test -- export` |
| Keeps column order | Pass | Seen at `abc1234`: export of `fixtures/orders.json` |

## Run
- Branch `csv-export` from `origin/main`. Predicate: `.scratch/implement/csv-export/predicate.md`. Rounds: 1.
```
