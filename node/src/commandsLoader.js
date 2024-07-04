const fs = require('fs');
const path = require('path');

function loadCommands(commandFiles) {
    let commands = [];

    commandFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            commands = commands.concat(data.commands || data);
        }
    });

    const commandsInitiallyEnabled = process.env.COMMANDS_INITIALLY_ENABLED === 'true';

    commands.forEach(command => {
        const defaultEnabled = command.enabled ?? commandsInitiallyEnabled;
        const override = process.env[`ENABLE_COMMAND_${command.key}`];
        command.enabled = override ? override === 'true' : defaultEnabled;
        command.source = command.source || 'original';
    });

    return commands;
}

module.exports = { loadCommands };
