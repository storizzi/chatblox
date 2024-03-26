async function getWeather(location) {
    const apiKey = process.env.OPENWEATHER_API_KEY; // Replace with your API key
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
        return 'Failed to retrieve weather data.';
    }
}

const location = process.argv[2]; // Get location from command line argument
getWeather(location).then(console.log);
