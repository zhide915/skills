---
name: wrap-up
description: End a session. Hand off open work, remove the leftovers that you choose, and propose lessons from repeated corrections.
disable-model-invocation: true
---

This skill ends a session. It parks open work, removes the **leftovers** that the user chooses, and proposes lessons. A leftover is something that this session made, started, installed, or changed, and that still exists. Examples are a process, a container, a worktree, a branch, a stash, a `.scratch/` folder, and a setting.

## Rules

- Keep uncommitted changes as they are. A reset or a restore can delete the work of the user.

## Steps

Load `zhide915-skills:report-style` first.

1. **List**: List each leftover, with the command in this conversation that made it. Leave out what the user or another session made.

   Done when each leftover has its command.
2. **Park**: Run `zhide915-skills:handoff` for each open item. Do this before any removal, so that each handoff points at files that exist.

   Done when each open item has a handoff.
3. **Learn**: Turn each correction that the user gave two or more times into a lesson. Aim the lesson at the first place that fits:
   1. A script or a check.
   2. The skill that caused the correction.
   3. The agent instructions of the project.
   4. The global instructions of the user.

   Done when each repeated correction has a lesson.
4. **Ask**: Give one message with a Your call for each leftover and each lesson. A leftover has the options Remove and Keep. A lesson has the options Apply and Skip. Recommend Keep for unpushed work, stashes, handoffs and their files, and running agents.

   Done when the user gave the letters.
5. **Act**: Remove each leftover that the user chose, with a command that touches only that leftover. Apply each lesson that the user chose. Then list the leftovers again.

   Done when the new list holds only the kept leftovers.

## Report

```markdown
Session wrapped. 1 item handed off, 3 leftovers removed, 1 lesson applied.

## Handed off
- csv-export: `.scratch/handoff/20261013-1530-csv-export.md`

## Cleanup
- Removed: the dev server on port 3000, `.scratch/worktrees/csv-export`, the stash `stash@{0}`.
- Kept: branch `csv-export`, because it is not pushed.

## Lessons
- Applied to `commit/SKILL.md`: subjects follow `git log`.
```
