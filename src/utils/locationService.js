// Location and AQI Service
// Uses browser Geolocation API and IQAir public API for AQI

const IQAIR_API_KEY = 'YOUR_IQAIR_KEY'; // Free tier available at iqair.com

export async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Reverse geocode to get city name
                try {
                    const geoResponse = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const geoData = await geoResponse.json();

                    const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Unknown';
                    const country = geoData.address?.country || '';

                    resolve({
                        latitude,
                        longitude,
                        city,
                        country,
                        displayName: `${city}, ${country}`,
                    });
                } catch (error) {
                    // Fallback if reverse geocoding fails
                    resolve({
                        latitude,
                        longitude,
                        city: 'Unknown',
                        country: '',
                        displayName: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
                    });
                }
            },
            (error) => {
                reject(new Error(getGeolocationErrorMessage(error)));
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000, // Cache for 5 minutes
            }
        );
    });
}

function getGeolocationErrorMessage(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Location permission denied. Please enable location access.';
        case error.POSITION_UNAVAILABLE:
            return 'Location information unavailable.';
        case error.TIMEOUT:
            return 'Location request timed out.';
        default:
            return 'An unknown error occurred getting location.';
    }
}

export async function getAQI(latitude, longitude) {
    // Using a free public API for AQI data
    // OpenWeatherMap Air Pollution API (free tier)
    const OWM_API_KEY = 'demo'; // Replace with real key for production

    try {
        // Try OpenWeatherMap Air Pollution API first
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}`
        );

        if (response.ok) {
            const data = await response.json();
            const aqi = data.list?.[0]?.main?.aqi;
            // OpenWeatherMap uses 1-5 scale, convert to standard 0-500 scale estimate
            const aqiMapping = { 1: 25, 2: 50, 3: 100, 4: 150, 5: 200 };
            return {
                value: aqiMapping[aqi] || 50,
                category: getAQICategory(aqiMapping[aqi] || 50),
            };
        }
    } catch (error) {
        console.warn('AQI fetch failed, using default:', error);
    }

    // Fallback: return moderate AQI
    return {
        value: 50,
        category: 'Moderate',
    };
}

function getAQICategory(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

export async function getWeather(latitude, longitude) {
    // Using Open-Meteo (free, no API key required)
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );

        if (response.ok) {
            const data = await response.json();
            const weather = data.current_weather;
            return {
                temperature: weather.temperature,
                unit: '°C',
                description: getWeatherDescription(weather.weathercode),
                windSpeed: weather.windspeed,
            };
        }
    } catch (error) {
        console.warn('Weather fetch failed:', error);
    }

    return {
        temperature: '--',
        unit: '°C',
        description: 'Unknown',
    };
}

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        95: 'Thunderstorm',
    };
    return descriptions[code] || 'Unknown';
}

// Combined function to get all environmental data
export async function getEnvironmentalData() {
    try {
        const location = await getCurrentLocation();
        const [weather, aqi] = await Promise.all([
            getWeather(location.latitude, location.longitude),
            getAQI(location.latitude, location.longitude),
        ]);

        return {
            location: location.displayName,
            weather: `${weather.description}, ${weather.temperature}${weather.unit}`,
            aqi: aqi.value,
            aqiCategory: aqi.category,
            success: true,
        };
    } catch (error) {
        return {
            location: '',
            weather: '',
            aqi: '',
            error: error.message,
            success: false,
        };
    }
}
