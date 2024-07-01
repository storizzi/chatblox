class Config {
    constructor() {
        this.commands = [];
        this.plugins = {};
        this.envSettings = {};
    }

    addCommands(commands) {
        this.commands = this.commands.concat(commands);
    }

    addPlugins(plugins) {
        this.plugins = { ...this.plugins, ...plugins };
    }

    addEnvSettings(envSettings) {
        this.envSettings = { ...this.envSettings, ...envSettings };
        // Update the process environment
        for (const [key, value] of Object.entries(envSettings)) {
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
}

module.exports = Config;
