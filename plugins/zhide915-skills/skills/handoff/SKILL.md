---
name: handoff
description: Write a handoff file from which a fresh session continues an item. Use when the user parks a side thread, or a session ends with work open.
argument-hint: "[item]"
---

This skill writes a **handoff**: a file from which a fresh session continues an item. The fresh session had no part in this one. So the handoff points at things that stay current, such as a `file:line`, a SHA, a URL, or a command. A copy goes out of date, and a pointer does not.

## Steps

1. **Write**: Fill the template in the Template section. Save it to `.scratch/handoff/<YYYYMMDD-HHMM>-<item>.md` in the main checkout. The main checkout is the parent folder of `git rev-parse --path-format=absolute --git-common-dir`. Before you write, make sure that `.scratch/.gitignore` holds the line `*`. Put a step under Done only with its evidence. Put each other step under Next, so that the fresh session checks it again. Leave out empty sections and secrets.
   - If a handoff for the item exists: update it, and keep its name.
   - If the fresh session needs a file from a temporary folder or this conversation: copy it next to the handoff.

   Done when each section that has content is filled, and the user has the path.

## Template

```markdown
# <Item>

## Goal
<What the item must achieve.>

## Verify first
- `<repository path>` on `<branch>` at `<sha>`, pushed or not pushed. Uncommitted: `<files>`.
- Running: `<process>`. Stop it with `<command>`.

## Done
- <Step>: `<command>` at `<sha>` showed <result>.

## Next
1. <The first thing to do.>

## Decisions
- <Decision>: <why>.

## Open questions
- <Question>.

Next session: check each line under Verify first, then start at Next.
```
