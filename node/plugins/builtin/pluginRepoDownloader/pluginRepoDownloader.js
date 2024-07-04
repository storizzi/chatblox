const fs = require('fs');
const path = require('path');
let fetch;

async function downloadRepoFile(url, destination, timeout, retries, debug) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(url, { timeout: timeout });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.text();
            fs.writeFileSync(destination, data);

            if (debug) {
                const stats = fs.statSync(destination);
                console.log(`Downloaded ${url} to ${destination} (${stats.size} bytes)`);
            }
            return;
        } catch (error) {
            console.error(`Error downloading ${url}: ${error.message}`);
            if (attempt === retries - 1) throw error;
        }
    }
}

async function updatePluginRepos(config) {
    const repos = config.envSettings.CHATBLOX_REPOS.split(',');
    const cacheDir = config.envSettings.CHATBLOX_REPO_LIST_CACHE;
    const timeout = parseInt(config.envSettings.CHATBLOX_REPO_DOWNLOAD_TIMEOUT) || 5000;
    const retries = parseInt(config.envSettings.CHATBLOX_REPO_DOWNLOAD_RETRIES) || 3;
    const debug = config.envSettings.DEBUG === 'true';
    const pluginListFiles = (config.envSettings.CHATBLOX_REPO_LIST_FILES || 'plugin-list.json').split(',');

    if (debug) {
        console.log('CHATBLOX_REPOS:', repos);
        console.log('CACHE_DIR:', cacheDir);
        console.log('TIMEOUT:', timeout);
        console.log('RETRIES:', retries);
        console.log('CHATBLOX_REPO_LIST_FILES:', pluginListFiles);
    }

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    let updatedFiles = 0;
    for (const repo of repos) {
        const repoUrl = repo.trim();
        for (const listFile of pluginListFiles) {
            const repoFile = repoUrl.startsWith('file://') ? repoUrl.slice(7) : repoUrl;
            const destination = path.join(cacheDir, listFile);

            try {
                if (repoUrl.startsWith('file://') || fs.existsSync(repoFile)) {
                    const source = repoUrl.startsWith('file://') ? path.join(repoFile, listFile) : path.join(repoFile, listFile);
                    fs.copyFileSync(source, destination);
                    const stats = fs.statSync(destination);
                    if (debug) {
                        console.log(`Copied ${source} to ${destination} (${stats.size} bytes)`);
                    }
                } else {
                    await downloadRepoFile(`${repoUrl}/${listFile}`, destination, timeout, retries, debug);
                }
                updatedFiles++;
                break; // Exit the loop if a file is successfully found and downloaded
            } catch (error) {
                console.error(`Failed to update repository from ${repoUrl} using ${listFile}`);
            }
        }
    }
    return updatedFiles;
}

async function getPluginRepos({ commandConfig, parameters, baseDir, config }) {
    const updatedFiles = await updatePluginRepos(config);
    return `Updated ${updatedFiles} repository files.`;
}

async function initialize() {
    console.log("Plugin Repository Downloader initialized");
    fetch = (await import('node-fetch')).default;
    return true;
}

module.exports = {
    getPluginRepos,
    initialize
};
