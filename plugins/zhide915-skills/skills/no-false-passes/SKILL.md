---
name: no-false-passes
description: Find tests that pass when their rule breaks, rewrite them, and prove that each one goes red. Use when the user asks if the tests catch bugs, or a builder hardens the tests of its branch.
argument-hint: "[path, revision range, or pull request]"
---

This skill finds each **false pass**, rewrites the test, and proves that it goes **red** when its **rule** breaks. The rule of a test is the behaviour that its name promises. A false pass is a test that stays green after its rule breaks. To prove a test, break its rule in the code, and see the test go red on its assertion. A crash or a timeout is not red.

## Rules

- Edit only tests and their helpers.
- Break code only in a proof worktree, so that the code of the user stays safe.

## Steps

1. **Bound**: Use the scope that the caller names. Else, use the tests that the branch adds or changes. Run these tests one time, and record each test that already fails.
   - If the scope holds no test: say so, and stop.

   Done when you have each test and its result.
2. **Find**: Mark each test that shows a pattern of a false pass:
   - No assertion, or only a truthiness assertion.
   - A check that a mock was called, without its arguments.
   - An expected value from the code under test.
   - A call into private internals.

   Done when each test is marked or cleared.
3. **Rewrite**: Rewrite each marked test where it lives. Call the code as its users do. Assert a literal value or an effect that you can see. Take the expected value from the rule: the specification, a document, an issue, or the test name.
   - If a test cannot have such an assertion: mark it for deletion.

   Done when each marked test is rewritten or marked for deletion.
4. **Prove**: Prove each rewritten test and each new test of the branch, with at most 20 breaks. Make the proof worktree with `git worktree add --detach <worktree> HEAD`. Copy into it each rewritten test and each uncommitted source file. Stage the copies with `git -C <worktree> add -A`, so that a checkout undoes only a break. For each test, break its rule with one edit that compiles, and run the test. Undo the break with `git -C <worktree> checkout -- .`.
   - If a rewritten test fails before any break: it can show a real bug. Keep it, and tell the caller.
   - If a test stays green: rewrite it again. Delete it if it is marked for deletion.
   - If the 20 breaks are spent: tell the caller which tests are not proven.

   Done when each test went red, was deleted, or is named as not proven.
5. **Remove**: Remove the proof worktree with `git worktree remove --force <worktree>`. The force is safe, because the worktree holds only copies.

   Done when the proof worktree is gone.
