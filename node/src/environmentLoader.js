const fs = require('fs');
const path = require('path');

function loadProperties(filePath) {
    const settings = {};
    if (fs.existsSync(filePath)) {
        const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
        for (const line of lines) {
            if (line && line.trim() && !line.startsWith('#')) {
                const [key, value] = line.split('=');
                settings[key.trim()] = value && value.trim();
            }
        }
    }
    return settings;
}

function loadEnvFromDirs(dirs, basePath = __dirname) {
    const mergedSettings = {};
    dirs.forEach(dir => {
        const fullPath = path.resolve(basePath, dir);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            fs.readdirSync(fullPath).forEach(file => {
                if (file.endsWith('.properties')) {
                    const settings = loadProperties(path.join(fullPath, file));
                    Object.assign(mergedSettings, settings);
                }
            });
        }
    });
    // console.log(JSON.stringify(mergedSettings, null, 2));
    return mergedSettings;
}

module.exports = {
    loadProperties,
    loadEnvFromDirs
};
