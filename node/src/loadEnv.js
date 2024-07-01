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

module.exports = {
    loadEnv
};
