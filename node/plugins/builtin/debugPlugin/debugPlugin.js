async function showDebugInfo({ config }) {
    const commands = config.getCommands() || [];
    const plugins = config.getPlugins() || {};
    const envSettings = config.getEnvSettings() || {};

    console.log('--- Commands ---');
    commands.forEach(cmd => {
        console.log(`Command: ${cmd.key}`);
        console.log(`Source: ${cmd.source || 'original'}`);
        console.log(`Type: ${cmd.type}`);
        console.log(`Process: ${cmd.process}`);
        console.log(`Usage: ${cmd.usage}`);
        console.log(`Enabled: ${cmd.enabled !== false}`);
        if (cmd.parameters) {
            console.log('Parameters:');
            cmd.parameters.forEach(param => {
                console.log(`  - ${param.name} (${param.type}) [${param.required ? 'required' : 'optional'}]`);
            });
        }
        console.log('---');
    });

    console.log('--- Plugins ---');
    Object.entries(plugins).forEach(([pluginId, pluginData]) => {
        console.log(`Plugin: ${pluginId}`);
        console.log(`Directory: ${pluginData.directory}`);
        console.log(`Enabled: ${pluginData.enabled}`);
        console.log(`Config: ${JSON.stringify(pluginData.config, null, 2)}`);
        console.log('---');
    });

    console.log('--- Loaded Environment Variables ---');
    console.log(envSettings);

    console.log('--- Commands Summary ---');
    commands.forEach(cmd => {
        console.log(`Key: ${cmd.key}, Enabled: ${cmd.enabled !== false}, Source: ${cmd.source || 'original'}`);
    });

    console.log('--- Plugins Summary ---');
    Object.entries(plugins).forEach(([pluginId, pluginData]) => {
        console.log(`ID: ${pluginId}, Enabled: ${pluginData.enabled}`);
    });

    return 'Debug information displayed successfully';
}

async function initialize() {
    console.log('Debug plugin initialized');
    return true;
}

module.exports = { showDebugInfo, initialize };
