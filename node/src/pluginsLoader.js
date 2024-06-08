const fs = require('fs');
const path = require('path');
const { loadProperties } = require('./environmentLoader');

const DEFAULT_PLUGIN_LOC_PATTERN = /^PLUGIN_LOC_(.+)$/;
const DEFAULT_PLUGINS_LOC_PATTERN = /^PLUGINS_LOC(\d*)$/;

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
    let plugins = new Map();

    fs.readdirSync(directory, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .forEach(dirent => {
            const subdir = path.join(directory, dirent.name);
            const config = readPluginConfig(subdir);

            if (config && config.id) {
                plugins.set(config.id, {
                    directory: subdir,
                    config: config,
                    enabled: true
                });
            }
        });

    return plugins;
}

async function importModule(filePath) {
    try {
        const importedModule = require(filePath);
        return importedModule;
    } catch (error) {
        console.error(`Error importing module ${filePath}:`, error);
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
            const imports = await importModule(importPath);
            pluginData.imports = imports;

            if (imports && imports[importName] && typeof imports[importName] === 'function') {
                pluginData.setupResults = await imports[importName]();
                console.log(`Initialization method '${importName}' for plugin '${id}' called successfully.`);
            } else {
                console.log(`Initialization method '${importName}' not found for plugin '${id}'.`);
            }
        }
    }
}

async function initializePlugins(pluginDirs, pluginLocPattern = DEFAULT_PLUGIN_LOC_PATTERN, pluginsLocPattern = DEFAULT_PLUGINS_LOC_PATTERN) {
    let plugins = loadPluginsFromEnv(pluginLocPattern);

    pluginDirs.forEach(directory => {
        const dirPlugins = loadPluginsFromDir(directory);

        dirPlugins.forEach((pluginData, id) => {
            plugins[id] = pluginData;
        });
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

module.exports = initializePlugins;
