const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadProperties } = require('./environmentLoader');

const DEFAULT_PLUGIN_LOC_PATTERN = /^PLUGIN_LOC_(.+)$/;

function readPluginConfig(directory) {
    const configFile = path.join(directory, 'config.json');
    if (fs.existsSync(configFile)) {
        try {
            return JSON.parse(fs.readFileSync(configFile, 'utf8'));
        } catch (error) {
            console.error(`Error reading config.json in ${directory}:`, error);
            return {};
        }
    }
    return {};
}

function loadPluginsFromEnv(pluginLocPattern) {
    let plugins = {};

    for (const [key, value] of Object.entries(process.env)) {
        const match = key.match(pluginLocPattern);
        if (match) {
            const pluginName = match[1];
            const directory = path.isAbsolute(value) ? value : path.resolve(value);
            const config = readPluginConfig(directory);

            plugins[pluginName] = {
                directory: directory,
                config: config,
                enabled: true
            };
        }
    }

    return plugins;
}

function loadPluginsFromDir(directory) {
    let plugins = {};

    fs.readdirSync(directory, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .forEach(dirent => {
            const subdir = path.join(directory, dirent.name);
            const config = readPluginConfig(subdir);

            if (config && config.id) {
                plugins[config.id] = {
                    directory: subdir,
                    config: config,
                    enabled: true
                };
            }
        });

    return plugins;
}

const installMissingModuleSync = (moduleName, cwd) => {
    console.log(`Attempting to install missing module '${moduleName}' in directory '${cwd}'...`);
    
    // Ensure package.json exists
    const packageJsonPath = path.join(cwd, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.log('Creating package.json in the plugin directory...');
        fs.writeFileSync(packageJsonPath, JSON.stringify({ name: "plugin-modules", version: "1.0.0" }, null, 2));
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

async function importModule(filePath, pluginDirectory) {
    try {
        const importedModule = require(filePath);
        return importedModule.default || importedModule;
    } catch (error) {
        console.error(`Error importing module ${filePath}:`, error);

        if (error.code === 'MODULE_NOT_FOUND') {
            const match = error.message.match(/Cannot find module '([^']+)'/);
            if (match) {
                const missingModule = match[1];
                installMissingModuleSync(missingModule, pluginDirectory);
                try {
                    const importedModule = require(filePath);
                    return importedModule.default || importedModule;
                } catch (reimportError) {
                    console.error(`Failed to re-import module ${filePath} after installing missing module:`, reimportError);
                    return null;
                }
            }
        }
        return null;
    }
}

async function processPluginImportsAndSetup(plugins) {
    for (const [id, pluginData] of Object.entries(plugins)) {
        if (!pluginData.enabled) continue;

        const config = pluginData.config;

        if (config.initialization && config.initialization.import) {
            const importPath = path.join(pluginData.directory, config.initialization.import.fileName);
            const importName = config.initialization.import.name || "initialize";

            let imports = await importModule(importPath, pluginData.directory);
            pluginData.imports = imports;

            if (imports && imports[importName] && typeof imports[importName] === 'function') {
                try {
                    pluginData.setupResults = await imports[importName]();
                    console.log(`Initialization method '${importName}' for plugin '${id}' called successfully.`);
                } catch (setupError) {
                    console.error(`Error during initialization of plugin '${id}':`, setupError);
                }
            } else {
                console.log(`Initialization method '${importName}' not found for plugin '${id}'.`);
            }
        }
    }
}

async function initializePlugins(pluginDirs, pluginLocPattern = DEFAULT_PLUGIN_LOC_PATTERN) {
    let plugins = loadPluginsFromEnv(pluginLocPattern);

    pluginDirs.forEach(directory => {
        const dirPlugins = loadPluginsFromDir(directory);
        plugins = { ...plugins, ...dirPlugins };
    });

    const pluginsInitiallyEnabled = process.env.PLUGINS_INITIALLY_ENABLED === 'true';

    for (const [pluginId, pluginData] of Object.entries(plugins)) {
        const defaultEnabled = pluginData.config.enabled ?? pluginsInitiallyEnabled;
        const override = process.env[`ENABLE_PLUGIN_${pluginId}`];
        pluginData.enabled = override ? override === 'true' : defaultEnabled;

        const pluginSettings = loadProperties(path.join(__dirname, '../script-settings', `${pluginId}.properties`));
        pluginData.env = pluginSettings;

        if (pluginData.config.commands) {
            pluginData.config.commands.forEach(command => {
                command.source = `plugin:${pluginId}`;
                const commandOverride = process.env[`ENABLE_COMMAND_${command.key}`];
                command.enabled = commandOverride ? commandOverride === 'true' : pluginData.enabled;
            });
        }

        if (pluginData.config.hooks) {
            Object.keys(pluginData.config.hooks).forEach(hookName => {
                const hookOverride = process.env[`ENABLE_HOOK_${pluginId}_${hookName}`];
                pluginData.config.hooks[hookName].enabled = hookOverride ? hookOverride === 'true' : true;
            });
        }
    }

    await processPluginImportsAndSetup(plugins);

    // Remove commands and hooks from disabled plugins
    for (const pluginId in plugins) {
        if (!plugins[pluginId].enabled) {
            delete plugins[pluginId].config.commands;
            delete plugins[pluginId].config.hooks;
        }
    }

    return plugins;
}

module.exports = {
    initializePlugins
};
