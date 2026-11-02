---
name: foreman
description: Take a goal from this conversation to reviewed branches, through builder, reviewer, and tester agents.
argument-hint: "[goal, ticket, or plan]"
disable-model-invocation: true
---

This skill takes a goal from this conversation to reviewed branches. You plan and judge, and fresh agents do the work: the builder writes the code, the reviewer judges it, and the tester runs it. A **brief** is the whole input of one builder. The builder had no part in this conversation, so the brief carries each thing that the conversation decided. A **round** is one more builder run on a correction brief.

## Rules

- You write no code. Each change comes from a builder.
- An item stops after three rounds, or after two rounds that make no progress.
- Ask the user when an action needs their consent, when a brief must change, or when you are not sure what they want.
- The main checkout is the parent folder of `git rev-parse --path-format=absolute --git-common-dir`. Before you write under its `.scratch/` folder, make sure that `.scratch/.gitignore` holds the line `*`.

## Steps

1. **Brief**: Split the goal into items. Size each item so that one builder can finish it in one context. Write a brief for each item from `BRIEF.md`, to `.scratch/foreman/<run>/<item>.md` in the main checkout. Show the briefs to the user, and update them from the reply.
   - If the goal is a metric: write a script that measures it. Put the script in each brief as a check. Freeze the script when two runs on the same code agree.

   Done when the user approved each brief.
2. **Build**: For each brief, run `git fetch`, then `git worktree add <main checkout>/.scratch/worktrees/<item> -b <branch> origin/<base>`. Spawn the agent `zhide915-skills:builder` with the path of the brief. Spawn builders in parallel when their briefs touch different files.

   Done when each builder returned a head or a stop.
3. **Verify**: At each head, run the checks of the brief yourself. Spawn the agent `zhide915-skills:reviewer` with the worktree, the head, the base, and the path of the brief. Spawn the agent `zhide915-skills:tester` with the worktree and the runtime claims of the brief. Turn each Block, each failed claim, and each worse metric into a correction brief. Then do step 2 again for that item.

   Done when each item has an Approve and passed claims at its head, or the item stopped.
4. **Close**: Remove each worktree of this run, and keep each branch. Tell the user the state of each item, its branch and head, and each question that is open.

   Done when each item has a state, and no worktree of this run remains.
