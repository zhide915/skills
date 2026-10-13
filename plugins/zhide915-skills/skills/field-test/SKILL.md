---
name: field-test
description: Run a change on its real surface and give evidence for each claim. Use when the user asks to try a change for real or to show that it works.
argument-hint: "[claims]"
---

This skill runs a change on its real **surface**, and gives evidence for each claim. The surface is where users meet the change: an app, a service, or a command on real input. Before you test a claim, find a **sign** on the surface, because a pass on old code proves nothing. A sign is a mark that only the changed code has, such as a string that only the diff adds. The skill reports failures, and leaves the fixes to the user.

## Rules

- Write only your own data, and only on a local or a test backend. Treat each backend that other people use as read-only, such as production or shared staging.
- A login, a form submit, an email, and a webhook are writes.

## Steps

Load `zhide915-skills:report` first.

1. **Bound**: Use the claims that the caller names. Else, use the behaviour of the branch that no test covers. For each claim, write its surface and the result that you expect.
   - If there are no claims: report `Nothing to test.`

   Done when each claim has a surface and an expected result.
2. **Start**: Start the surface in the worktree that the caller names. Else, make one with `git worktree add --detach <worktree> HEAD`, because uncommitted files are not the head. Record each process that you start and each setting that you change. Then find the sign in what the surface serves, such as the bundle, the binary, or the APK.
   - If the surface writes at startup, such as a migration: connect it only to local backends.
   - If you find no sign: mark each claim Open, with `Unproven: no sign`.

   Done when a sign shows that the surface runs the changed code, or each claim is Open.
3. **Test**: Test each claim. Save the evidence in `.scratch/field-test/<short sha>/`. Use a separate browser profile, because the cookies of the user act as the user.
   - If a claim fails: see it fail by a second method, such as a script and a screenshot. Then mark it Fail.
   - If a claim needs a write to a shared backend: mark it Open. Give a Your task with the steps.

   Done when each claim has a status and evidence.
4. **Restore**: Stop each process that you started, by its recorded process ID. Restore each setting that you changed. Delete your test data, and remove the worktree that you made.

   Done when each recorded item is restored, or the report names it.

## Report

```markdown
1 Pass, 1 Fail (export drops the header row), 0 Open.

## Claims
| Claim | Status | Evidence |
|---|---|---|
| `--dry-run` writes no file | Pass | Ran at `abc1234`: `.scratch/field-test/abc1234/dry-run.sh` |
| Export keeps the header row | Fail | Ran at `abc1234`: `.scratch/field-test/abc1234/export.sh` |

## Run
- CLI at `abc1234`. Sign: the `--dry-run` help text in `dist/cli.js`.
```
