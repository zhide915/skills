---
name: merge-pr
description: Squash-merge a pull request after its checks pass and a fresh review approves its exact head, then tick the issue criteria.
argument-hint: "[pull request number or url]"
disable-model-invocation: true
---

This skill squash-merges a pull request, then ticks the criteria of its issues. It merges only at a **pinned** head: the SHA where the checks passed and a fresh review approved. Only the words **merge anyway** from the user override a Block.

## Steps

Load `zhide915-skills:report-style` first.

1. **Read**: Run `gh pr view <n> --json state,isDraft,mergeable,headRefOid,baseRefName,closingIssuesReferences`. The head SHA is `headRefOid`.
   - If the pull request is a draft, is closed, or is `CONFLICTING`: stop.

   Done when you have the head SHA, the base, and the closing issues.
2. **Watch**: Run `gh pr checks <n> --watch` in the background, because a foreground command ends at 10 minutes.
   - If a check fails: stop, and name the check.
   - If no check exists, but `.github/workflows/` does: give a Your call. The checks can still be starting.

   Done when each check passed.
3. **Review**: Run `zhide915-skills:verdict` on the pull request. Skip the review if this session has an Approve for this head SHA.
   - If the verdict is Block: stop, unless the user said merge anyway.

   Done when you have an Approve for the head SHA, or the user said merge anyway.
4. **Merge**: Merge at the pinned head with `gh pr merge <n> --squash --match-head-commit <full head sha>`. The flag refuses the merge if anyone pushed after the verdict.
   - If `gh` refuses: stop, and quote its message.

   Done when `gh pr view` shows the pull request as merged.
5. **Tick**: Read each closing issue again just before you edit it. Tick each criterion whose text matches a Pass row of the review.
   - If a criterion is Fail or Open: give a Your call to keep it open or to reopen the issue.

   Done when each criterion has a tick or a Your call.

## Report

```markdown
Merged PR #42 into `main` as `abc1234`. Closed #40, 2 of 2 criteria ticked.

## Issues
- #40: ticked "Exports CSV" and "Keeps column order".

## Run
- Approve at `def5678`. Checks: 3 passed.
```
