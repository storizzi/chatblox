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

function loadPluginsFromEnv(pluginLocPattern, appRoot) {
    let plugins = {};

    for (const [key, value] of Object.entries(process.env)) {
        const match = key.match(pluginLocPattern);
        if (match) {
            const pluginName = match[1];
            const directory = path.isAbsolute(value) ? value : path.resolve(appRoot, value);
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

const installMissingModule = (moduleName, cwd, attempts = 0) => {
    console.log(`Attempting to install missing module '${moduleName}' in directory '${cwd}'...`);

    // Ensure package.json exists
    const packageJsonPath = path.join(cwd, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.log('Creating package.json in the plugin directory...');
        fs.writeFileSync(packageJsonPath, JSON.stringify({ name: "plugin-modules", version: "1.0.0" }, null, 2));
    }

    const installCommand = `npm install ${moduleName}`;
    try {
        execSync(installCommand, { cwd });
        console.log(`Module '${moduleName}' installed successfully in directory '${cwd}'.`);
    } catch (error) {
        console.error(`Failed to install module '${moduleName}' in directory '${cwd}' after ${attempts + 1} attempts: ${error.message}`);
        throw error;
    }
};

async function importModule(filePath) {
    try {
        const importedModule = await import(filePath);
        return importedModule.default || importedModule;
    } catch (error) {
        console.error(`Error importing module ${filePath}:`, error);
        throw error;
    }
}

async function processPluginImportsAndSetup(plugins) {
    for (const [id, pluginData] of Object.entries(plugins)) {
        if (!pluginData.enabled) continue;

        const config = pluginData.config;

        if (config.initialization && config.initialization.import) {
            const importPath = path.join(pluginData.directory, config.initialization.import.fileName);
            const importName = config.initialization.import.name || "initialize";

            try {
                let imports = await importModule(importPath);
                pluginData.imports = imports;

                if (imports && imports[importName] && typeof imports[importName] === 'function') {
                    pluginData.setupResults = await imports[importName]();
                    console.log(`Initialization method '${importName}' for plugin '${id}' called successfully.`);
                } else {
                    console.log(`Initialization method '${importName}' not found for plugin '${id}'.`);
                }
            } catch (error) {
                if (error.code === 'ERR_MODULE_NOT_FOUND') {
                    const match = error.message.match(/Cannot find module '([^']+)'/);
                    if (match) {
                        const missingModule = match[1];
                        await installMissingModule(missingModule, pluginData.directory);
                        imports = await importModule(importPath);
                        pluginData.imports = imports;

                        if (imports && imports[importName] && typeof imports[importName] === 'function') {
                            pluginData.setupResults = await imports[importName]();
                            console.log(`Initialization method '${importName}' for plugin '${id}' called successfully after installing missing module.`);
                        } else {
                            console.log(`Initialization method '${importName}' not found for plugin '${id}' after installing missing module.`);
                        }
                    }
                } else {
                    console.error(`Error importing module ${importPath}:`, error);
                }
            }
        }
    }
}

async function initializePlugins(pluginDirs, config, pluginLocPattern = DEFAULT_PLUGIN_LOC_PATTERN) {
    const appRoot = config.appRoot;
    let plugins = loadPluginsFromEnv(pluginLocPattern, appRoot);

    pluginDirs.forEach(directory => {
        const resolvedDir = directory.replace('{{app}}', appRoot);
        const dirPlugins = loadPluginsFromDir(resolvedDir);
        plugins = { ...plugins, ...dirPlugins };
    });

    const pluginsInitiallyEnabled = process.env.PLUGINS_INITIALLY_ENABLED === 'true';

    for (const [pluginId, pluginData] of Object.entries(plugins)) {
        const defaultEnabled = pluginData.config.enabled ?? pluginsInitiallyEnabled;
        const override = process.env[`ENABLE_PLUGIN_${pluginId}`];
        pluginData.enabled = override ? override === 'true' : defaultEnabled;

        // Load plugin-specific environment settings
        pluginData.envSettings = {};
        const scriptSettingsDirs = (process.env.SCRIPT_SETTINGS_DIRS || '')
            .split(',')
            .map(dir => dir.replace('{{app}}', appRoot))
            .filter(dir => dir);
        
        scriptSettingsDirs.forEach(dir => {
            const pluginEnvPath = path.join(dir, `${pluginId}.properties`);
            if (fs.existsSync(pluginEnvPath)) {
                const envSettings = loadProperties(pluginEnvPath);
                pluginData.envSettings = { ...pluginData.envSettings, ...envSettings };
            }
        });

        // Add to global environment settings
        config.addEnvSettings(pluginData.envSettings);

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
