# CLAUDE.md

Guidance for agents working in this repo. `README.md` explains usage; this file
covers what bites: hazards you can't see from any single file.

## An install from a clone is live

When the `zhide915` marketplace is added from a clone (the development
setup), the plugin loads **in place** from the working tree, uncommitted edits
included.

- An edit reaches every session on that machine, in every project, at its next
  session start or `/reload-plugins`.
- A skill's or agent's `description` is live the moment it is saved: draft the
  body first, the description last.

Test: before saving a file here, you can say which sessions will see it and
when.

## An install from GitHub is a copy

When the marketplace is added from GitHub, the plugin directory is **copied**
into the plugin cache, and only pushed commits arrive.

- Keep every skill self-contained: everything a `SKILL.md` points at lives
  inside that skill's folder. Paths that leave the plugin directory work in
  place and break in the copy.
- Leave `version` out of `plugin.json`: a pinned version freezes installs from
  GitHub until it is bumped; without one, each commit is an update.

Test: a skill that works in place still works when installed from GitHub at
the pushed commit.

## Names are an interface

User settings outside this repo key on the marketplace name `zhide915` and the
plugin ID `zhide915-skills@zhide915`. Renaming either silently disables the
plugin everywhere it is installed. Treat a rename as a breaking change and say
so in the commit.

## Conventions

- One skill per folder, `plugins/zhide915-skills/skills/<name>/SKILL.md`, with
  frontmatter `name` equal to `<name>`. Agents are single files in `agents/`.
- A `description` is loaded on every turn of every project, so every word
  pays rent: say what the skill is, then "Use when…" with one trigger per
  distinct case.
- Keep skill prose agent-agnostic: plain Markdown any agent harness can
  follow.
- Skill scripts are Node.js on the stdlib only, with no `package.json`.
- `README.md` describes only the present. Future work goes in `ROADMAP.md` as
  a row with a trigger, built when the trigger occurs, not before.
