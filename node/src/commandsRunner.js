const { exec } = require('child_process');
const util = require('util');
const path = require('path');

const execCommand = async (command, scriptSettings) => {
    const execPromise = util.promisify(exec);
    try {
        const { stdout, stderr } = await execPromise(command, { env: { ...process.env, ...scriptSettings } });
        console.log(`Command '${command}' executed successfully.`);
        return { error: null, stdout: stdout ? stdout.trim() : "" };
    } catch (error) {
        console.log(`Error executing command '${command}': ${error.message}`);
        return { error, stdout: null };
    }
};

const executeNodeScript = async (scriptPath, parameters, scriptSettings) => {
    const commandToRun = `node ${scriptPath} ${parameters.join(' ')}`;
    return execCommand(commandToRun, scriptSettings);
};

const executeAppleScript = async (scriptPath, parameters, scriptSettings) => {
    const commandToRun = `osascript ${scriptPath} ${parameters.join(' ')}`;
    return execCommand(commandToRun, scriptSettings);
};

const executeBashScript = async (scriptPath, parameters, scriptSettings) => {
    const commandToRun = `${scriptPath} ${parameters.join(' ')}`;
    return execCommand(commandToRun, scriptSettings);
};

const wrapInQuotes = param => `"${param.replace(/"/g, '\\"')}"`;

const executeInMemoryFunction = async ({ commandConfig, parameters, baseDir, config }) => {
    try {
        const pluginId = commandConfig.source.split(':')[1];
        const plugin = config.getPlugins()[pluginId];
        const pluginFunction = plugin.imports[commandConfig.process.split(' ')[0]];
        if (!pluginFunction) {
            throw new Error(`Function '${commandConfig.process.split(' ')[0]}' not found in plugin '${pluginId}'`);
        }
        const result = await pluginFunction({ commandConfig, parameters, baseDir, config });
        return { error: null, stdout: result };
    } catch (error) {
        console.log(`Error executing in-memory function: ${error.message}`);
        return { error, stdout: null };
    }
};

const executeScript = async (commandConfig, parameters, baseDir, config) => {
    let scriptFile = commandConfig.process.split(' ')[0];
    let scriptPath;

    if (commandConfig.type === 'plugin') {
        return executeInMemoryFunction({ commandConfig, parameters, baseDir, config });
    } else {
        scriptPath = path.join(baseDir, 'commands', scriptFile);
    }

    const wrappedParameters = parameters.map(wrapInQuotes);
    const scriptSettings = config.getEnvSettings(); // Load specific settings if needed

    switch (commandConfig.type) {
        case 'node':
            return executeNodeScript(scriptPath, wrappedParameters, scriptSettings);
        case 'osascript':
            return executeAppleScript(scriptPath, wrappedParameters, scriptSettings);
        case 'bash':
            return executeBashScript(scriptPath, wrappedParameters, scriptSettings);
        default:
            throw new Error('Command type not recognized');
    }
};

module.exports = {
    executeScript
};
