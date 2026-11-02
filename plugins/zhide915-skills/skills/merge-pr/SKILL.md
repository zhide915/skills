---
name: merge-pr
description: Squash-merge a pull request at the head that its checks and a fresh reviewer approved, then tick its issue criteria.
argument-hint: "[pull request number or url]"
disable-model-invocation: true
---

This skill squash-merges a pull request, then ticks the criteria of its issues. It merges only at the **pinned** head: the SHA where the checks passed and a fresh reviewer approved. Only the words "merge anyway" from the user override a Block.

## Steps

1. **Read**: Run `gh pr view <n> --json state,isDraft,mergeable,headRefOid,baseRefName,closingIssuesReferences`. The head SHA is `headRefOid`.
   - If the pull request is a draft, is closed, or is `CONFLICTING`: stop.

   Done when you have the head SHA, the base, and the closing issues.
2. **Watch**: Run `gh pr checks <n> --watch` in the background, because a foreground command ends at 10 minutes.
   - If a check fails: stop, and name the check.
   - If no check exists, but `.github/workflows/` does: ask the user, because the checks can still be starting.

   Done when each check passed.
3. **Review**: Spawn the agent `zhide915-skills:reviewer` with the pull request number. Skip the review if this session has an Approve from that agent for the same head SHA.
   - If the verdict is Block: stop, unless the user said "merge anyway".

   Done when the head SHA has an Approve and is the pinned head, or the user said "merge anyway".
4. **Merge**: Merge at the pinned head with `gh pr merge <n> --squash --match-head-commit <full head sha>`. The flag refuses the merge if anyone pushed after the review.
   - If `gh` refuses: stop, and quote its message.

   Done when `gh pr view` shows the pull request as merged.
5. **Tick**: Read each closing issue again just before you edit it. Tick each criterion that the reviewer marked as passed.
   - If a criterion failed or is open: ask the user whether to keep the issue open or to reopen it.

   Done when each criterion has a tick, or the user decided its issue.
