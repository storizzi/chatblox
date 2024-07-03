const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');

const execCommand = async (command, cwd) => {
    const execPromise = util.promisify(exec);
    try {
        const { stdout, stderr } = await execPromise(command, { cwd });
        return { error: null, stdout: stdout ? stdout.trim() : "", stderr: stderr ? stderr.trim() : "" };
    } catch (error) {
        return { error, stdout: null, stderr: error.message };
    }
};

const installMissingModule = async (moduleName, cwd, attempts = 0) => {
    console.log(`Attempting to install missing module '${moduleName}' in directory '${cwd}'...`);

    // Ensure package.json exists
    const packageJsonPath = path.join(cwd, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.log('Creating package.json in the plugin directory...');
        fs.writeFileSync(packageJsonPath, JSON.stringify({ name: "plugin-modules", version: "1.0.0" }, null, 2));
    }

    const installCommand = `npm install ${moduleName}`;
    try {
        const result = await execCommand(installCommand, cwd);
        if (result.error) {
            throw result.error;
        }
        console.log(`Module '${moduleName}' installed successfully in directory '${cwd}'.`);
    } catch (error) {
        console.error(`Failed to install module '${moduleName}' in directory '${cwd}' after ${attempts + 1} attempts: ${error.message}`);
        throw error;
    }
};

const processHook = async (plugins, hookName, hookParams) => {
    let result = hookParams.data; // Start with the original data
    let dataChanged = false;

    for (const [pluginId, pluginData] of Object.entries(plugins)) {
        const hooks = pluginData.config.hooks;
        if (pluginData.enabled && hooks && hooks[hookName]) {
            for (const methodName of hooks[hookName]) {
                if (pluginData.imports && typeof pluginData.imports[methodName] === 'function') {
                    console.log(`hook ${hookName} - Running ${methodName} method for plugin ${pluginId}`);
                    try {
                        const hookResult = await pluginData.imports[methodName](hookParams);
                        if (hookResult !== null && hookResult !== result) {
                            result = hookResult; // Update result with the hook's result
                            dataChanged = true;
                        }
                    } catch (error) {
                        console.error(`Error in hook '${hookName}' for plugin '${pluginId}':`, error);
                        const match = error.message.match(/Cannot find module '([^']+)'/);
                        if (match) {
                            const missingModule = match[1];
                            await installMissingModule(missingModule, pluginData.directory);
                            const hookResult = await pluginData.imports[methodName](hookParams);
                            if (hookResult !== null && hookResult !== result) {
                                result = hookResult; // Update result with the hook's result
                                dataChanged = true;
                            }
                        }
                    }
                }
            }
        }
    }

    return { data: result, changed: dataChanged };
};

module.exports = {
    processHook
};
