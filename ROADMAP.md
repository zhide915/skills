# Roadmap

This file lists future work for this repository. `README.md` describes only
the present. Build each item when its trigger occurs, not before.

The following table lists the planned work:

| Planned work | What it involves | Trigger |
|--------------|------------------|---------|
| Second plugin | A new folder under `plugins/` and a new entry in `marketplace.json` | A group of skills needs to be turned on or off separately from the rest. |
| Category folders | Subfolders under `skills/`, each listed in the `skills` field of `plugin.json` | The flat list of skills gets hard to scan. |
| Hooks or MCP servers | Hook or MCP server configuration inside the plugin | A skill can't work without one. |
| Release versions | A `version` field in `plugin.json` that you bump on each release | Someone else installs the marketplace and needs updates only when you release. |
| Validation in CI | A CI check that runs `claude plugin validate` | A pushed commit breaks an install from GitHub. |
| Second agent harness | A link from `plugins/zhide915-skills/skills` into that harness's skills folder | You adopt a second agent harness. |
