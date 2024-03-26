### Project Summary

This chat application is a Node.js-based Express server with a simple front-end chat interface. The server executes various scripts based on user input, handles command history, and dynamically installs missing Node modules.

### File Structure

* `/`
  * `app.js`: The main server file for your Node.js Express application.
  * `commands.json`: A configuration file containing definitions for commands that the server can execute.
  * `package.json`: Defines Node.js project dependencies and scripts.
  * `/public`
    * `index.html`: The front-end HTML file for the chat interface.
    * `style.css`: CSS file for styling the chat interface.
  * `/script-settings`
    * `*.properties`: Configuration files for individual scripts (one per script).
  * `/commands`
    * Various script files (`.js`, `.sh`, `.scpt`, etc.) that the server can execute based on user commands.

### `app.js`

#### Functions

* `executeScript(matchedCommand, parameters)`: Executes a script based on the command type.
  * `matchedCommand`: Object containing details of the matched command.
  * `parameters`: Array of parameters for the command.
* `executeNodeScript(scriptPath, parameters, scriptSettings, attempts)`: Handles the execution of Node.js scripts.
  * `scriptPath`: Path to the Node.js script.
  * `parameters`: Array of parameters for the script.
  * `scriptSettings`: Configuration settings for the script.
  * `attempts`: Number of attempts made to execute the script (for handling module installation).
* `executeAppleScript(scriptPath, parameters, scriptSettings)`: Executes an AppleScript.
  * `scriptPath`, `parameters`, `scriptSettings`: Same as `executeNodeScript`.
* `executeBashScript(scriptPath, parameters, scriptSettings)`: Executes a Bash script.
  * `scriptPath`, `parameters`, `scriptSettings`: Same as `executeNodeScript`.
* `execCommand(command, scriptSettings)`: Executes a given command using the `exec` function from Node.js `child_process`.
  * `command`: The command to be executed.
  * `scriptSettings`: Script-specific settings to be passed as environment variables.
* `installMissingModule(moduleName, cwd, attempts)`: Tries to install a missing Node module.
  * `moduleName`: Name of the module to install.
  * `cwd`: Current working directory for the command execution.
  * `attempts`: Number of attempts made to install the module.
* `loadScriptSettings(scriptFileName)`: Loads script-specific settings from a `.properties` file.
  * `scriptFileName`: Name of the script file.
* `validateParameters(parameters, parameterDefinitions)`: Validates input parameters against defined requirements.
  * `parameters`: Array of input parameters.
  * `parameterDefinitions`: Array of parameter definitions from `commands.json`.

#### Routes

* `app.post('/execute')`: Endpoint to handle user input, execute the matched command, and send back the response.
* `app.get('/')`: Serves the front-end chat interface.

### `commands.json`

* Contains an array of command objects, each defining a command that the server can execute. Each command object includes keys like `type`, `regex`, `process`, `parameters`, and optionally `hooks`.

### `/public/index.html`

* Provides the HTML structure for the chat interface, including an input field for user commands and a div for displaying chat messages.
* JavaScript within the HTML handles sending commands to the server, receiving responses, displaying them, and managing command history with arrow key navigation.

### `/public/style.css`

* Contains CSS styles for the chat interface, including styles for the input field, chat messages, and command history navigation (error/success color coding).

### `/script-settings/*.properties`

* Configuration files for individual scripts, with settings defined in key-value pairs.

### `/commands/*`

* Contains various scripts (Node.js scripts, bash scripts, AppleScript, etc.) that the server can execute based on user commands.
