async function listCommands({ config, plugins }) {
    const commands = config.commands.map(cmd => ({
        ...cmd,
        source: 'commands.json'
    }));

    const pluginCommands = Object.entries(plugins).flatMap(([pluginId, pluginData]) => {
        return (pluginData.config.commands || []).map(cmd => ({
            ...cmd,
            source: `plugins/${pluginId}`
        }));
    });

    const allCommands = [...commands, ...pluginCommands];

    allCommands.forEach(cmd => {
        console.log(`Command: ${cmd.key}`);
        console.log(`Source: ${cmd.source}`);
        console.log(`Type: ${cmd.type}`);
        console.log(`Process: ${cmd.process}`);
        console.log(`Usage: ${cmd.usage}`);
        if (cmd.parameters) {
            console.log('Parameters:');
            cmd.parameters.forEach(param => {
                console.log(`  - ${param.name} (${param.type})${param.required ? ' [required]' : ''}`);
            });
        }
        console.log('---');
    });
}

async function initialize() {
    console.log('Command Lister plugin initialized');
    return true;
}

module.exports = { listCommands, initialize };
