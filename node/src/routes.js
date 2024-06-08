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

module.exports = (app, config, plugins, executeScript, processHook, baseDir) => {
    app.post('/execute', async (req, res) => {
        const userInput = req.body.input;

        // Hook: intercept request
        await processHook(plugins, 'interceptRequest', { req, res, userInput });

        const matchedCommand = config.commands.find(cmd => new RegExp(cmd.regex).test(userInput));

        if (matchedCommand) {
            const parameters = userInput.match(new RegExp(matchedCommand.regex)).slice(1);
            const validation = validateParameters(parameters, matchedCommand.parameters || []);

            if (!validation.isValid) {
                sendResponse(res, new Error(validation.message), null);
                return;
            }

            try {
                const result = await executeScript(matchedCommand, parameters, baseDir);
                sendResponse(res, result.error, result.stdout);
            } catch (error) {
                sendResponse(res, error, null);
            }
        } else {
            // Define parameters as an empty object for unrecognized commands
            const parameters = {};
            // Try processing through plugins
            const hookResult = await processHook(plugins, userInput, { data: null, parameters });
            if (hookResult.changed) {
                sendResponse(res, null, hookResult.data);
            } else {
                sendResponse(res, new Error('Command not recognized'), null);
            }
        }

        // Hook: intercept response
        await processHook(plugins, 'interceptResponse', { req, res, userInput });
    });

    // Serve the chat interface
    app.get('/', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'index.html'));
    });
};
