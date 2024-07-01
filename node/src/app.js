const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Config = require('./config');
const loadCommands = require('./commandsLoader');
const { loadEnvFromDirs } = require('./environmentLoader');
const { executeScript } = require('./commandsRunner');
const { initializePlugins } = require('./pluginsLoader');
const { processHook } = require('./pluginsRunner');
const routes = require('./routes');
const { loadEnv } = require('./loadEnv');

// Load environment variables in the desired order
loadEnv();

const app = express();
const config = new Config();

const appRoot = path.resolve(__dirname, '..');

const port = process.env.PORT || 3000;
const runEnv = process.env.NODE_ENV || 'development';
const isDevMode = runEnv === 'development';
const isDebugMode = process.env.DEBUG === 'true';

const resolveAppPath = (p) => p.replace('{{app}}', appRoot);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(appRoot, 'public')));

const commandsJsonFiles = (process.env.COMMANDS_JSON_FILES || '')
    .split(',')
    .map(file => resolveAppPath(file))
    .filter(file => file);
const commands = loadCommands(commandsJsonFiles);
config.addCommands(commands);

const pluginDirs = (process.env.PLUGIN_DIRS || '')
    .split(',')
    .map(dir => resolveAppPath(dir))
    .filter(dir => dir);
const autoLoadPlugins = process.env.AUTOLOAD_PLUGINS === 'true';

const initialize = async () => {
    if (autoLoadPlugins) {
        const plugins = await initializePlugins(pluginDirs);
        config.addPlugins(plugins);
        for (const pluginId in plugins) {
            if (plugins[pluginId].enabled) {
                mergePluginConfigIntoCommands(plugins[pluginId].config);
            }
        }
    }

    const scriptSettingsDirs = (process.env.SCRIPT_SETTINGS_DIRS || '')
        .split(',')
        .map(dir => resolveAppPath(dir))
        .filter(dir => dir);
    const envSettings = loadEnvFromDirs(scriptSettingsDirs, config.getPlugins());
    config.addEnvSettings(envSettings);
};

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

initialize().then(async () => {
    if (isDebugMode) {
        await processHook(config.getPlugins(), 'showDebugInfo', { config });
    }

    routes(app, config, executeScript, processHook, appRoot);

    app.listen(port, async () => {
        console.log(`Server running in ${runEnv} at http://localhost:${port}`);

        if (isDevMode) {
            const open = (await import('open')).default;
            try {
                const hookResult = await processHook(config.getPlugins(), 'chromeTabCheck', { parameters: ['Chat Terminal'], config });
                if (hookResult.data === 'false') {
                    open(`http://localhost:${port}`, { app: { name: 'google chrome' } });
                }
            } catch (error) {
                open(`http://localhost:${port}`, { app: { name: 'google chrome' } });
            }
        }
    });
}).catch(err => console.error('Failed to initialize plugins:', err));
