const fs = require('fs');
const path = require('path');

const commandsConfigPath = path.join(__dirname, '..', 'commands.json');
const commandsConfig = JSON.parse(fs.readFileSync(commandsConfigPath, 'utf-8'));

console.log('Available Commands:');
commandsConfig.forEach(command => {
    console.log(`- ${command.title} (${command.key})`);
    if (command.usage) {
        console.log(`  Usage: ${command.usage}`);
    }
    if (command.parameters) {
        command.parameters.forEach(param => {
            console.log(`   - ${param.title} (${param.name}): ${param.type}${param.required ? ' [required]' : ''}`);
        });
    }
    console.log('');
});
