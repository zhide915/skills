---
name: wrap-up
description: End a session. Park open work, then remove the leftovers that you choose.
disable-model-invocation: true
---

This skill ends a session. It parks open work, then removes the **leftovers** that the user chooses. A leftover is a thing that this session made, started, installed, or changed, and that still exists. Examples are a process, a container, a worktree, a branch, a stash, a `.scratch/` folder, and a setting.

## Rules

- Keep uncommitted changes as they are. A reset or a restore can delete the work of the user.

## Steps

1. **List**: List each leftover, with the command in this conversation that made it. Leave out what the user or another session made.

   Done when each leftover has its command.
2. **Park**: Run `zhide915-skills:handoff` for each open item. Do this before any removal, so that each handoff points at files that exist.

   Done when each open item has a handoff.
3. **Ask**: In one message, ask the user to remove or to keep each leftover. Recommend to keep unpushed work, stashes, handoffs and their files, and running agents.

   Done when the user chose for each leftover.
4. **Remove**: Remove each leftover that the user chose, with a command that touches only that leftover. Then list the leftovers again.

   Done when the list holds only the kept leftovers, and the user has the path of each handoff.
