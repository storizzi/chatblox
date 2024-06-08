async function showDebugInfo({ config, plugins, env }) {
    console.log('--- Commands ---');
    config.commands.forEach(cmd => {
        console.log(`Command: ${cmd.key}`);
        console.log(`Source: ${cmd.source}`);
        console.log(`Type: ${cmd.type}`);
        console.log(`Process: ${cmd.process}`);
        console.log(`Usage: ${cmd.usage}`);
        console.log(`Enabled: ${cmd.enabled}`);
        if (cmd.parameters) {
            console.log('Parameters:');
            cmd.parameters.forEach(param => {
                console.log(`  - ${param.name} (${param.type})${param.required ? ' [required]' : ''}`);
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
        if (pluginData.config.hooks) {
            console.log('Hooks:');
            Object.entries(pluginData.config.hooks).forEach(([hookName, hookMethods]) => {
                console.log(`  - ${hookName}:`);
                hookMethods.forEach(hookMethod => {
                    console.log(`    - ${hookMethod.name}: ${hookMethod.enabled}`);
                });
            });
        }
        console.log('---');
    });

    console.log('--- Loaded Environment Variables ---');
    const loadedEnvVars = {};
    Object.entries(plugins).forEach(([pluginId, pluginData]) => {
        Object.entries(pluginData.env || {}).forEach(([key, value]) => {
            loadedEnvVars[key] = value;
        });
    });
    console.log(JSON.stringify(loadedEnvVars, null, 2));

    // Summary of commands and plugins
    console.log('--- Commands Summary ---');
    config.commands.forEach(cmd => {
        console.log(`Key: ${cmd.key}, Enabled: ${cmd.enabled}, Source: ${cmd.source}`);
    });

    console.log('--- Plugins Summary ---');
    Object.entries(plugins).forEach(([pluginId, pluginData]) => {
        console.log(`ID: ${pluginId}, Enabled: ${pluginData.enabled}`);
    });
}

async function interceptRequest({ req, res, userInput }) {
    console.log('--- Intercept Request ---');
    console.log(`Request: ${req.method} ${req.url}`);
    console.log(`User Input: ${userInput}`);
    console.log(`Request Body: ${JSON.stringify(req.body)}`);
}

async function interceptResponse({ req, res, userInput }) {
    // Capture the response body by modifying the res.send method
    let originalSend = res.send;
    res.send = function (body) {
        console.log('--- Intercept Response ---');
        console.log(`Response for Request: ${req.method} ${req.url}`);
        console.log(`User Input: ${userInput}`);
        console.log(`Response Body: ${body}`);
        originalSend.apply(res, arguments);
    };
}

async function initialize() {
    console.log('Debug plugin initialized');
    return true;
}

module.exports = { showDebugInfo, interceptRequest, interceptResponse, initialize };
