async function showHelp({ commandConfig, parameters, baseDir, config }) {
    if (!config || !config.getCommands()) {
        throw new Error('Configuration object is missing or improperly initialized.');
    }

    const availableCommands = config.getCommands().filter(cmd => cmd.enabled !== false);

    let helpMessage = 'Available Commands:\n';
    availableCommands.forEach(cmd => {
        helpMessage += `- ${cmd.key}\n  Usage: ${cmd.usage || 'No usage provided'}\n`;
        if (cmd.parameters) {
            cmd.parameters.forEach(param => {
                helpMessage += `   - ${param.name} (${param.type})${param.required ? ' [required]' : ''}\n`;
            });
        }
        helpMessage += '\n';
    });

    return helpMessage;
}

async function initialize() {
    console.log('Help plugin initialized');
    return true;
}

module.exports = { showHelp, initialize };
