require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const util = require('util');

const port = process.env.PORT || 3000;
const runEnv = process.env.NODE_ENV || 'development';
const isDevMode = runEnv === 'development';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Load JSON configuration
const commandsConfig = JSON.parse(fs.readFileSync('commands.json', 'utf-8'));

const sendResponse = (res, error, stdout) => {
    if (error) {
        res.send({ type: 'Error', message: error.message });
    } else {
        res.send({ type: 'Output', message: stdout });
    }
};

const loadScriptSettings = (scriptFileName) => {
    const scriptBaseName = path.basename(scriptFileName, path.extname(scriptFileName));
    const settingsPath = path.join(__dirname, 'script-settings', `${scriptBaseName}.properties`);
    const settings = {};
    console.log(`Loading script settings from ${settingsPath}...`);

    if (fs.existsSync(settingsPath)) {
        const lines = fs.readFileSync(settingsPath, 'utf-8').split('\n');
        for (const line of lines) {
            if (line && line.trim() && !line.startsWith('#')) {
                const [key, value] = line.split('=');
                settings[key.trim()] = value && value.trim();
            }
        }
    }
    return settings;
};

const execCommand = async (command, scriptSettings) => {
    const execPromise = util.promisify(exec);
    try {
        const { stdout, stderr } = await execPromise(command, { env: {...process.env, ...scriptSettings} });
        console.log(`Command '${command}' executed successfully.`);
        return { error: null, stdout: stdout ? stdout.trim() : "" };
    } catch (error) {
        console.log(`Error executing command '${command}': ${error.message}`)
        return { error, stdout: null };
    }
};

const executeNodeScript = async (scriptPath, parameters, scriptSettings, attempts = 0) => {
    const scriptName = path.basename(scriptPath, '.js');
    const commandToRun = `node ${scriptPath} ${parameters.join(' ')}`;

    try {
        const result = await execCommand(commandToRun, { ...scriptSettings });
        return result; // result contains { error, stdout }, with error being null if successful
    } catch (error) {
        // Handling module installation errors
        if (error && error.message.includes("Cannot find module") && attempts < maxInstallAttempts) {
            const moduleName = error.message.match(/Cannot find module '([^']+)'/)[1];
            try {
                await installMissingModule(moduleName, path.dirname(scriptPath), attempts);
                return executeNodeScript(scriptPath, parameters, scriptSettings, attempts + 1);
            } catch (installError) {
                return { error: installError, stdout: null };
            }
        } else {
            return { error, stdout: null };
        }
    }
};

const installMissingModule = async (moduleName, cwd, attempts) => {
    console.log(`Attempting to install missing module '${moduleName}'...`);
    const installCommand = `npm install ${moduleName}`;
    try {
        await execCommand(installCommand, { cwd });
        console.log(`Module '${moduleName}' installed successfully.`);
    } catch (installError) {
        throw new Error(`Failed to install module '${moduleName}' after ${attempts + 1} attempts: ${installError.message}`);
    }
};

const executeAppleScript = async (scriptPath, parameters, scriptSettings) => {
    const commandToRun = `osascript ${scriptPath} ${parameters.join(' ')}`;
    return execCommand(commandToRun, scriptSettings);
};

const executeBashScript = async (scriptPath, parameters, scriptSettings) => {
    const commandToRun = `${scriptPath} ${parameters.join(' ')}`;
    return execCommand(commandToRun, scriptSettings);
};

const wrapInQuotes = param => `"${param.replace(/"/g, '\\"')}"`;

const executeScript = async (matchedCommand, parameters) => {
    const scriptFile = matchedCommand.process.split(' ')[0];
    const scriptPath = path.join(__dirname, 'commands', scriptFile);
    const scriptSettings = loadScriptSettings(scriptFile);
    const wrappedParameters = parameters.map(wrapInQuotes);

    switch (matchedCommand.type) {
        case 'node':
            return executeNodeScript(scriptPath, wrappedParameters, scriptSettings);
        case 'osascript':
            return executeAppleScript(scriptPath, wrappedParameters, scriptSettings);
        case 'bash':
            return executeBashScript(scriptPath, wrappedParameters, scriptSettings);
        default:
            throw new Error('Command type not recognized');
    }
};

const validateParameters = (parameters, parameterDefinitions) => {
    // Handle cases where fewer parameters are allowed because they are not required
    if (parameters.length > parameterDefinitions.length) {
        return { isValid: false, message: 'Too many parameters.' };
    }

    for (let i = 0; i < parameterDefinitions.length; i++) {
        const param = parameters[i];
        const definition = parameterDefinitions[i];

        // Check if parameter is required
        const isRequired = definition.required === true;

        if (isRequired && (param === undefined || param === null || param === '')) {
            return { isValid: false, message: `Parameter '${definition.name}' is required.` };
        }

        // Validate parameter types only if parameter is provided
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

// Endpoint to handle user input
app.post('/execute', async (req, res) => {
    const userInput = req.body.input;
    const matchedCommand = commandsConfig.find(cmd => new RegExp(cmd.regex).test(userInput));

    if (matchedCommand) {
        const parameters = userInput.match(new RegExp(matchedCommand.regex)).slice(1);
        const validation = validateParameters(parameters, matchedCommand.parameters || []);

        if (!validation.isValid) {
            sendResponse(res, new Error(validation.message), null);
            return;
        }

        try {
            const result = await executeScript(matchedCommand, parameters);
            sendResponse(res, result.error, result.stdout);
        } catch (error) {
            sendResponse(res, error, null);
        }
    } else {
        sendResponse(res, new Error('Command not recognized'), null);
    }
});

// Serve the chat interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function executeHook(hookName, parameters) {
    const hookCommand = commandsConfig.find(cmd => cmd.hooks && cmd.hooks.includes(hookName));
    if (hookCommand) {
        const result = await executeScript(hookCommand, parameters);
        console.log(`Hook '${hookName}' result: ${result.stdout} param: ${parameters} hookCommand: ${JSON.stringify(hookCommand)}`);
        if (result.error) {
            throw new Error(result.error.message);
        }
        return result.stdout;
    }
    return null;
}

async function startServer() {
    const open = (await import('open')).default;
    app.listen(port, async () => {
        console.log(`Server running in ${runEnv} at http://localhost:${port}`);

        if (isDevMode) {
            try {
                const hookResult = await executeHook('chromeTabCheck', ['Chat Terminal']);
                if (hookResult === 'false') {
                    console.log('Opening browser...');
                    open(`http://localhost:${port}`, { app: { name: 'google chrome' } });
                } else {
                    console.log('Chrome tab check passed, not opening a new tab.');
                }
            } catch (error) {
                console.error('Hook execution error:', error);
                open(`http://localhost:${port}`, { app: { name: 'google chrome' } });
            }
        }
    });
}

startServer().catch(err => console.error('Failed to start server:', err));
