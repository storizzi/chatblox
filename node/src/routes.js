const path = require('path');

const validateParameters = (parameters, parameterDefinitions) => {
    if (parameters.length > parameterDefinitions.length) {
        return { isValid: false, message: 'Too many parameters.' };
    }

    for (let i = 0; i < parameterDefinitions.length; i++) {
        const param = parameters[i];
        const definition = parameterDefinitions[i];

        const isRequired = definition.required === true;

        if (isRequired && (param === undefined || param === null || param === '')) {
            return { isValid: false, message: `Parameter '${definition.name}' is required.` };
        }

        if (param !== undefined && param !== null && param !== '') {
            if (definition.type === 'integer' && isNaN(parseInt(param))) {
                return { isValid: false, message: `Parameter '${definition.name}' must be an integer.` };
            }

            if (definition.type === 'boolean' && !(param === 'true' || param === 'false')) {
                return { isValid: false, message: `Parameter '${definition.name}' must be a boolean (true or false).` };
            }
        }
    }

    return { isValid: true };
};

const sendResponse = (res, error, stdout) => {
    if (error) {
        res.send({ type: 'Error', message: error.message });
    } else {
        res.send({ type: 'Output', message: stdout });
    }
};

module.exports = (app, config, executeScript, processHook, baseDir) => {
    app.post('/execute', async (req, res) => {
        const userInput = req.body.input;

        // Hook: intercept request
        if (process.env.DEBUG === 'true') console.log("Intercepting request");
        await processHook(config.getPlugins(), 'interceptRequest', { req, res, userInput, config });

        const matchedCommand = config.getCommands().find(cmd => new RegExp(cmd.regex).test(userInput));
        if (process.env.DEBUG === 'true') console.log("Matched Command:", matchedCommand);

        if (matchedCommand) {
            const parameters = userInput.match(new RegExp(matchedCommand.regex)).slice(1);
            if (process.env.DEBUG === 'true') console.log("Parameters:", parameters);
            const validation = validateParameters(parameters, matchedCommand.parameters || []);

            if (!validation.isValid) {
                sendResponse(res, new Error(validation.message), null);
                return;
            }

            try {
                const result = await executeScript(matchedCommand, parameters, baseDir, config);
                if (process.env.DEBUG === 'true') console.log("Execution Result:", result);
                sendResponse(res, result.error, result.stdout);
            } catch (error) {
                if (process.env.DEBUG === 'true') console.log("Execution Error:", error);
                sendResponse(res, error, null);
            }
        } else {
            // Define parameters as an empty object for unrecognized commands
            const parameters = {};
            // Try processing through plugins
            const hookResult = await processHook(config.getPlugins(), userInput, { data: null, parameters, config });
            if (hookResult.changed) {
                sendResponse(res, null, hookResult.data);
            } else {
                sendResponse(res, new Error('Command not recognized'), null);
            }
        }

        // Hook: intercept response
        if (process.env.DEBUG === 'true') console.log("Intercepting response");
        await processHook(config.getPlugins(), 'interceptResponse', { req, res, userInput, config });
    });

    // Serve the chat interface
    app.get('/', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'index.html'));
    });
};
