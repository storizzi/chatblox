The `commands` directory in your chat application contains various scripts that the server can execute based on user input. Each script is designed to perform a specific task or operation. Here's a summary of the types of scripts you might find in the `commands` directory, along with their general purposes:

### Types of Scripts in the `commands` Directory

1. **Node.js Scripts** (`.js` files):
   * These are JavaScript files executed by Node.js.
   * They can perform a wide range of server-side tasks, such as data processing, file operations, or interacting with APIs.
   * Example: A script that fetches weather data from an API based on a location parameter.
2. **Bash Scripts** (`.sh` files):
   * These scripts are written in Bash scripting language and are typically used for executing shell commands.
   * They can automate tasks like file manipulation, system monitoring, or running a series of shell commands.
   * Example: A script that performs a `git pull` in a specified directory.
3. **AppleScript Files** (`.scpt` files):
   * AppleScript is a scripting language for macOS that allows users to control and automate actions on their Mac.
   * These scripts can interact with macOS applications, automate repetitive tasks, or control system functions.
   * Example: A script that checks if a specific tab is open in Google Chrome.

### Specific Script Examples

* `getWeather.js`: Fetches and displays weather information for a given location.
* `gitPull.sh`: Executes a `git pull` command in a specified directory.
* `checkTab.scpt`: Checks for the presence of a specific tab in the Chrome browser.

Each script in the `commands` directory is associated with a command defined in `commands.json`, which includes the command's regex pattern, the script to be executed, and any parameters it requires. The server uses this configuration to determine which script to run based on user input, passing any necessary parameters to the script.

The scripts in the `commands` directory are integral to the functionality of your chat application, enabling it to perform a variety of tasks in response to user commands.
