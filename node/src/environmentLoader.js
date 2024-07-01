const fs = require('fs');
const path = require('path');

const loadProperties = (filePath) => {
    const properties = {};
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        content.split('\n').forEach(line => {
            const [key, value] = line.split('=').map(part => part.trim());
            if (key && value) {
                properties[key] = value;
            }
        });
    }
    return properties;
};

const loadEnvFromDirs = (dirs, plugins) => {
    const env = {};
    dirs.forEach(dir => {
        if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
            fs.readdirSync(dir).forEach(file => {
                if (file.endsWith('.properties')) {
                    const pluginId = path.basename(file, '.properties');
                    if (!plugins || plugins[pluginId]?.enabled) {
                        Object.assign(env, loadProperties(path.join(dir, file)));
                    }
                }
            });
        }
    });
    return env;
};

module.exports = {
    loadProperties,
    loadEnvFromDirs
};