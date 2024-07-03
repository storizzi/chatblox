const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const execCommand = (command, scriptSettings) => {
    try {
        const { stdout, stderr } = execSync(command, { env: { ...process.env, ...scriptSettings }, stdio: 'pipe' });
        console.log(`Command '${command}' executed successfully.`);
        return { error: null, stdout: stdout ? stdout.toString().trim() : "", stderr: stderr ? stderr.toString().trim() : "" };
    } catch (error) {
        console.log(`Error executing command '${command}': ${error.message}`);
        return { error, stdout: null, stderr: error.message };
    }
};

const installMissingModuleSync = (moduleName, cwd) => {
    console.log(`Attempting to install missing module '${moduleName}' in directory '${cwd}'...`);

    // Ensure package.json exists
    const packageJsonPath = path.join(cwd, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.log('Creating package.json in the command directory...');
        fs.writeFileSync(packageJsonPath, JSON.stringify({ name: "command-modules", version: "1.0.0" }, null, 2));
    }

    const installCommand = `npm install ${moduleName}`;
    try {
        execSync(installCommand, { cwd, stdio: 'inherit' });
        console.log(`Module '${moduleName}' installed successfully in directory '${cwd}'.`);
    } catch (error) {
        console.error(`Failed to install module '${moduleName}' in directory '${cwd}': ${error.message}`);
        throw error;
    }
};

const executeNodeScript = (scriptPath, parameters, scriptSettings, config, attempts = 0) => {
    const commandToRun = `node ${scriptPath} ${parameters.join(' ')}`;
    const maxRetries = parseInt(process.env.AUTOINSTALL_CMD_MODS_RETRIES) || 3;
    console.log(`Executing Node script: ${commandToRun}`);
    try {
        const result = execCommand(commandToRun, scriptSettings);
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
            installMissingModuleSync(missingModule, path.dirname(scriptPath));
            return executeNodeScript(scriptPath, parameters, scriptSettings, config, attempts + 1);
        }
        throw error;
    }
};

const executeAppleScript = (scriptPath, parameters, scriptSettings) => {
    const commandToRun = `osascript ${scriptPath} ${parameters.join(' ')}`;
    return execCommand(commandToRun, scriptSettings);
};

const executeBashScript = (scriptPath, parameters, scriptSettings) => {
    const commandToRun = `${scriptPath} ${parameters.join(' ')}`;
    return execCommand(commandToRun, scriptSettings);
};

const installMissingModuleForPlugin = (moduleName, pluginId, baseDir, attempts = 0) => {
    const pluginDir = path.join(baseDir, 'plugins', 'builtin', pluginId);
    console.log(`Attempting to install missing module '${moduleName}' for plugin '${pluginId}'...`);
    
    // Ensure package.json exists
    const packageJsonPath = path.join(pluginDir, 'package.json');
    console.log(`Checking if package.json exists at ${packageJsonPath}`);
    if (!fs.existsSync(packageJsonPath)) {
        console.log('Creating package.json in the plugin directory...');
        fs.writeFileSync(packageJsonPath, JSON.stringify({ name: "plugin-modules", version: "1.0.0" }, null, 2));
    }

    const installCommand = `npm install ${moduleName}`;
    try {
        execSync(installCommand, { cwd: pluginDir, stdio: 'inherit' });
        console.log(`Module '${moduleName}' installed successfully for plugin '${pluginId}'.`);
    } catch (error) {
        console.error(`Failed to install module '${moduleName}' for plugin '${pluginId}' after ${attempts + 1} attempts: ${error.message}`);
        throw error;
    }
};

const removeMatchingQuotes = (str) => {
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
        return str.slice(1, -1);
    }
    return str;
};

const executeInMemoryFunction = async ({ commandConfig, parameters, baseDir, config, attempts = 0 }) => {
    const pluginId = commandConfig.source.split(':')[1];
    const plugin = config.getPlugins()[pluginId];
    const pluginFunction = plugin.imports[commandConfig.process];
    if (!pluginFunction) {
        throw new Error(`Function '${commandConfig.process}' not found in plugin '${pluginId}'`);
    }

    // Remove matching quotes for node.js plugins
    const processedParameters = parameters.map(removeMatchingQuotes);

    try {
        const result = await pluginFunction({ commandConfig, parameters: processedParameters, baseDir, config });
        if (result && typeof result === 'string' && result.match(/Cannot find (module|package) '([^']+)'/)) {
            throw new Error(result);
        }
        return { error: null, stdout: result };
    } catch (error) {
        console.error('Caught error:', error.message);
        const match = error.message.match(/Cannot find (module|package) '([^']+)'/);
        if (match && attempts < parseInt(process.env.AUTOINSTALL_CMD_MODS_RETRIES) || 3) {
            const missingModule = match[2];
            installMissingModuleForPlugin(missingModule, pluginId, baseDir, attempts);
            return executeInMemoryFunction({ commandConfig, parameters, baseDir, config, attempts: attempts + 1 });
        }
        throw error;
    }
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
            return executeAppleScript(scriptPath, parameters, scriptSettings);
        case 'bash':
            return executeBashScript(scriptPath, parameters, scriptSettings);
        default:
            throw new Error('Command type not recognized');
    }
};

module.exports = {
    executeScript
};
