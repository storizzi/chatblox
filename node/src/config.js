class Config {
    constructor() {
        this.commands = [];
        this.plugins = {};
        this.env = { ...process.env };
    }

    addCommands(commands) {
        this.commands = [...this.commands, ...commands];
    }

    addPlugins(plugins) {
        this.plugins = { ...this.plugins, ...plugins };
    }

    addEnvSettings(envSettings) {
        this.env = { ...this.env, ...envSettings };
    }

    getCommands() {
        return this.commands;
    }

    getPlugins() {
        return this.plugins;
    }

    getEnvSettings() {
        return this.env;
    }
}

module.exports = Config;
