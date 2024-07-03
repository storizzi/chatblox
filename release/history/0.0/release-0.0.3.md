# Release 0.0.3

## General Information

* Version: 0.0.3
* Release Date: 4 Jul 2024
* Build ID: 3
* Summary: Introduce plugins, hooks, debug mechanism, much improved README, remove python version, extend autoinstall, enable / disable plugins and commands, flexible locations for config, commands, plugins and settings.

## Description

* Introduce plugin architecture to allow plugins with one or more commands defined to be included by scanning defined plugin folders
* Introduce hooks to plugins to intercept commands after they are received from the front-end, and before they are sent back to the front end. Debug + Chrome Tab hooks also available (although these are a bit more niche)
* Debug mechanism to only show certain data when debug mode turned on from the environment. Also debug plugin included to show how to intercept and show information about the environment such as available commands etc. on the terminal console
* README.md file vastly improved to help get started and understand configuration approach, and how to add commands and plugins
* Python version removed to avoid slowing down development by maintaining two different versions
* Autoinstall of node.js modules has been extended, and no longer extends the main installation's package.json / node_modules directory. package.json and node_modules folders are now automatically generated - one for the commands folder a command runs from, and one for each plugin folder, so that the main project is not impacted. Also included some environment settings to enable / disable autoinstall, and to autoinstall in different scenarios (e.g. when initializing, when running a command, when calling a hook) as some modules may be included inline in the code rather than at module load time
* Plugins and commands can be enabled and disabled through configuration, and through environment variables / .env files. Same for hooks of plugins
* .env files can be in the project directory, in the user's home directory, or in the current working directory where this is invoked from (or a combination of all of these). One or more command and plugin directories and settings files can be defined to scan for plugins / commands / properties config to load into memory on startup.
* General restructuring of project to make it more flexible and easier-to-follow

## Commit History

*Not yet included*
