---
name: submit-pr
description: Push the current branch, then open or update its pull request with a title and a body that you approve first.
argument-hint: "[base]"
disable-model-invocation: true
---

This skill pushes the current branch, and opens or updates its pull request after the user approves its text. The **PR diff** is `git diff origin/<base>...HEAD`: all that a reviewer sees. Each hunk of the PR diff belongs to the pull request.

## Steps

Load `zhide915-skills:report-style` first.

1. **Resolve**: Use the base that the user names. Else, use the base of the open pull request, or the default branch. Run `git fetch`.
   - If the current branch is the base: give a Your call for a new branch name.

   Done when you have the base, and you are on another branch.
2. **Commit**: If there are uncommitted changes, give a Your call: which ones belong to the pull request? Stage those changes, and run `zhide915-skills:commit`.
   - If `zhide915-skills:commit` stops: stop.

   Done when each change of the pull request is committed.
3. **Sweep**: Read the PR diff for strays: secrets, scratch files, debug code, and changes for another purpose. Run `zhide915-skills:no-secrets` on `origin/<base>..HEAD`. Remove each stray in a new commit.
   - If the PR diff is empty: report `Nothing to submit.`
   - If the sweep finds a hit: stop.

   Done when each hunk belongs to the pull request, and the sweep is clean.
4. **Check**: Run the checks of the repository, such as its tests, its linter, and its type checker.
   - If a check fails: stop.
   - If a check cannot run: give a Your call before the push.

   Done when each check passed, or the user accepted it.
5. **Push**: Run `git push -u origin HEAD`.
   - If the remote rejects the push: stop, and quote its message.

   Done when `git status` shows that the branch is up to date with its remote.
6. **Write**: Write the title as a conventional commit subject, because the squash merge makes it the commit on the base. Write the body from the template of the repository, or else with `mattpocock-skills:pr`. Follow the Body section.
   - If the change shows in a UI: take a screenshot of each changed screen.
   - If you cannot take a screenshot: add a Your task to the Agree step.

   Done when you have the title, the body file, and each screenshot.
7. **Agree**: Give one Your call that shows the title, the body, and each screenshot. Add each fact that only the user knows, such as the risk of a revert.
   - If the user changes the text: update it, and give the Your call again.

   Done when the user approved all three.
8. **Submit**: Run `gh pr create --base <base> --title <title> --body-file <file>`. For an open pull request, run `gh pr edit <n> --title <title> --body-file <file>`. Add `--attach '<path>#<alt text>'` for each screenshot.

   Done when `gh pr view` shows what the user approved.

## Body

- Write for a reader who does not know these skills. Give commands and outcomes, without skill names or evidence labels.
- Add `Closes #<issue>` for each issue that the pull request closes.
- Give each result at the pushed SHA, such as "`npm test` passed at `abc1234`."
- Write `Reviewed:` only with a `zhide915-skills:verdict` result from this session for the pushed SHA. Else, write `Not reviewed at <sha>.`
- On an update, keep each section that a person wrote.

## Report

```markdown
PR #42 opened: https://github.com/owner/repo/pull/42. Pushed `feature` at `abc1234`.

## Run
- Branch `feature` on base `main`. Strays removed: `debug.log`.
```
