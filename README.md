# Chatblox

![Chatblox Logo](./doc/assets/chatblox_icon.webp)

## Contents

- [Chatblox](#chatblox)
  - [Contents](#contents)
  - [Links](#links)
  - [Introduction](#introduction)
  - [Intentions for Project](#intentions-for-project)
  - [Installation / Start Up](#installation--start-up)
  - [Environment Files](#environment-files)
    - [Overview](#overview)
    - [Example .env File](#example-env-file)
    - [Environment Variables](#environment-variables)
    - [Macro Replacement](#macro-replacement)
    - [Default Locations](#default-locations)
    - [Overriding Defaults](#overriding-defaults)
    - [Sample .env File with Comments](#sample-env-file-with-comments)
- [Server Configuration](#server-configuration)
- [Script Settings](#script-settings)
- [Command Settings](#command-settings)
- [Plugin Settings](#plugin-settings)
- [Specific Plugin and Hook Settings](#specific-plugin-and-hook-settings)
    - [Default Locations](#default-locations-1)
    - [Overriding Defaults](#overriding-defaults-1)
  - [Overview of Commands and Plugins](#overview-of-commands-and-plugins)
    - [Commands](#commands)
      - [Sample Commands](#sample-commands)
        - [1. Git Pull (`gitPull.sh`)](#1-git-pull-gitpullsh)
        - [2. Check Chrome Tab (`checkTab.scpt`)](#2-check-chrome-tab-checktabscpt)
        - [3. Check URL for String (`checkUrlForString.js`)](#3-check-url-for-string-checkurlforstringjs)
      - [Script-Settings Directory](#script-settings-directory)
      - [Sample Properties Files](#sample-properties-files)
      - [Sample Files](#sample-files)
      - [Commands Configuration (commands.json)](#commands-configuration-commandsjson)
    - [Updating Command Locations](#updating-command-locations)
    - [Plugins](#plugins)
    - [Script-Settings Directory](#script-settings-directory-1)
  - [Sample Commands](#sample-commands-1)
    - [List of Sample Commands](#list-of-sample-commands)
    - [Adding a New Command](#adding-a-new-command)
    - [Plugins](#plugins-1)
      - [Sample Plugins](#sample-plugins)
        - [1. Weather Plugin (`weatherPlugin.js`)](#1-weather-plugin-weatherpluginjs)
        - [2. Check URL for String Plugin (`checkUrlForStringPlugin.js`)](#2-check-url-for-string-plugin-checkurlforstringpluginjs)
        - [3. Command Details Plugin (`commandDetailsPlugin.js`)](#3-command-details-plugin-commanddetailspluginjs)
        - [4. Debug Plugin (`debugPlugin.js`)](#4-debug-plugin-debugpluginjs)
        - [5. Help Plugin (`helpPlugin.js`)](#5-help-plugin-helppluginjs)
      - [Adding a New Plugin](#adding-a-new-plugin)
      - [Hooks in Plugins](#hooks-in-plugins)
      - [Module Auto-Installation](#module-auto-installation)
  - [Nodemon Configuration](#nodemon-configuration)
    - [Overview](#overview-1)
    - [Configuration](#configuration)
    - [Adding Custom Directories](#adding-custom-directories)
  - [Debugging with Visual Studio Code](#debugging-with-visual-studio-code)
    - [Setup](#setup)
    - [Example launch.json](#example-launchjson)
    - [Running the Debugger](#running-the-debugger)

## Links

* [README page on github](https://github.com/storizzi/chatblox/README.md)
* [License Details](./LICENSE.md)
* [Release Notes](./release/RELEASE.md)
* [Roadmap](./doc/ROADMAP.md)

## Introduction

Chatblox is a work-in-progress project aiming to create a chat-based interface for accessing various productivity tools and scripts on your local machine. The goal is to consolidate different tools and data sources, enhancing automation and ensuring local data control.

## Intentions for Project

The long-term vision includes:

* Managing local projects and documentation.
* Generating diverse formats of documentation.
* Integrating with task management and journaling systems.
* Automating email processes.
* Enhancing searchability with indexing solutions.
* Integrating Local and Cloud LLM tools.
* Developing across multiple form factors (mobile, desktop, VR).
* Creating a plugin architecture for extensibility.

Currently, it is targeted towards macOS but should work on Linux and WSL for Windows.

[![Simple Chatblox Demo](./doc/assets/chatblox-eg-video-still-frame.png)](https://github.com/storizzi/chatblox/assets/26940113/eb5a1d77-80d7-467c-a805-254e23cb4e79)

## Installation / Start Up

* [Command Summary](./doc/LLM_SUMMARY_commands.md) - LLM Generated

The types of commands cover shell, node.js (javascript) and applescript. Plugins currently only support node.js (javascript) and are loaded in-memory on startup

`cd node/src`

Set up using using `npm i`

Start up using `npm start`

If you have chrome installed, a browser window will be opened to (by default): http://localhost:3000

The default port is 5001. Set the port number in the .env file or pass as an environment variable from the environment you are calling the script from - see `.env-sample` file as an example (which you would rename to .env to use it)

## Environment Files

### Overview

Environment variables control the behavior and configuration of Chatblox. They can be set in an `.env` file in the project's root directory or through other environment-specific files.

### Example .env File

'''
PORT=5001
NODE_ENV=development
DEBUG=false

SCRIPT_SETTINGS_DIRS={{app}}/script-settings

COMMANDS_SETTINGS={{app}}/commands/local,{{app}}/commands/custom
COMMANDS_JSON_FILES={{app}}/commands.json,{{app}}/custom-commands.json
COMMANDS_INITIALLY_ENABLED=true
AUTOINSTALL_COMMANDS_MODULES=true
AUTOINSTALL_CMD_MODS_RETRIES=3

PLUGIN_DIRS={{app}}/plugins/local,{{app}}/plugins/downloads,{{app}}/plugins/builtin
AUTOLOAD_PLUGINS=true
PLUGINS_INITIALLY_ENABLED=true
ENABLE_PLUGIN_debugPlugin=true
ENABLE_PLUGIN_checkUrlForString=false
ENABLE_HOOK_debugPlugin_interceptRequest=true
ENABLE_HOOK_debugPlugin_interceptResponse=true
ENABLE_COMMAND_checkUrlForString=false
'''

### Environment Variables

- **PORT**: Specifies the port number on which the server runs. Default: `5001`.
- **NODE_ENV**: Sets the environment mode. Common values are `development`, `production`, and `test`. Default: `development`.
- **DEBUG**: Enables or disables debug mode. Accepts `true` or `false`. Default: `false`.
- **SCRIPT_SETTINGS_DIRS**: A comma-separated list of directories containing script settings. Default: `{{app}}/script-settings`.
- **COMMANDS_SETTINGS**: A comma-separated list of directories containing command settings. Default: `{{app}}/commands/local,{{app}}/commands/custom`.
- **COMMANDS_JSON_FILES**: A comma-separated list of JSON files defining commands. Default: `{{app}}/commands.json,{{app}}/custom-commands.json`.
- **COMMANDS_INITIALLY_ENABLED**: Determines if commands are enabled by default. Accepts `true` or `false`. Default: `true`.
- **AUTOINSTALL_COMMANDS_MODULES**: Automatically installs missing modules for commands. Accepts `true` or `false`. Default: `true`.
- **AUTOINSTALL_CMD_MODS_RETRIES**: Number of retries for auto-installing command modules. Default: `3`.
- **PLUGIN_DIRS**: A comma-separated list of directories containing plugins. Default: `{{app}}/plugins/local,{{app}}/plugins/downloads,{{app}}/plugins/builtin`.
- **AUTOLOAD_PLUGINS**: Automatically loads plugins from the specified directories. Accepts `true` or `false`. Default: `true`.
- **PLUGINS_INITIALLY_ENABLED**: Determines if plugins are enabled by default. Accepts `true` or `false`. Default: `true`.
- **ENABLE_PLUGIN_[PLUGIN_ID]**: Enables or disables a specific plugin. Replace `[PLUGIN_ID]` with the actual plugin ID. Accepts `true` or `false`. Default: not set (inherits from `PLUGINS_INITIALLY_ENABLED`).
- **ENABLE_HOOK_[PLUGIN_ID]_[HOOK_NAME]**: Enables or disables a specific hook for a plugin. Replace `[PLUGIN_ID]` with the plugin ID and `[HOOK_NAME]` with the hook name. Accepts `true` or `false`. Default: `true`.
- **ENABLE_COMMAND_[COMMAND_KEY]**: Enables or disables a specific command. Replace `[COMMAND_KEY]` with the command key. Accepts `true` or `false`. Default: not set (inherits from `COMMANDS_INITIALLY_ENABLED`).

### Macro Replacement

- **{{app}}**: This macro is replaced with the application's root directory path. It helps to define paths relative to the application's root directory, ensuring that configurations remain consistent across different environments.

### Default Locations

Environment variables can be set in the following default locations:
1. `.env` file in the project root directory.
2. User's home directory.
3. Current working directory.

### Overriding Defaults

Environment variables set in the `.env` file can be overridden by setting them directly in the environment or through other environment-specific files. This provides flexibility in configuring the application based on different environments and deployment scenarios.

### Sample .env File with Comments

'''
# Server Configuration
PORT=5001 # Port on which the server runs
NODE_ENV=development # Environment mode (development, production, test)
DEBUG=false # Enable or disable debug mode

# Script Settings
SCRIPT_SETTINGS_DIRS={{app}}/script-settings # Directories for script settings

# Command Settings
COMMANDS_SETTINGS={{app}}/commands/local,{{app}}/commands/custom # Directories for command settings
COMMANDS_JSON_FILES={{app}}/commands.json,{{app}}/custom-commands.json # JSON files defining commands
COMMANDS_INITIALLY_ENABLED=true # Enable commands by default
AUTOINSTALL_COMMANDS_MODULES=true # Auto-install missing modules for commands
AUTOINSTALL_CMD_MODS_RETRIES=3 # Retries for auto-installing command modules

# Plugin Settings
PLUGIN_DIRS={{app}}/plugins/local,{{app}}/plugins/downloads,{{app}}/plugins/builtin # Directories for plugins
AUTOLOAD_PLUGINS=true # Auto-load plugins from directories
PLUGINS_INITIALLY_ENABLED=true # Enable plugins by default

# Specific Plugin and Hook Settings
ENABLE_PLUGIN_debugPlugin=true # Enable debug plugin
ENABLE_PLUGIN_checkUrlForString=false # Disable checkUrlForString plugin
ENABLE_HOOK_debugPlugin_interceptRequest=true # Enable interceptRequest hook for debug plugin
ENABLE_HOOK_debugPlugin_interceptResponse=true # Enable interceptResponse hook for debug plugin
ENABLE_COMMAND_checkUrlForString=false # Disable checkUrlForString command
'''

### Default Locations
* `.env` in the project root
* User home directory
* Current working directory

### Overriding Defaults
Environment variables set in the `.env` file can be overridden by setting them directly in the environment or through other environment-specific files.

## Overview of Commands and Plugins

Chatblox uses a modular architecture with commands and plugins that can be customized and extended.

### Commands

Commands in Chatblox are scripts or executable files that perform specific tasks. They can be written in various languages like Bash, AppleScript, or Node.js. This section provides details on the sample commands included in the project, their parameters, configurations, and usage.

#### Sample Commands

##### 1. Git Pull (`gitPull.sh`)
**Description**: This command performs a `git pull` operation in the specified directory.
- **Parameters**:
  - `directory`: The directory of the Git repository (required).
- **Usage**: `git pull [directory] - Perform a git pull in the specified directory`
- **Configuration**:
  '''
  {
    "key": "gitPull",
    "type": "bash",
    "title": "Git Pull",
    "regex": "^git pull (.+)$",
    "process": "gitPull.sh $1",
    "usage": "git pull [directory] - Perform a git pull in the specified directory",
    "parameters": [
      {
        "name": "directory",
        "title": "Git Repository Directory",
        "type": "string",
        "required": true
      }
    ]
  }
  '''
- **Script Location**: `/commands/gitPull.sh`

##### 2. Check Chrome Tab (`checkTab.scpt`)
**Description**: This command checks if a Chrome tab with the specified name is open.
- **Parameters**:
  - `tabName`: The name of the Chrome tab (required).
- **Usage**: `check chrome tab [tabName] - Check if a Chrome tab with the specified name is open`
- **Configuration**:
  '''
  {
    "key": "checkChromeTab",
    "type": "osascript",
    "title": "Check Chrome Tab",
    "regex": "^check chrome tab (.+)$",
    "process": "checkTab.scpt",
    "hooks": ["chromeTabCheck"],
    "internal": true,
    "usage": "check chrome tab [tabName] - Check if a Chrome tab with the specified name is open",
    "parameters": [
      {
        "name": "tabName",
        "title": "Tab Name",
        "type": "string",
        "required": true
      }
    ]
  }
  '''
- **Script Location**: `/commands/checkTab.scpt`

##### 3. Check URL for String (`checkUrlForString.js`)
**Description**: This command checks if the specified string is present in the content of the given URL.
- **Parameters**:
  - `url`: The URL to check (required).
  - `string`: The string to match (required).
- **Usage**: `check url <url> for <string> - Check if the specified string is present in the content of the given URL`
- **Configuration**:
  '''
  {
    "key": "checkUrlForString",
    "regex": "^check url (.+) (.+)$",
    "type": "node",
    "process": "checkUrlForString.js",
    "usage": "check url <url> for <string> - Check if the specified string is present in the content of the given URL",
    "parameters": [
      {
        "name": "url",
        "title": "URL",
        "type": "string",
        "required": true
      },
      {
        "name": "string",
        "title": "String to Match",
        "type": "string",
        "required": true
      }
    ],
    "enabled": true
  }
  '''
- **Script Location**: `/commands/checkUrlForString.js`
- **Properties File**: `checkUrlForString.properties` contains:
  '''
  URL_CHECK_TIMEOUT=5000
  URL_CHECK_RETRIES=3
  URL_CHECK_RETRY_WAIT=1000
  URL_CHECK_TEXT=false
  '''

#### Script-Settings Directory

The `script-settings` directory is used to store `.properties` files that configure command behavior. The properties files must follow a specific naming convention to be associated with the corresponding command script.

For example:
- `checkUrlForString.properties` for `checkUrlForString.js`

These properties files contain key-value pairs that are used to configure the commands and plugins.

#### Sample Properties Files

**checkUrlForString.properties**:
'''
URL_CHECK_TIMEOUT=5000
URL_CHECK_RETRIES=3
URL_CHECK_RETRY_WAIT=1000
URL_CHECK_TEXT=false
'''

#### Sample Files
Sample properties files with default values are provided. They have filenames like `checkUrlForString-sample.properties` or `weatherPlugin-sample.properties`. Copy and rename these files to remove the `-sample` suffix and configure them as needed.

#### Commands Configuration (commands.json)

The `commands.json` file defines all available commands. Here is the default `commands.json` configuration:
'''
[
  {
    "key": "gitPull",
    "type": "bash",
    "title": "Git Pull",
    "regex": "^git pull (.+)$",
    "process": "gitPull.sh $1",
    "usage": "git pull [directory] - Perform a git pull in the specified directory",
    "parameters": [
      {
        "name": "directory",
        "title": "Git Repository Directory",
        "type": "string",
        "required": true
      }
    ]
  },
  {
    "key": "checkChromeTab",
    "type": "osascript",
    "title": "Check Chrome Tab",
    "regex": "^check chrome tab (.+)$",
    "process": "checkTab.scpt",
    "hooks": ["chromeTabCheck"],
    "internal": true,
    "usage": "check chrome tab [tabName] - Check if a Chrome tab with the specified name is open",
    "parameters": [
      {
        "name": "tabName",
        "title": "Tab Name",
        "type": "string",
        "required": true
      }
    ]
  },
  {
    "key": "checkUrlForString",
    "regex": "^check url (.+) (.+)$",
    "type": "node",
    "process": "checkUrlForString.js",
    "usage": "check url <url> for <string> - Check if the specified string is present in the content of the given URL",
    "parameters": [
      {
        "name": "url",
        "title": "URL",
        "type": "string",
        "required": true
      },
      {
        "name": "string",
        "title": "String to Match",
        "type": "string",
        "required": true
      }
    ],
    "enabled": true
  }
]
'''

### Updating Command Locations

You can change the list of `commands.json` locations in the `.env` file or through environment variables. For example:

**Example .env File**:
'''
COMMANDS_JSON_FILES={{app}}/commands.json,{{app}}/custom-commands.json
'''

This configuration will load commands from both `commands.json` and `custom-commands.json` files. If multiple files are specified, commands from later files will override those from earlier files if there are conflicts.

Use these configurations to add new commands, modify existing ones, and control command behavior in your Chatblox setup.

### Plugins
Plugins extend Chatblox's functionality by adding hooks and commands. They are more complex than commands and can interact with the core system in various ways.

### Script-Settings Directory
The `script-settings` directory contains properties files for commands and plugins. These files define environment variables specific to each command or plugin.

## Sample Commands

### List of Sample Commands
1. **Check URL for String**
   - **Description**: Checks if a specified string is present in the content of a given URL.
   - **Parameters**: 
     - `url`: The URL to check.
     - `string`: The string to search for.
   - **Location**: `commands/checkUrlForString.js`

### Adding a New Command
1. Create a new script in the `commands` directory.
2. Define the command in a JSON file in the `commands` directory.
3. Add any necessary environment properties in the `script-settings` directory.
4. Update the `COMMANDS_JSON_FILES` environment variable to include the new JSON file.

### Plugins

Plugins in Chatblox are modular pieces of code that extend the functionality of the system. They can implement commands, hooks, and other features. This section provides details on the sample plugins included in the project, their parameters, configurations, and usage.

#### Sample Plugins

##### 1. Weather Plugin (`weatherPlugin.js`)
**Description**: This plugin retrieves weather information for a specified location using the OpenWeather API.
- **Parameters**:
  - `location`: The location for which to retrieve the weather information (required).
- **Usage**: `weather [location] - Get weather information for the specified location`
- **Configuration**:
  '''
  {
    "id": "weatherPlugin",
    "initialization": {
      "import": {
        "fileName": "weatherPlugin.js",
        "name": "initialize"
      }
    },
    "hooks": {
      "getWeather": [
        "getWeather"
      ]
    },
    "commands": [
      {
        "key": "weather",
        "regex": "^weather (.+)$",
        "type": "plugin",
        "process": "getWeather",
        "usage": "weather [location] - Get weather information for the specified location",
        "parameters": [
          {
            "name": "location",
            "title": "Location Name",
            "type": "string",
            "required": true
          }
        ],
        "enabled": true
      }
    ],
    "enabled": true
  }
  '''
- **Script Location**: `/plugins/builtin/weatherPlugin/weatherPlugin.js`
- **Properties File**: `weatherPlugin.properties` contains:
  '''
  OPENWEATHER_API_KEY=your_api_key_here
  '''
- **Obtaining an API Key**: To get an OpenWeather API key, sign up at [OpenWeather](https://home.openweathermap.org/users/sign_up). Once registered, you can generate an API key from the API keys section in your account.

##### 2. Check URL for String Plugin (`checkUrlForStringPlugin.js`)
**Description**: This plugin checks if the specified string is present in the content of the given URL.
- **Parameters**:
  - `url`: The URL to check (required).
  - `string`: The string to match (required).
- **Usage**: `check url <url> for <string> - Check if the specified string is present in the content of the given URL`
- **Configuration**:
  '''
  {
    "id": "checkUrlForStringPlugin",
    "initialization": {
      "import": {
        "fileName": "checkUrlForStringPlugin.js",
        "name": "initialize"
      }
    },
    "commands": [
      {
        "key": "checkUrlForString",
        "regex": "^check url (.+) (.+)$",
        "type": "plugin",
        "process": "getUrlStringCheck",
        "usage": "check url <url> for <string> - Check if the specified string is present in the content of the given URL",
        "parameters": [
          {
            "name": "url",
            "title": "URL",
            "type": "string",
            "required": true
          },
          {
            "name": "string",
            "title": "String to Match",
            "type": "string",
            "required": true
          }
        ],
        "enabled": true
      }
    ],
    "enabled": true
  }
  '''
- **Script Location**: `/plugins/builtin/checkUrlForStringPlugin/checkUrlForStringPlugin.js`
- **Properties File**: `checkUrlForString.properties` contains:
  '''
  URL_CHECK_TIMEOUT=5000
  URL_CHECK_RETRIES=3
  URL_CHECK_RETRY_WAIT=1000
  URL_CHECK_TEXT=false
  '''

##### 3. Command Details Plugin (`commandDetailsPlugin.js`)
**Description**: Provides details about the specified command.
- **Parameters**:
  - `commandKey`: The key of the command to retrieve details for (required).
- **Usage**: `help [commandKey] - Get details about the specified command`
- **Configuration**:
  '''
  {
    "id": "commandDetailsPlugin",
    "initialization": {
      "import": {
        "fileName": "commandDetailsPlugin.js",
        "name": "initialize"
      }
    },
    "commands": [
      {
        "key": "commandDetails",
        "regex": "^help (.+)$",
        "type": "plugin",
        "process": "getCommandDetails",
        "usage": "help [commandKey] - Get details about the specified command",
        "parameters": [
          {
            "name": "commandKey",
            "type": "string",
            "required": true
          }
        ],
        "enabled": true
      }
    ],
    "enabled": true
  }
  '''
- **Script Location**: `/plugins/builtin/commandDetailsPlugin/commandDetailsPlugin.js`

##### 4. Debug Plugin (`debugPlugin.js`)
**Description**: Provides debug information and can intercept requests and responses.
- **Parameters**: None
- **Usage**: Internal use
- **Configuration**:
  '''
  {
    "id": "debugPlugin",
    "initialization": {
      "import": {
        "fileName": "debugPlugin.js",
        "name": "initialize"
      }
    },
    "hooks": {
      "showDebugInfo": [
        "showDebugInfo"
      ],
      "interceptRequest": [
        "interceptRequest"
      ],
      "interceptResponse": [
        "interceptResponse"
      ]
    },
    "commands": [],
    "enabled": true
  }
  '''
- **Script Location**: `/plugins/builtin/debugPlugin/debugPlugin.js`

##### 5. Help Plugin (`helpPlugin.js`)
**Description**: Displays a list of available commands.
- **Parameters**: None
- **Usage**: `help - Display a list of available commands`
- **Configuration**:
  '''
  {
    "id": "helpPlugin",
    "initialization": {
      "import": {
        "fileName": "helpPlugin.js",
        "name": "initialize"
      }
    },
    "commands": [
      {
        "key": "help",
        "regex": "^help$",
        "type": "plugin",
        "process": "showHelp",
        "usage": "help - Display a list of available commands",
        "parameters": [],
        "enabled": true
      }
    ],
    "enabled": true
  }
  '''
- **Script Location**: `/plugins/builtin/helpPlugin/helpPlugin.js`

#### Adding a New Plugin

To add a new plugin, follow these steps:

1. **Create the Plugin Script**: Write the main plugin logic in a `.js` file.

2. **Create the Configuration File**: Write a `config.json` file for the plugin that defines its commands and hooks. Here is an example configuration file for a plugin:
   '''
   {
     "id": "myNewPlugin",
     "initialization": {
       "import": {
         "fileName": "myNewPlugin.js",
         "name": "initialize"
       }
     },
     "commands": [
       {
         "key": "myCommand",
         "regex": "^my command (.+)$",
         "type": "plugin",
         "process": "myCommandProcess",
         "usage": "my command [parameter] - Description of what my command does",
         "parameters": [
           {
             "name": "parameter",
             "title": "Parameter Title",
             "type": "string",
             "required": true
           }
         ],
         "enabled": true
       }
     ],
     "enabled": true
   }
   '''

3. **Create the Properties File**: If your plugin requires configuration settings, create a `.properties` file in the `script-settings` directory with the necessary key-value pairs.

4. **Update the .env File**: Ensure the `PLUGIN_DIRS` environment variable includes the directory where your new plugin resides. For example:
   '''
   PLUGIN_DIRS={{app}}/plugins/local,{{app}}/plugins/downloads,{{app}}/plugins/builtin
   '''

#### Hooks in Plugins

Hooks are mechanisms that allow plugins to intercept and extend the behavior of the application. Plugins can define hooks in their `config.json` file, and these hooks are executed at specific points in the application's lifecycle.

**Example Hooks Configuration**:
'''
"hooks": {
  "interceptRequest": [
    "requestInterceptor"
  ],
  "interceptResponse": [
    "responseInterceptor"
  ]
}
'''

**Available Hooks**:
- `interceptRequest`: Triggered when a request is received.
- `interceptResponse`: Triggered before a response is sent.

**Parameters for Hooks**:
- `req`: The request object.
- `res`: The response object.
- `userInput`: The input from the user.
- `config`: The configuration object.

**Example Implementation in a Plugin**:
'''javascript
async function requestInterceptor({ req, res, userInput, config }) {
    console.log(`Intercepting request: ${userInput}`);
    // Perform custom logic here
    return null;
}

async function responseInterceptor({ req, res, userInput, config }) {
    console.log(`Intercepting response: ${userInput}`);
    // Perform custom logic here
    return null;
}

module.exports = { initialize, requestInterceptor, responseInterceptor };
'''

#### Module Auto-Installation

Chatblox supports automatic installation of missing modules for plugins. If a plugin attempts to use a module that is not installed, the system will

## Nodemon Configuration

### Overview
Nodemon is used to automatically restart the server when code changes.

### Configuration
Example `nodemon.json`:
'''
{
  "watch": ["src", "commands", "plugins"],
  "ext": "js,json",
  "ignore": ["node_modules"]
}
'''

### Adding Custom Directories
Add the new directories to the `watch` array in `nodemon.json`.

## Debugging with Visual Studio Code

### Setup
1. Install the necessary extensions.
2. Configure `launch.json` in the `.vscode` directory.

### Example launch.json
'''
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Chatblox",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/app.js",
      "runtimeArgs": ["-r", "dotenv/config"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "true"
      }
    }
  ]
}
'''

### Running the Debugger
1. Open the Debug panel in VS Code.
2. Select the "Chatblox" configuration.
3. Click the play button to start debugging.
