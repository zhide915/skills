# skills

One home for my personal skills.

## Install

```sh
claude plugin marketplace add zhide915/skills
claude plugin install zhide915-skills@zhide915
```

## Update

The plugin runs from a copy of the last pushed commit. To get new commits:

```sh
claude plugin marketplace update zhide915
claude plugin update zhide915-skills
```

To update automatically instead, run `/plugin`, select **Marketplaces**, select `zhide915`, and then select **Enable auto-update**.

## Develop

To test edits without committing them, add the marketplace from a clone:

```sh
claude plugin marketplace add PATH_TO_REPO
claude plugin install zhide915-skills@zhide915
```

The plugin then loads in place from the working tree, uncommitted edits included. Edits take effect at the next session start, or when you run `/reload-plugins`.

If the plugin is already installed from GitHub, run only the first command. The clone replaces GitHub as the source, and the plugin stays installed.

## Switch back to GitHub

Claude Code rejects a GitHub source for a marketplace that is registered from a clone, so remove the marketplace first. Removing it uninstalls the plugin, so install the plugin again:

```sh
claude plugin marketplace remove zhide915
claude plugin marketplace add zhide915/skills
claude plugin install zhide915-skills@zhide915
```
