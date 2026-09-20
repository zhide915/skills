# CLAUDE.md

- `README.md`: read before installing, updating, or switching the marketplace
  source.

## Editing under `plugins/`: live and copied

The plugin is installed two ways, and an edit must survive both.

- **Live**: a marketplace added from a clone (the development setup) loads
  the plugin in place from the working tree, uncommitted edits included. An
  edit reaches every session on that machine, in every project, at its next
  session start or `/reload-plugins`.
- **Copied**: a marketplace added from GitHub copies the plugin directory into
  the plugin cache, and only pushed commits arrive. Paths that leave the
  plugin directory work live and break in the copy.
- `plugin.json` carries no `version`: a pinned version freezes the copy until
  it is bumped; without one, each commit is an update.

Done when: before saving a file, you can say which sessions will see it and
when.

## Writing a skill or agent: self-contained

- **Self-contained**: everything a `SKILL.md` points at lives inside that
  skill's folder, so it survives being copied.
- A `description` is loaded on every turn of every project and is live on
  save, so every word pays rent: write the body first, the description last.
  Say what the skill is, then "Use when…" with one trigger per distinct case.
- A skill's frontmatter `name` equals its folder name. Agents are single
  files in `agents/`.
- Keep the prose agent-agnostic: plain Markdown any agent harness can follow.

Done when: every path in the `SKILL.md` resolves inside its folder, and the
skill that works live still works copied at the pushed commit.

## Renaming: breaking

Things outside this repo key on these names:

- The marketplace name `zhide915` and the plugin ID
  `zhide915-skills@zhide915`: user settings key on both, and renaming either
  silently disables the plugin everywhere it is installed.
- A skill's folder name: it is the slash command `/zhide915-skills:<name>`
  that users and other documents invoke.

A rename is **breaking**: say so in the commit.

## Conventions

- Scripts are Node.js on the stdlib only, with no `package.json`.
- `README.md` describes only the present. Future work goes in `ROADMAP.md` as
  a row with a trigger, built when the trigger fires, not before.
