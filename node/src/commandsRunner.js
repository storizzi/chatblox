const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');

const execCommand = async (command, scriptSettings) => {
    const execPromise = util.promisify(exec);
    try {
        const { stdout, stderr } = await execPromise(command, { env: { ...process.env, ...scriptSettings } });
        console.log(`Command '${command}' executed successfully.`);
        return { error: null, stdout: stdout ? stdout.trim() : "", stderr: stderr ? stderr.trim() : "" };
    } catch (error) {
        console.log(`Error executing command '${command}': ${error.message}`);
        return { error, stdout: null, stderr: error.message };
    }
};

const installMissingModule = async (moduleName, cwd, attempts) => {
    console.log(`Attempting to install missing module '${moduleName}' in directory '${cwd}'...`);
    
    // Ensure package.json exists
    const packageJsonPath = path.join(cwd, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.log('Creating package.json in the command directory...');
        fs.writeFileSync(packageJsonPath, JSON.stringify({ name: "command-modules", version: "1.0.0" }, null, 2));
    }

    const installCommand = `npm install ${moduleName}`;
    try {
        const execSync = util.promisify(exec);
        await execSync(installCommand, { cwd });
        console.log(`Module '${moduleName}' installed successfully in directory '${cwd}'.`);
    } catch (error) {
        console.error(`Failed to install module '${moduleName}' in directory '${cwd}' after ${attempts + 1} attempts: ${error.message}`);
        throw error;
    }
};

const executeNodeScript = async (scriptPath, parameters, scriptSettings, config, attempts = 0) => {
    const commandToRun = `node ${scriptPath} ${parameters.join(' ')}`;
    const maxRetries = parseInt(process.env.AUTOINSTALL_CMD_MODS_RETRIES) || 3;
    console.log(`Executing Node script: ${commandToRun}`);
    try {
        const result = await execCommand(commandToRun, scriptSettings);
        if (result.error) {
            throw new Error(result.error);
        }
        if (result.stderr) {
            throw new Error(result.stderr);
        }
        if (result.stdout && result.stdout.match(/Cannot find (module|package) '([^']+)'/)) {
            throw new Error(result.stdout);  // Create a new Error with the stdout message
        }
        return result;
    } catch (error) {
        console.error('Caught error:', error.message);
        const match = error.message.match(/Cannot find (module|package) '([^']+)'/);
        if (match && attempts < maxRetries) {
            const missingModule = match[2];
            await installMissingModule(missingModule, path.dirname(scriptPath), attempts);
            return executeNodeScript(scriptPath, parameters, scriptSettings, config, attempts + 1);
        }
        throw error;
    }
};

const executeAppleScript = async (scriptPath, parameters, scriptSettings) => {
    const commandToRun = `osascript ${scriptPath} ${parameters.join(' ')}`;
    return execCommand(commandToRun, scriptSettings);
};

const executeBashScript = async (scriptPath, parameters, scriptSettings) => {
    const commandToRun = `${scriptPath} ${parameters.join(' ')}`;
    return execCommand(commandToRun, scriptSettings);
};

const executeInMemoryFunction = async ({ commandConfig, parameters, baseDir, config }) => {
    const pluginId = commandConfig.source.split(':')[1];
    const plugin = config.getPlugins()[pluginId];
    console.log(JSON.stringify(plugin, null, 2));
    const pluginFunction = plugin.imports[commandConfig.process];
    if (!pluginFunction) {
        throw new Error(`Function '${commandConfig.process}' not found in plugin '${pluginId}'`);
    }
    const result = await pluginFunction({ commandConfig, parameters, baseDir, config });
    return { error: null, stdout: result };
};

const executeScript = async (commandConfig, parameters, baseDir, config) => {
    if (commandConfig.type === 'plugin') {
        return executeInMemoryFunction({ commandConfig, parameters, baseDir, config });
    }

    const scriptFile = commandConfig.process.split(' ')[0];
    const scriptPath = path.join(baseDir, 'commands', scriptFile);
    const scriptSettings = config.getEnvSettings(); // Load specific settings if needed

    switch (commandConfig.type) {
        case 'node':
            return executeNodeScript(scriptPath, parameters, scriptSettings, config);
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
