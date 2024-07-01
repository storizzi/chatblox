const fetchModule = async () => await import('node-fetch');
const cheerio = require('cheerio');
const URL_CHECK_TIMEOUT = process.env.URL_CHECK_TIMEOUT || 5000; // Default timeout is 5000ms
const URL_CHECK_RETRIES = process.env.URL_CHECK_RETRIES || 3; // Default retries is 3
const URL_CHECK_RETRY_WAIT = process.env.URL_CHECK_RETRY_WAIT || 1000; // Default wait time between retries is 1000ms
const URL_CHECK_TEXT = process.env.URL_CHECK_TEXT === 'true'; // Check if we should only search text
const isDebugMode = process.env.DEBUG === 'true';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isValidUrl = (urlString) => {
    try {
        new URL(urlString);
        return true;
    } catch (e) {
        return false;
    }
};

const extractText = (html) => {
    const $ = cheerio.load(html);
    return $('body').text().replace(/\s+/g, ' ').trim();
};

const checkUrlForString = async (url, string, retries = URL_CHECK_RETRIES) => {
    const regex = new RegExp(string);

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const fetch = (await fetchModule()).default;
            const response = await fetch(url, { timeout: URL_CHECK_TIMEOUT });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.text();
            const text = URL_CHECK_TEXT ? extractText(data) : data;

            const matches = text.match(regex);
            if (matches) {
                const result = matches.slice(1); // Capture groups or empty array if no groups
                return result.length === 1 ? result[0] : result.length === 0 ? true : result;
            } else {
                return false;
            }
        } catch (error) {
            if (attempt === retries - 1) {
                if (error.type === 'request-timeout') {
                    return 'TIMEOUT';
                }
                return error.message;
            }
            await sleep(URL_CHECK_RETRY_WAIT); // Wait specified time before retrying
        }
    }
};

const initialize = async () => {
    console.log('checkUrlForStringPlugin initialized');
    return true;
};

const getUrlStringCheck = async ({ commandConfig, parameters, baseDir, config }) => {
    const [url, string] = parameters;
    if (isDebugMode) {
        console.log(`Received URL: ${url}`);
        console.log(`Received String: ${string}`);
    }

    if (!url || !string) {
        throw new Error('Usage: check url <url> <string>');
    }

    if (!isValidUrl(url)) {
        throw new Error('Invalid URL');
    }

    try {
        const result = await checkUrlForString(url, string);
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    initialize,
    getUrlStringCheck
};
