---
name: foreman
description: "Work toward a goal, a set of items or a metric, in loops of fresh agents, and stop for your call at each risk."
argument-hint: "[goal, or resume <run>]"
disable-model-invocation: true
---

This skill works toward a goal in loops of fresh agents. It splits the goal into items, gives each item a **brief**, and judges each result. Progress is a new commit whose checks pass, or a better metric.

## Rules

- Fresh agents make each change, and you write no code.
- Make each decision that you can undo yourself. Log it in `decisions.md`, with its reason and its undo.
- **Stop** an item and give a Your call when one of these occurs:
  - An action needs a letter.
  - The goal or the criteria must change.
  - Two loops in sequence make no progress.
  - The item reaches its loop limit.
  - You are not sure what the user wants.

## Steps

Load `zhide915-skills:report-style` first.

1. **Agree**: Agree on the goal, its checks, and a loop limit for each item, 3 by default. Ask once for the missing values. Make the run folder `.scratch/foreman/<run>/`, and log the agreement in its `decisions.md`.
   - If the argument is `resume <run>`: read `decisions.md` and `report.md` of that run. Apply the letters, and go to the Loop step.
   - If the goal is a metric: write a script that measures it. Freeze the script when two runs on the same code agree. A changed script makes the numbers mean nothing.

   Done when the goal, the checks, and the limit are in `decisions.md`.
2. **Brief**: Split the goal into items. Size each item to fit one context of one fresh agent. For each item, run `git fetch`, and make its worktree with `git worktree add <worktree> -b <branch> origin/<base>`. Save a brief from the template below in `briefs/`.
   - If you cannot fill a field: the item is not ready. Give a Your call.

   Done when each ready item has a brief and a worktree.
3. **Loop**: Start a fresh agent on your model for each brief. When an agent reports, run its checks yourself. Then run `zhide915-skills:verdict` on its branch, with its `predicate.md`. Give its runtime claims to `zhide915-skills:field-test` in a fresh agent on your model. Each Block or failed claim becomes a correction brief: one loop.
   - If the goal is a metric: keep a loop only if the metric improves and the checks pass. Else, give a brief to revert the loop.

   Done when each item is approved or stopped.
4. **Finish**: Remove each worktree, and keep the branches. Save the report as `report.md` in the run folder.

   Done when each item has a state in the report.

## Brief

```markdown
From: zhide915-skills:foreman
Goal: <the goal, and the one concern of this item>
Specification: <the criteria, or the metric and its checks>
Base: <base>. Branch: <branch>.
Worktree: <full path>. Write code only here, because other agents share the checkout.
Off-limits: <the files that you must not touch>
Stop and report when: an action needs a letter, the goal or the criteria must change, or you are not sure what the user wants.
Run: zhide915-skills:implement. Report the branch head and the path of predicate.md.
```

## Report

```markdown
2 of 3 items built and approved, not pushed. 1 call needs you.

## Items
| Item | State | Branch |
|---|---|---|
| csv-export | approved | `csv-export` at `abc1234` |
| api-auth | stopped: needs a schema change | `api-auth` at `def5678` |

## Run
- Loops: 4 of 9. Decisions: 6 in `.scratch/foreman/q4-polish/decisions.md`.
```
