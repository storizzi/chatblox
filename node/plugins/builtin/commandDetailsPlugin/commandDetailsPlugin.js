async function getCommandDetails({ commandConfig, parameters, baseDir, config }) {
    const commandKey = parameters[0]; // Adjusted to parameters[0] to match the regex capture group
    const command = config.getCommands().find(cmd => cmd.key === commandKey);

    if (!command) {
        return `Command '${commandKey}' not found.`;
    }

    let details = `Command: ${command.key}\n`;
    details += `Usage: ${command.usage || 'No usage provided'}\n`;
    if (command.parameters) {
        command.parameters.forEach(param => {
            details += `- ${param.name} (${param.type})${param.required ? ' [required]' : ''}\n`;
        });
    }
    details += `Source: ${command.source || 'original'}\n`;
    details += `Enabled: ${command.enabled !== false}`;

    return details;
}

async function initialize() {
    console.log('Command Details plugin initialized');
    return true;
}

module.exports = { getCommandDetails, initialize };
