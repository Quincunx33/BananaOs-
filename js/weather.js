function initWeather(windowElement) {
    const API_KEY = '725a048d50f104c2683bbe0e63cc1412'; // Replace with your actual OpenWeatherMap API key
    let currentData = null;

    const loadingDiv = windowElement.querySelector('#weather-loading');
    const contentDiv = windowElement.querySelector('#weather-content');
    const errorDiv = windowElement.querySelector('#weather-error');
    const cityInput = windowElement.querySelector('#weather-location');

    windowElement.querySelector('#weather-search').addEventListener('click', () => getWeatherData(cityInput.value.trim()));
    windowElement.querySelector('#weather-refresh').addEventListener('click', () => {
        const city = currentData ? currentData.name : cityInput.value.trim();
        getWeatherData(city);
    });
    windowElement.querySelector('#weather-locate').addEventListener('click', getLocationWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') getWeatherData(cityInput.value.trim());
    });

    async function getWeatherData(city) {
        if (!city) return;
        showLoading();
        try {
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
            if (!weatherResponse.ok) throw new Error('City not found');
            const weatherData = await weatherResponse.json();
            currentData = weatherData;

            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
            if (!forecastResponse.ok) throw new Error('Forecast not available');
            const forecastData = await forecastResponse.json();
            
            displayCurrentWeather(weatherData);
            displayForecast(forecastData);
            showContent();
        } catch (error) {
            console.error('Weather API error:', error);
            showError();
        }
    }

    function getLocationWeather() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported.');
            return;
        }
        showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
                    if (!weatherResponse.ok) throw new Error('Location weather not found');
                    const weatherData = await weatherResponse.json();
                    currentData = weatherData;
                    cityInput.value = weatherData.name;
                    
                    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
                    if (!forecastResponse.ok) throw new Error('Forecast not available');
                    const forecastData = await forecastResponse.json();

                    displayCurrentWeather(weatherData);
                    displayForecast(forecastData);
                    showContent();
                } catch (error) {
                    console.error('Weather API error:', error);
                    showError();
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to retrieve your location.');
                showError();
            }
        );
    }

    function displayCurrentWeather(data) {
        windowElement.querySelector('#weather-city').textContent = `${data.name}, ${data.sys.country}`;
        windowElement.querySelector('#weather-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        windowElement.querySelector('#weather-temp').textContent = `${Math.round(data.main.temp)}°C`;
        windowElement.querySelector('#weather-desc').textContent = data.weather[0].description.replace(/\b\w/g, l => l.toUpperCase());
        windowElement.querySelector('#weather-feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
        windowElement.querySelector('#weather-humidity').textContent = `${data.main.humidity}%`;
        windowElement.querySelector('#weather-wind').textContent = `${data.wind.speed} m/s`;
        windowElement.querySelector('#weather-pressure').textContent = `${data.main.pressure} hPa`;
        windowElement.querySelector('#weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        windowElement.querySelector('#weather-update-time').textContent = `Last update: ${new Date().toLocaleTimeString()}`;
    }

    function displayForecast(data) {
        const forecastContainer = windowElement.querySelector('#weather-forecast');
        forecastContainer.innerHTML = '';
        for (let i = 0; i < data.list.length; i += 8) { // Get forecast for next 5 days
            const forecast = data.list[i];
            const date = new Date(forecast.dt * 1000);
            forecastContainer.innerHTML += `
                <div class="bg-blue-500 bg-opacity-30 rounded-lg p-2 text-center weather-card">
                    <div class="text-sm font-semibold">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}" class="mx-auto my-1">
                    <div class="text-lg">${Math.round(forecast.main.temp)}°C</div>
                </div>
            `;
        }
    }

    function showLoading() {
        loadingDiv.classList.remove('hidden');
        contentDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
    }

    function showContent() {
        loadingDiv.classList.add('hidden');
        contentDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
    }

    function showError() {
        loadingDiv.classList.add('hidden');
        contentDiv.classList.add('hidden');
        errorDiv.classList.remove('hidden');
    }

    // Initial load
    getWeatherData('Dhaka');
}

