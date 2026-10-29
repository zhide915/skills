---
name: handoff
description: Write a handoff file from which a fresh session can continue an item. Use when the user wants to park a side thread, or when a session ends with work unfinished.
argument-hint: "[item]"
---

This skill writes a **handoff**: a file from which a fresh session continues an item. The fresh session has no context from this one. So the handoff points at things, such as a `file:line`, a SHA, a URL, or a command. A copy goes out of date, and a pointer stays current.

## Steps

Load `zhide915-skills:report-style` first.

1. **Write**: Fill the template below. Save it to `.scratch/handoff/<YYYYMMDD-HHMM>-<item>.md` in the main checkout. Put a step under Done only with its evidence. Put each other step under Next, so that the fresh session checks it again. Leave out empty sections and secrets.
   - If a handoff for the item exists: update it, and keep its name.
   - If the fresh session needs a file from a temporary folder or this conversation: copy it next to the handoff.

   Done when the file has each section that has content, and the last line.

## Handoff

```markdown
# <Item>

## Goal
<What the item must achieve.>

## Verify first
- `<repository path>` on `<branch>` at `<sha>`, pushed or not pushed. Uncommitted: `<files>`.
- Running: `<process>`. Stop it with `<command>`.

## Done
- <Step>: Ran at `<sha>`: `<command>`.

## Next
1. <The first thing to do.>

## Decisions
- <Decision>: <why>.

## Open questions
- <Question>.

Next session: check each line under Verify first, then start at Next.
```

## Report

```markdown
Handed off "csv-export": `.scratch/handoff/20261013-1530-csv-export.md`. To continue: clear the context, then give the fresh session this path.
```
