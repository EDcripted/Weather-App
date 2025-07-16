// js/script.js

const apiKey = "6514c06dbc37b8e2d4ac3ae4ed1121e3";
let isCelsius = true;

const cityInput = document.getElementById("cityinput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const unitToggle = document.getElementById("unitToggle");

const cityOutput = document.getElementById("cityoutput");
const weatherIcon = document.getElementById("weatherIcon");
const description = document.getElementById("description");
const temp = document.getElementById("temp");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const wind = document.getElementById("wind");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const forecastCards = document.getElementById("forecastCards");

function kelvinToCelsius(k) {
  return (k - 273.15).toFixed(1);
}

function kelvinToFahrenheit(k) {
  return ((k - 273.15) * 9/5 + 32).toFixed(1);
}

function convertTemp(k) {
  return isCelsius ? `${kelvinToCelsius(k)} °C` : `${kelvinToFahrenheit(k)} °F`;
}

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function displayWeather(data) {
  const weather = data.weather[0];
  const main = data.main;
  const windData = data.wind;
  const sys = data.sys;

  cityOutput.innerText = `Weather of ${data.name}, ${data.sys.country}`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  weatherIcon.alt = weather.description;
  description.innerText = `Sky: ${weather.description}`;
  temp.innerText = `Temperature: ${convertTemp(main.temp)}`;
  feelsLike.innerText = `Feels Like: ${convertTemp(main.feels_like)}`;
  humidity.innerText = `Humidity: ${main.humidity}%`;
  pressure.innerText = `Pressure: ${main.pressure} hPa`;
  wind.innerText = `Wind Speed: ${windData.speed} m/s`;
  sunrise.innerText = `Sunrise: ${formatTime(sys.sunrise)}`;
  sunset.innerText = `Sunset: ${formatTime(sys.sunset)}`;
}

function displayForecast(data) {
  forecastCards.innerHTML = "";
  const days = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!days[date] && Object.keys(days).length < 5) {
      days[date] = item;
    }
  });

  Object.values(days).forEach(item => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p>${new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</p>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
      <p>${convertTemp(item.main.temp)}</p>
    `;
    forecastCards.appendChild(card);
  });
}

function fetchWeather(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) throw new Error(data.message);
      displayWeather(data);
    })
    .catch(err => alert("City not found"));

  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== "200") throw new Error(data.message);
      displayForecast(data);
    });
}

function fetchWeatherByCoords(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      displayWeather(data);
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    })
    .then(res => res.json())
    .then(data => displayForecast(data))
    .catch(err => alert("Unable to retrieve your location"));
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a city name");
  fetchWeather(city);
});

geoBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      () => alert("Geolocation failed")
    );
  } else {
    alert("Geolocation is not supported by your browser");
  }
});

unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  const city = cityOutput.innerText.split(" ")[2];
  if (city) fetchWeather(city);
});
