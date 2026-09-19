# skills

One home for my personal skills.

## How it works

This repository is a Claude Code plugin marketplace named `zhide915`. The
`.claude-plugin/marketplace.json` file lists the plugins, and each plugin is in
its own directory under `plugins/`.

The marketplace contains the following plugin:

| Plugin | Contents |
|--------|----------|
| `plugins/zhide915-skills` | Skills and agents |

The source that you add the marketplace from determines how the plugin loads:

| Source | How the plugin loads | When edits take effect |
|--------|----------------------|------------------------|
| GitHub | From a copy in the plugin cache | After you run `claude plugin update`. You get only pushed commits. |
| A clone | In place, from the working tree | The next time that you start a session, or when you run `/reload-plugins`. You get uncommitted edits too. |

A machine registers `zhide915` from one source at a time: a clone for
development, or GitHub everywhere else. To change the source, see
[Switch the marketplace source](#switch-the-marketplace-source).

## Install from GitHub

To install the plugin from GitHub, run the following commands:

```sh
claude plugin marketplace add zhide915/skills
claude plugin install zhide915-skills@zhide915
```

### Update the plugin

To get new commits, run the following commands:

```sh
claude plugin marketplace update zhide915
claude plugin update zhide915-skills
```

To get updates automatically instead, run `/plugin`, select **Marketplaces**,
select `zhide915`, and then select **Enable auto-update**.

## Install from a clone

To test edits without committing them, install the plugin from a clone:

```sh
claude plugin marketplace add PATH_TO_REPO
claude plugin install zhide915-skills@zhide915
```

Replace `PATH_TO_REPO` with the path to your clone.

### Load your edits

When you install from a clone, you don't need to update the plugin. Edits take
effect the next time that you start a session.

To load an edit into a running session, run `/reload-plugins`.

## Switch the marketplace source

The steps depend on the direction of the switch.

### Switch from GitHub to a clone

To switch from GitHub to a clone, add the marketplace again from the clone:

```sh
claude plugin marketplace add PATH_TO_REPO
```

Replace `PATH_TO_REPO` with the path to your clone.

The clone replaces GitHub as the source, and the plugin stays installed.

### Switch from a clone to GitHub

Claude Code rejects a GitHub source for a marketplace that is registered from
a clone, so you must remove the marketplace first. Removing a
marketplace uninstalls its plugins, so you must also install the plugin again.

To switch from a clone to GitHub, run the following commands:

```sh
claude plugin marketplace remove zhide915
claude plugin marketplace add zhide915/skills
claude plugin install zhide915-skills@zhide915
```
