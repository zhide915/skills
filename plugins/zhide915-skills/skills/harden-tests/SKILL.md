---
name: harden-tests
description: Find hollow tests, rewrite them, and prove that each one goes red when its rule breaks. Use when the user asks if the tests catch bugs or wants them stronger, or when another skill hardens the tests of its changes.
argument-hint: "[path, revision range, or pull request]"
---

This skill finds **hollow** tests, rewrites them, and proves that each one goes **red** when its **rule** breaks. The rule of a test is the behaviour that its name promises. A hollow test stays green after its rule breaks. To prove a test, break its rule in the code, and see the test go red on its assertion. A crash or a timeout is not red.

## Rules

- Edit only tests and their helpers.
- Break code only in a proof worktree, so that the code of the user stays safe.

## Steps

Load `zhide915-skills:report` first.

1. **Bound**: Use the scope that the caller names. Else, use the tests that the branch adds or changes. Run these tests one time, and record each test that already fails.
   - If the scope holds no test: report `Nothing to harden.`

   Done when you have each test and its result.
2. **Find**: Mark each test that shows one of these hollow patterns:
   - No assertion, or only a truthiness assertion.
   - A check that a mock was called, without its arguments.
   - An expected value from the code under test.
   - A call into private internals.

   Done when each test is marked or cleared.
3. **Rewrite**: Rewrite each marked test where it lives. Call the code as its users do. Assert a literal value or an effect that you can see. Take the expected value from the rule: the specification, a document, an issue, or the test name.
   - If a test cannot have such an assertion: mark it for deletion.

   Done when each marked test is rewritten or marked for deletion.
4. **Prove**: Prove each rewritten test and each new test of the branch, for at most 20 breaks. First make the proof worktree with `git worktree add --detach <worktree> HEAD`. Copy into it each rewritten test and each uncommitted source file. Stage the copies with `git -C <worktree> add -A`, so that a checkout undoes only a break. Then, for each test:
   1. Break the rule of the test with one edit that compiles.
   2. Run the test, and see it go red.
   3. Undo the break with `git -C <worktree> checkout -- .`.
   - If a rewritten test fails before any break: it can show a real bug. Keep it, and give a Your call.
   - If a test stays green: rewrite it again. Delete it if it is marked for deletion.
   - If the 20 breaks are spent: mark each unproven test Open.

   Done when each test went red, was deleted, or is Open.
5. **Remove**: Remove the proof worktree with `git worktree remove --force <worktree>`. The force is safe, because the worktree holds only copies.

   Done when the proof worktree is gone.

## Report

```markdown
1 test rewritten and proven, 1 deleted, 0 Open.

## Rewritten
| Test | Now checks | Goes red when |
|---|---|---|
| `parse.test.ts` "parses dates" | the literal date `2026-01-31` | the month offset is removed |

## Deleted
- `util.test.ts` "runs": stayed green when `format` returned an empty string.
```
