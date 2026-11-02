---
name: open-pr
description: Push the current branch, then open or update its pull request with a title and a body that you approve first.
argument-hint: "[base]"
disable-model-invocation: true
---

This skill pushes the current branch, and opens or updates its pull request after the user approves its text. The **PR diff** is `git diff origin/<base>...HEAD`: all that a reviewer sees. Each hunk of the PR diff belongs to the pull request. The title becomes the squash commit on the base.

## Steps

1. **Resolve**: Use the base that the user names. Else, use the base of the open pull request, or else the default branch. Run `git fetch`.
   - If the current branch is the base: ask the user for a branch name, and make the branch.

   Done when you know the base, and you are on another branch.
2. **Commit**: If there are uncommitted changes, ask the user which ones belong to the pull request. Run `zhide915-skills:commit` on those changes.
   - If `zhide915-skills:commit` stops: stop.

   Done when each change of the pull request is committed.
3. **Clean**: Read the PR diff for strays: secrets, scratch files, debug code, and changes for another purpose. Run `zhide915-skills:no-secrets` on `origin/<base>..HEAD`. Remove each stray in a new commit.
   - If the PR diff is empty: say so, and stop.
   - If the scan finds a hit: stop.

   Done when each hunk belongs to the pull request, and the scan is clean.
4. **Check**: Run the checks of the repository, such as its tests, its linter, and its type checker.
   - If a check fails: stop.
   - If a check cannot run: ask the user before the push.

   Done when each check passed, or the user accepted it.
5. **Push**: Run `git push -u origin HEAD`.
   - If the remote rejects the push: stop, and quote its message.

   Done when `git status` shows the branch up to date with its remote.
6. **Write**: Write the title as a conventional commit subject. Write the body from the template of the repository, or else with the skill `mattpocock-skills:pr`. Write for a reader who does not know these skills: give commands and outcomes.
   - Add `Closes #<issue>` for each issue that the pull request closes.
   - Give each result at the pushed SHA, such as "`npm test` passed at `abc1234`."
   - Say that the change is reviewed only with an Approve for the pushed SHA from `zhide915-skills:reviewer` in this session. Else, say that it is not reviewed at that SHA.
   - On an update, keep each section that a person wrote.
   - If the change shows in a UI: take a screenshot of each changed screen. If you cannot, tell the user.

   Done when you have the title, the body file, and each screenshot.
7. **Approve**: Show the user the title, the body, and each screenshot. Ask for each fact that only the user knows, such as the risk of a revert. Update the text from the reply.

   Done when the user approved the title, the body, and the screenshots.
8. **Post**: Run `gh pr create --base <base> --title <title> --body-file <file>`. For an open pull request, run `gh pr edit <n> --title <title> --body-file <file>`. Add `--attach '<path>#<alt text>'` for each screenshot.

   Done when `gh pr view` shows the text that the user approved.
