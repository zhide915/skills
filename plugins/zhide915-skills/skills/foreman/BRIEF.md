# Brief

A builder reads only this file and the code. Write each field so that a reader with no part in the conversation can act on it. Point at files, issues, and commits instead of copying them.

```markdown
# <item>

Goal: <what the user wants, and why>
Criteria:
- <each criterion as a check: a command, or a behaviour to see>
Runtime claims: <the criteria that only a running app can show, or "none">
Base: <base>. Branch: <branch>. Worktree: <full path>.
Read first: <files, issues, and commits>
Off-limits: <files and behaviour that stay as they are>
Decided: <each decision of the conversation, with its reason>
Stop when: a criterion cannot be met as written, the work needs an off-limits file, or the goal is not clear.
```

A correction brief keeps each field, and adds this field:

```markdown
Correction: <each Must fix finding and each failed claim, with its path:line and its evidence>
```
