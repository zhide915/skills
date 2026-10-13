# CLAUDE.md

- `README.md`: read it before you install, update, or switch the marketplace source.

## Conventions

- Write scripts in Node.js with the standard library only. The repository has no `package.json`.
- Keep Markdown unwrapped: each paragraph or list item is one line, and the editor soft-wraps it.
- `README.md` describes only the present. Put future work in `ROADMAP.md` as a row with a trigger, and build it when the trigger fires.

## Editing under `plugins/`: live and copied

The plugin installs in two ways, and each edit must work in both.

- **Live**: A marketplace added from a clone loads the plugin from the working tree, with uncommitted edits. An edit reaches each session on this computer, in each project, at the next session start or `/reload-plugins`.
- **Copied**: A marketplace added from GitHub copies the plugin folder into the plugin cache. Only pushed commits arrive. A path that leaves the plugin folder works live and breaks in the copy.
- `plugin.json` has no `version`, so each commit is an update. A pinned version freezes the copy until someone bumps it.

Done when: before you save a file, you can say which sessions see it, and when.

## Writing a skill

- Write in ASD-STE100, and follow `mattpocock-skills:writing-for-agents`.
- Keep each skill **self-contained**: each path that a `SKILL.md` names is in the folder of that skill, so the skill works in the copy.
- Write the body first and the description last. Each turn of each project loads the description, so each word must earn its place.
- Write plain Markdown that any agent harness can follow.
- Put each agent in one file in `agents/`.
- Run `node scripts/check-skill.mjs`. Its header lists the rules that it checks.

Done when: the checker prints nothing, and the skill that works live also works copied at the pushed commit.

## Renaming: breaking

Settings and commands outside this repository use these names:

- The marketplace name `zhide915` and the plugin ID `zhide915-skills@zhide915`. User settings use both, so a rename disables the plugin, with no warning, on each computer that has it.
- The folder name of a skill. It is the slash command `/zhide915-skills:<name>`.

Mark each rename as breaking in its commit.
