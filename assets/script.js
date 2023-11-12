const apiKey = '47796ae8ef8fbb32d8ea6ca2f61e0495';
const apiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

async function getCityWeather(city, state = '') {
    try {
        const locationQuery = state ? `${city},${state}` : city;
        // const response = await fetch(`${apiUrl}?q=${locationQuery}&appid=${apiKey}`);
        const response = await fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=imperial`);

        
        if (!response.ok) {
            throw new Error('Error fetching weather data: ' + response.statusText);
        }
        
        const data = await response.json();
        
        if (!data || !data.city || !data.city.name) {
            throw new Error('Invalid data received from the API');
        }
        
        return data; 
    } catch (error) {
        console.error('Error fetching city weather:', error.message);
        throw error; 
    }
}


function updateWeather(data) {
    const citySearchTermEl = $("#city-search-term");
    const cityCurrentDateEl = $("#city-current-date");
    const cityCurrentIconEl = $("#city-current-icon");
    const tempInputEl = $("#temp-input");
    const windInputEl = $("#wind-input");
    const humidityInputEl = $("#humidity-input");

    citySearchTermEl.text(data.city.name);
    cityCurrentDateEl.text(dayjs.unix(data.list[0].dt).format('MMM D, YYYY'));
    const icon = $(`<img src='https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}.png' alt='${data.list[0].weather[0].description}'/>`);
    cityCurrentIconEl.empty().append(icon);
    tempInputEl.text(`Temp: ${data.list[0].main.temp} °F`);
    windInputEl.text(`Wind: ${data.list[0].wind.speed} MPH`);
    humidityInputEl.text(`Humidity: ${data.list[0].main.humidity} %`);

    fiveDayForecast(data.city.coord.lat, data.city.coord.lon);
}

async function fiveDayForecast(lat, lon) {
    try {
        const response = await fetch(`${apiUrl}?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const fiveDayView = await response.json();

        const currentDayDate = dayjs();
        const filteredDayDate = fiveDayView.list.filter(el => !currentDayDate.startOf("day").isSame(dayjs.unix(el.dt).startOf("day"), "day"));

        const fiveDayBoxEl = $("#fiveDayBox");
        fiveDayBoxEl.empty();

        for (let i = 0; i < filteredDayDate.length; i += 8) {
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
        throw error;
    }
}

$("#user-form").on("submit", async function (e) {
    e.preventDefault();
    const cityInput = $("#city-input").val();
    const stateInput = $("#state-input").val();

    try {
        const weatherDataWithState = await getCityWeather(cityInput, stateInput);
        console.log(weatherDataWithState);

        const weatherDataWithoutState = await getCityWeather(cityInput);
        console.log(weatherDataWithoutState);

        updateWeather(weatherDataWithoutState);

        const searchHistoryData = JSON.parse(localStorage.getItem('searchHistoryData')) || [];
        if (!searchHistoryData.includes(cityInput)) {
            searchHistoryData.push(cityInput);
            localStorage.setItem('searchHistoryData', JSON.stringify(searchHistoryData));
            displayCity();
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
});


function retreiveCity() {
    const cities = localStorage.getItem("cities");
    return cities ? JSON.parse(cities) : [];
}

function displayCity() {
    const cityListEl = $("#cityList");
    cityListEl.empty();

    retreiveCity().forEach(city => {
        const eachCityEl = $(`
        <button class='col-12 btn btn-secondary' onclick="getCityWeather('${city}')">
          ${city}
        </button>
      `);
        cityListEl.append(eachCityEl);
    });
}

displayCity();
