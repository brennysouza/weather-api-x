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
  
async function fiveDayForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const fiveDayView = await response.json();
    
        const currentDayDate = dayjs();
        const filteredDayDate = fiveDayView.list.filter(el => !currentDayDate.startOf("day").isSame(dayjs.unix(el.dt).startOf("day"), "day"));
    
        const fiveDayBoxEl = $("#fiveDayBox");
        fiveDayBoxEl.empty();
    
        for (let i = 0; i < filteredDays.length; i += 8) {
          const forecastCard = $(`
            <div class="col-xl col-lg col-md col-sm-12 col-xs-12 col-12 card">
              <h4>${dayjs.unix(filteredDayDate[i].dt).format('MMM D, YYYY')}</h4>
              <img src='https://openweathermap.org/img/wn/${filteredDayDate[i].weather[0].icon}.png' alt='${filteredDayDate[i].weather[0].description}'/>
              <div>Temp: ${filteredDayDate[i].main.temp} °F </div>
              <div>Wind: ${filteredDayDate[i].wind.speed} MPH </div>
              <div>Humidity: ${filteredDayDate[i].main.humidity} % </div>
            </div>
          `);
          fiveDayBoxEl.append(forecastCard);
        }
      } catch (error) {
        console.error('Error fetching five-day forecast:', error.message);
      }
  }