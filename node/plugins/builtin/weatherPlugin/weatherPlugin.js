async function getWeather({ parameters, env }) {
    const location = parameters[0];
    const apiKey = env.OPENWEATHER_API_KEY;
    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url);
        const data = await response.json();
        if (data.list) {
            const forecasts = data.list.slice(0, 8).map(entry => {
                return `${new Date(entry.dt * 1000).toLocaleTimeString()}: ${entry.weather[0].description}, Temp: ${entry.main.temp}°C`;
            });
            return forecasts.join('\n');
        } else {
            return `Error: Weather data not found for ${location}.`;
        }
    } catch (error) {
        console.error(error);
        return 'Failed to retrieve weather data.\n\n' + error.message;
    }
}

async function initialize() {
    console.log('Weather plugin initialized');
    return true; // Return true if initialization is successful
}

module.exports = { getWeather, initialize };
