// These are the variables that will be used to display the current weather
const apiKey = '47796ae8ef8fbb32d8ea6ca2f61e0495';
const apiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

// This function will fetch the weather data from the API for the given city typed inside search field
async function getCityWeather(city, state = '') {
    try {
        const url = state ? `${apiUrl}?q=${city},${state}&appid=${apiKey}&units=imperial` : `${apiUrl}?q=${city}&appid=${apiKey}&units=imperial`;
        const response = await fetch(url);

        // Check if the response was successful
        if (!response.ok) {
            throw new Error('Error fetching weather data: ' + response.statusText);
        }

        const data = await response.json();

        // Check if the data contains the expected structure
        if (!data || !data.city || !data.city.name) {
            throw new Error('Invalid data received from the API');
        }

        // Return the weather data
        return data;
    } catch (error) {
        console.error('Error fetching city weather:', error.message);
        throw error;
    }
}

// This code below will update the weather data on the page with the given data and will display the given data to their respective elements
function updateWeather(data) {
    const citySearchTermEl = $("#city-search-term");
    const cityCurrentDateEl = $("#city-current-date");
    const cityCurrentIconEl = $("#city-current-icon");
    const tempInputEl = $("#temp-input");
    const windInputEl = $("#wind-input");
    const humidityInputEl = $("#humidity-input");

    // Retreive the data from the API and display it to the page with the given elements
    citySearchTermEl.text(data.city.name);
    cityCurrentDateEl.text(dayjs.unix(data.list[0].dt).format('MMM D, YYYY'));
    const icon = $(`<img src='https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}.png' alt='${data.list[0].weather[0].description}'/>`);
    cityCurrentIconEl.empty().append(icon);
    tempInputEl.text(`Temp: ${data.list[0].main.temp} °F`);
    windInputEl.text(`Wind: ${data.list[0].wind.speed} MPH`);
    humidityInputEl.text(`Humidity: ${data.list[0].main.humidity} %`);

    // Call the fiveDayForecast function to display the five day forecast
    fiveDayForecast(data.city.coord.lat, data.city.coord.lon);
}

// This function will fetch the five day forecast data from the API for the given city typed inside search field
async function fiveDayForecast(lat, lon) {
    try {
        const response = await fetch(`${apiUrl}?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const fiveDayView = await response.json();

        // Filter out the current day from the five day forecast
        const currentDayDate = dayjs();
        const filteredDayDate = fiveDayView.list.filter(el => !currentDayDate.startOf("day").isSame(dayjs.unix(el.dt).startOf("day"), "day"));

        // Display the five day forecast to the page
        const fiveDayBoxEl = $("#forecast-cards");
        fiveDayBoxEl.empty(); // Clear the existing forecast cards

        // Loop through the filtered data and display the five day forecast to the page
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

// This code below will retreive the city from the localStorage
function retreiveCity() {
    const cities = localStorage.getItem('searchHistoryData');
    return cities ? JSON.parse(cities) : [];
}

$(document).ready(function () {
    const cityListEl = $("#search-container");

    async function displayCityWeather(city) {
        try {
            const weatherData = await getCityWeather(city);
            updateWeather(weatherData);
            fiveDayForecast(weatherData.city.coord.lat, weatherData.city.coord.lon);
        } catch (error) {
            console.error('An error occurred while fetching city weather:', error.message);
        }
    }


function displayCity() {
    const cities = retreiveCity();
    console.log('Cities retrieved from localStorage:', cities);

    cityListEl.empty();

    cities.forEach(city => {
        const listItemEl = $('<li class="list-group-item"></li>');
        const eachCityEl = $(`
            <button class='btn btn-secondary w-100' data-city="${city}">
                ${city}
            </button>
        `);
        listItemEl.append(eachCityEl);
        cityListEl.append(listItemEl);
    });

    // Attach a click event listener to each button
    cityListEl.on('click', 'button', function () {
        const selectedCity = $(this).data('city');
        displayCityWeather(selectedCity);
    });
}

// This code below will display the city weather when the user clicks on the search button
$("#user-form").on("submit", async function (e) {
    e.preventDefault();
    console.log('Form submitted!');

    const cityInput = $("#city-input").val();
    const stateInput = $("#state-input").val();

    // Check if the user has entered a city
    try {
        const weatherDataWithState = await getCityWeather(cityInput, stateInput);
        console.log('Weather data with state:', weatherDataWithState);

        const weatherDataWithoutState = await getCityWeather(cityInput);
        console.log('Weather data without state:', weatherDataWithoutState);

        updateWeather(weatherDataWithoutState);

        // Update the search history data in localStorage
        const searchHistoryData = JSON.parse(localStorage.getItem('searchHistoryData')) || [];
        console.log('Search history data before update:', searchHistoryData);

        // Check if the city is already in the search history
        if (!searchHistoryData.includes(cityInput)) {
            searchHistoryData.push(cityInput);
            localStorage.setItem('searchHistoryData', JSON.stringify(searchHistoryData));
            console.log('Search history data after update:', searchHistoryData);
            // Call the displayCity function to display the city to the page
            displayCity();
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
});

displayCity();
});