async function processHook(plugins, hookName, hookParams) {
    let result = hookParams.data; // Start with the original data
    let dataChanged = false;

    for (const [pluginId, pluginData] of Object.entries(plugins)) {
        const hooks = pluginData.config.hooks;
        if (pluginData.enabled && hooks && hooks[hookName]) {
            for (const methodName of hooks[hookName]) {
                if (pluginData.imports && typeof pluginData.imports[methodName] === 'function') {
                    console.log(`hook ${hookName} - Running ${methodName} method for plugin ${pluginId}`);
                    const hookResult = await pluginData.imports[methodName](hookParams);
                    if (hookResult !== null && hookResult !== result) {
                        result = hookResult; // Update result with the hook's result
                        dataChanged = true;
                    }
                }
            }
        }
    }

    return { data: result, changed: dataChanged };
}

module.exports = {
    processHook
};
