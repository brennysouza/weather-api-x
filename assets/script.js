const apiKey = '47796ae8ef8fbb32d8ea6ca2f61e0495';
const apiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

async function getCityWeather(city, state = '') {
    try {
        const url = state ? `${apiUrl}?q=${city},${state}&appid=${apiKey}&units=imperial` : `${apiUrl}?q=${city}&appid=${apiKey}&units=imperial`;
        const response = await fetch(url);

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

        const fiveDayBoxEl = $("#forecast-cards");
        fiveDayBoxEl.empty(); // Clear the existing forecast cards

        for (let i = 0; i < filteredDayDate.length; i += 8) {
            const forecastCard = $(`
                <div class="col-lg-2">
                    <div class="card" style="height: 100%;">
                        <div class="card-body">
                            <h5 class="card-title">${dayjs.unix(filteredDayDate[i].dt).format('MMM D, YYYY')}</h5>
                            <img src='https://openweathermap.org/img/wn/${filteredDayDate[i].weather[0].icon}.png' alt='${filteredDayDate[i].weather[0].description}'/>
                            <p class="card-text">Temp: ${filteredDayDate[i].main.temp} °F</p>
                            <p class="card-text">Wind: ${filteredDayDate[i].wind.speed} MPH</p>
                            <p class="card-text">Humidity: ${filteredDayDate[i].main.humidity} %</p>
                        </div>
                    </div>
                </div>
            `);
            fiveDayBoxEl.append(forecastCard);
        }
    } catch (error) {
        console.error('Error fetching five-day forecast:', error.message);
        throw error;
    }
}

// $("#user-form").on("submit", async function (e) {
//     e.preventDefault();
//     const cityInput = $("#city-input").val();
//     const stateInput = $("#state-input").val();

//     try {
//         const weatherDataWithState = await getCityWeather(cityInput, stateInput);
//         console.log(weatherDataWithState);

//         const weatherDataWithoutState = await getCityWeather(cityInput);
//         console.log(weatherDataWithoutState);

//         updateWeather(weatherDataWithoutState);

//         const searchHistoryData = JSON.parse(localStorage.getItem('searchHistoryData')) || [];
//         if (!searchHistoryData.includes(cityInput)) {
//             searchHistoryData.push(cityInput);
//             localStorage.setItem('searchHistoryData', JSON.stringify(searchHistoryData));
//             displayCity();
//         }
//     } catch (error) {
//         console.error('An error occurred:', error.message);
//     }
// });



// $("#user-form").on("submit", async function (e) {
//     e.preventDefault();
//     const cityInput = $("#city-input").val();
//     const stateInput = $("#state-input").val();

//     try {
//         const weatherDataWithState = await getCityWeather(cityInput, stateInput);
//         console.log('Weather data with state:', weatherDataWithState);

//         const weatherDataWithoutState = await getCityWeather(cityInput);
//         console.log('Weather data without state:', weatherDataWithoutState);

//         updateWeather(weatherDataWithoutState);

//         const searchHistoryData = JSON.parse(localStorage.getItem('searchHistoryData')) || [];
//         console.log('Search history data before update:', searchHistoryData);

//     } catch (error) {
//         console.error('An error occurred:', error.message);
//     }
// });


function retreiveCity() {
    const cities = localStorage.getItem('searchHistoryData');
    return cities ? JSON.parse(cities) : [];
}

// localStorage.setItem('searchHistoryData', JSON.stringify(searchHistoryData));


// function displayCity() {
//     const cityListEl = $("#cityList");
//     cityListEl.empty();

//     retreiveCity().forEach(city => {
//         const eachCityEl = $(`
//         <button class='col-12 btn btn-secondary' onclick="getCityWeather('${city}')">
//           ${city}
//         </button>
//       `);
//         cityListEl.append(eachCityEl);
//     });
// }

function displayCity() {
    const cities = retreiveCity();
    console.log('Cities retrieved from localStorage:', cities);

    const cityListEl = $("#search-container");
    cityListEl.empty();

    cities.forEach(city => {
        const listItemEl = $('<li class="list-group-item"></li>');
        const eachCityEl = $(`
            <button class='btn btn-secondary w-100' onclick="getCityWeather('${city}')">
                ${city}
            </button>
        `);
        listItemEl.append(eachCityEl);
        cityListEl.append(listItemEl);
    });
}

$("#user-form").on("submit", async function (e) {
    e.preventDefault();
    console.log('Form submitted!');

    const cityInput = $("#city-input").val();
    const stateInput = $("#state-input").val();

    try {
        const weatherDataWithState = await getCityWeather(cityInput, stateInput);
        console.log('Weather data with state:', weatherDataWithState);

        const weatherDataWithoutState = await getCityWeather(cityInput);
        console.log('Weather data without state:', weatherDataWithoutState);

        updateWeather(weatherDataWithoutState);

        const searchHistoryData = JSON.parse(localStorage.getItem('searchHistoryData')) || [];
        console.log('Search history data before update:', searchHistoryData);

        if (!searchHistoryData.includes(cityInput)) {
            searchHistoryData.push(cityInput);
            localStorage.setItem('searchHistoryData', JSON.stringify(searchHistoryData));
            console.log('Search history data after update:', searchHistoryData);

            displayCity();
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
});

displayCity();