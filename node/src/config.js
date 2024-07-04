const path = require('path');

class Config {
    constructor() {
        this.commands = [];
        this.plugins = {};
        this.envSettings = {};
        this.appRoot = path.resolve(__dirname, '..');
    }

    addCommands(commands) {
        this.commands = this.commands.concat(commands);
    }

    addPlugins(plugins) {
        this.plugins = { ...this.plugins, ...plugins };
    }

    addEnvSettings(envSettings) {
        const resolveAppPath = (p) => p.replace('{{app}}', this.appRoot);

        const resolvedEnvSettings = {};
        for (const [key, value] of Object.entries(envSettings)) {
            resolvedEnvSettings[key] = resolveAppPath(value);
        }

        this.envSettings = { ...this.envSettings, ...resolvedEnvSettings };
        
        // Update the process environment
        for (const [key, value] of Object.entries(this.envSettings)) {
            process.env[key] = value;
        }
    }

    getCommands() {
        return this.commands;
    }

    getPlugins() {
        return this.plugins;
    }

    getEnvSettings() {
        return this.envSettings;
    }

    resolveAppPath(p) {
        return p.replace('{{app}}', this.appRoot);
    }
}

module.exports = Config;
