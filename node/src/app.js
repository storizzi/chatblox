require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Config = require('./config');
const loadCommands = require('./commandsLoader');
const { loadEnvFromDirs } = require('./environmentLoader');
const { executeScript } = require('./commandsRunner');
const initializePlugins = require('./pluginsLoader');
const { processHook } = require('./pluginsRunner');
const routes = require('./routes');

const app = express();
const config = new Config();

// Set appRoot to the parent directory of src
const appRoot = path.resolve(__dirname, '..');

const port = process.env.PORT || 3000;
const runEnv = process.env.NODE_ENV || 'development';
const isDevMode = runEnv === 'development';
const isDebugMode = process.env.DEBUG === 'true';

// Replace {{app}} with the app root directory
const resolveAppPath = (p) => p.replace('{{app}}', appRoot);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(appRoot, 'public')));

// Load and merge commands.json files
const commandsJsonFiles = (process.env.COMMANDS_JSON_FILES || '')
    .split(',')
    .map(file => resolveAppPath(file))
    .filter(file => file);
const commands = loadCommands(commandsJsonFiles);
config.addCommands(commands);

// Load and merge environment settings from script-settings directories
const scriptSettingsDirs = (process.env.SCRIPT_SETTINGS_DIRS || '')
    .split(',')
    .map(dir => resolveAppPath(dir))
    .filter(dir => dir);
const envSettings = loadEnvFromDirs(scriptSettingsDirs);
process.env = { ...process.env, ...envSettings };

let plugins = {};

// Function to merge plugin configuration into commands configuration
const mergePluginConfigIntoCommands = (pluginConfig) => {
    const { commands } = pluginConfig;
    if (commands && Array.isArray(commands)) {
        commands.forEach(command => {
            const existingCommandIndex = config.commands.findIndex(cmd => cmd.key === command.key);
            if (existingCommandIndex !== -1) {
                config.commands[existingCommandIndex] = command;
            } else {
                config.commands.push(command);
            }
        });
    }
};

// Initialize plugins
const pluginDirs = (process.env.PLUGIN_DIRS || '')
    .split(',')
    .map(dir => resolveAppPath(dir))
    .filter(dir => dir);
const autoLoadPlugins = process.env.AUTOLOAD_PLUGINS === 'true';

const initialize = async () => {
    if (autoLoadPlugins) {
        plugins = await initializePlugins(pluginDirs);
        for (const pluginId in plugins) {
            if (plugins[pluginId].enabled) {
                mergePluginConfigIntoCommands(plugins[pluginId].config);
            }
        }
    }
};

initialize().then(async () => {
    if (isDebugMode) {
        await processHook(plugins, 'showDebugInfo', { config, plugins, env: process.env });
    }

    routes(app, config, plugins, executeScript, processHook, appRoot); // Setup routes after initialization

    app.listen(port, async () => {
        console.log(`Server running in ${runEnv} at http://localhost:${port}`);

        if (isDevMode) {
            const open = (await import('open')).default;
            try {
                const hookResult = await processHook(plugins, 'chromeTabCheck', ['Chat Terminal']);
                if (hookResult.data === 'false') {
                    open(`http://localhost:${port}`, { app: { name: 'google chrome' } });
                }
            } catch (error) {
                open(`http://localhost:${port}`, { app: { name: 'google chrome' } });
            }
        }
    });
}).catch(err => console.error('Failed to initialize plugins:', err));
