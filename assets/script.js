const secretApiKey = process.env.OPENWEATHERMAP_API_KEY;
const apiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

async function getCityWeather(city) {
    try {
      const response = await fetch(`${apiUrl}?q=${city}&appid=${secretApiKey}`);
      if (!response.ok) {
        throw new Error('Npo network response');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather', error.message);
    }
  }
  
  // Update weather information
function updateWeather(data) {

  }
    
  

