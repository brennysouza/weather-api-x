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


function updateWeather(data) {
  
    const citySearchTermEl = $("#city-search-term");
    const cityCurrentDateEl = $("#city-current-date");
    const cityCurrentIconEl = $("#city-current-icon");
    const tempInputEl = $("#temp-input");
    const windInputEl = $("#wind-input");
    const humidityInputEl = $("#humidity-input");
  
    citySearchTermEl.text(data.name);
    cityCurrentDateEl.text(dayjs.unix(data.dt).format('MMM D, YYYY'));
    const icon = $(`<img src='https://openweathermap.org/img/wn/${data.weather[0].icon}.png' alt='${data.weather[0].description}'/>`);
    cityCurrentIconEl.empty().append(icon);
    tempInputEl.text(`Temp: ${data.main.temp} °F`);
    windInputEl.text(`Wind: ${data.wind.speed} MPH`);
    humidityInputEl.text(`Humidity: ${data.main.humidity} %`);
  
    fiveDayForecast(data.coord.lat, data.coord.lon);
  }
  
  