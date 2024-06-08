class Config {
    constructor() {
        this.commands = [];
        this.plugins = {};
    }

    addCommands(commands) {
        this.commands = [...this.commands, ...commands];
    }

    addPlugin(id, plugin) {
        this.plugins[id] = plugin;
    }
}

module.exports = Config;
