const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Function to load environment variables from .env files
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

// Function to load properties from .properties files
const loadProperties = (filePath) => {
    const properties = {};
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        console.log(`Properties file ${filePath} loading...`);
        content.split('\n').forEach(line => {
            const [key, value] = line.split('=').map(part => part.trim());
            if (key && value) {
                properties[key] = value;
            }
        });
    }
    return properties;
};

// Function to load environment variables from directories containing .properties files
const loadEnvFromDirs = (dirs, entities) => {
    const env = {};
    dirs.forEach(dir => {
        if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
            fs.readdirSync(dir).forEach(file => {
                if (file.endsWith('.properties')) {
                    const entityId = path.basename(file, '.properties');
                    if (!entities || entities[entityId]?.enabled) {
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
