# Roadmap

This file lists future work for this repository. `README.md` describes only
the present.

| Trigger | Build |
|---------|-------|
| A group of skills needs to be turned on or off separately from the rest. | **Second plugin**: a new folder under `plugins/`, and a new entry in `marketplace.json`. |
| The flat list of skills gets hard to scan. | **Category folders**: subfolders under `skills/`, each listed in the `skills` field of `plugin.json`. |
| A skill can't work without a hook or a Model Context Protocol (MCP) server. | **Hooks or MCP servers**: the hook or server configuration inside the plugin. |
| Someone else installs the marketplace and needs updates only when you release. | **Release versions**: a `version` field in `plugin.json` that you bump on each release. `CLAUDE.md` says `plugin.json` carries no `version`, so amend that rule first. |
| A pushed commit breaks an install from GitHub. | **Validation in CI**: a CI check that runs `claude plugin validate`. |
| You adopt a second agent harness. | **Second agent harness**: a link from `plugins/zhide915-skills/skills` into that harness's skills folder. |
