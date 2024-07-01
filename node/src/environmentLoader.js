const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const loadEnv = () => {
    const appRoot = path.resolve(__dirname, '..');
    const userHomeDir = require('os').homedir();
    const workingDir = process.cwd();

    // Load .env from script directory (app root)
    const appEnvPath = path.join(appRoot, '.env');
    if (fs.existsSync(appEnvPath)) {
        dotenv.config({ path: appEnvPath });
    }

    // Load .env from user home directory
    const userEnvPath = path.join(userHomeDir, '.env');
    if (fs.existsSync(userEnvPath)) {
        dotenv.config({ path: userEnvPath });
    }

    // Load .env from current working directory
    const cwdEnvPath = path.join(workingDir, '.env');
    if (fs.existsSync(cwdEnvPath)) {
        dotenv.config({ path: cwdEnvPath });
    }
};

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
    loadEnv,
    loadProperties,
    loadEnvFromDirs
};
