const fs = require('fs');
const path = require('path');

const commandsConfigPath = path.join(__dirname, '..', 'commands.json');

const scriptSettingsPath = (scriptFileName) => {
    const scriptBaseName = path.basename(scriptFileName, path.extname(scriptFileName));
    return path.join(__dirname, '..', 'script-settings', `${scriptBaseName}.properties`);
};

const getCommandDetails = (commandKey) => {
    const commandsConfig = JSON.parse(fs.readFileSync(commandsConfigPath, 'utf-8'));
    const command = commandsConfig.find(cmd => cmd.key === commandKey);

    if (!command) {
        console.log(`No command found with key: ${commandKey}`);
        return;
    }

    console.log(`Command Details for '${commandKey}':`);
    console.log(JSON.stringify(command, null, 2)); // Pretty print the command config

    const settingsFilePath = scriptSettingsPath(command.process.split(' ')[0]);
    if (fs.existsSync(settingsFilePath)) {
        const settings = fs.readFileSync(settingsFilePath, 'utf-8');
        console.log(`Environment Settings for '${commandKey}':\n${settings}`);
    } else {
        console.log(`No environment settings file found for '${commandKey}'.`);
    }
};

const commandKey = process.argv[2];
getCommandDetails(commandKey);
