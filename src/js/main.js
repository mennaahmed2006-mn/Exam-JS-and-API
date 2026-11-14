
var trigger = document.getElementById("country-trigger");
var menu = document.getElementById("country-menu");
var searchInput = document.getElementById("country-search");
var countryList = document.getElementById("country-list");
var selectedText = document.getElementById("country-selected-text");

var cityTrigger = document.getElementById("city-trigger");
var cityMenu = document.getElementById("city-menu");
var cityList = document.getElementById("city-list");

var infoBox = document.getElementById("dashboard-country-info");
var exploreBtn = document.getElementById("global-search-btn");
var selectedDestination = document.getElementById("selected-destination");
var selectedFlag = document.getElementById("selected-country-flag");
var selectedNameBox = document.getElementById("selected-country-name");
var selectedCityBox = document.getElementById("selected-city-name");
var clearBtn = document.getElementById("clear-selection-btn");

var navItems = document.querySelectorAll(".nav-item");
var views = document.querySelectorAll(".view");
var yearSelect = document.getElementById("global-year");

var allCountries = [];
var allCities = [];
var selectedCountryCode = "";
var selectedCountryName = "";
var selectedCityName = "";

var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


// get all countries
async function getCountries() {
try {
    var response = await fetch("https://date.nager.at/api/v3/AvailableCountries");
    var countries = await response.json();
    allCountries = countries;
    displayCountries(allCountries);
} catch (error) {
    console.log("Error loading countries:", error);
}
}

function displayCountries(countries) {
var items = "";
for (var i = 0; i < countries.length; i++) {
    var code = countries[i].countryCode;
    items += `
    <div class="country-option" data-code="${code}">
        <img src="https://flagcdn.com/w40/${code.toLowerCase()}.png" alt="${countries[i].name}">
        <span class="country-name">${countries[i].name}</span>
        <span class="country-code">${code}</span>
    </div>
    `;
}
countryList.innerHTML = items;
}

getCountries();

trigger.addEventListener("click", function () {
  if (menu.classList.contains("hidden")) {
    menu.classList.remove("hidden");
    cityMenu.classList.add("hidden");
    cityTrigger.classList.remove("open");
  } else {
    menu.classList.add("hidden");
  }
});

countryList.addEventListener("click", function (event) {
  var option = event.target.closest(".country-option");
  if (option) {
    selectedCountryCode = option.getAttribute("data-code");
    selectedCountryName = option.querySelector(".country-name").textContent;
    selectedCityName = "";

    selectedText.innerHTML = `
      <img src="https://flagcdn.com/w40/${selectedCountryCode.toLowerCase()}.png" style="width:24px;margin-right:8px;border-radius:3px;">
      ${selectedCountryName}
    `;
    document.getElementById("city-selected-text").innerHTML = "Select City";
    menu.classList.add("hidden");
    fetchCity(selectedCountryName);
  }
});

searchInput.addEventListener("input", function () {
  var text = searchInput.value.toLowerCase();
  var filtered = [];
  for (var i = 0; i < allCountries.length; i++) {
    if (allCountries[i].name.toLowerCase().includes(text)) {
      filtered.push(allCountries[i]);
    }
  }
  displayCountries(filtered);
});

document.addEventListener("click", function (event) {
  var dropdown = document.getElementById("country-dropdown");
  if (!dropdown.contains(event.target)) {
    menu.classList.add("hidden");
  }
});


// cities
async function fetchCity(countryName) {
  cityList.innerHTML = `<div class="custom-select-empty">Loading cities...</div>`;
  try {
    var response = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName }),
    });
    var result = await response.json();

    if (result.error === true || !result.data) {
      allCities = [];
      cityList.innerHTML = `<div class="custom-select-empty">No cities found</div>`;
      return;
    }

    allCities = result.data;
    displayCities(allCities);
  } catch (error) {
    console.log("Error loading cities:", error);
    allCities = [];
    cityList.innerHTML = `<div class="custom-select-empty">Failed to load cities</div>`;
  }
}

function displayCities(cities) {
  var items = "";
  for (var i = 0; i < cities.length; i++) {
    items += `
      <div class="country-option city-option" data-city="${cities[i]}">
        <span class="country-name">${cities[i]}</span>
      </div>
    `;
  }
  cityList.innerHTML = items;
}

cityList.addEventListener("click", function (event) {
  var option = event.target.closest(".city-option");
  if (option) {
    selectedCityName = option.getAttribute("data-city");
    document.getElementById("city-selected-text").innerHTML = `<i class="fa-solid fa-city"></i> ${selectedCityName}`;
    cityMenu.classList.add("hidden");
    cityTrigger.classList.remove("open");
  }
});

cityTrigger.addEventListener("click", function () {
  if (cityMenu.classList.contains("hidden")) {
    cityMenu.classList.remove("hidden");
    cityTrigger.classList.add("open");
    menu.classList.add("hidden");
  } else {
    cityMenu.classList.add("hidden");
    cityTrigger.classList.remove("open");
  }
});

document.addEventListener("click", function (event) {
  var cityDropdown = document.getElementById("city-dropdown");
  if (!cityDropdown.contains(event.target)) {
    cityMenu.classList.add("hidden");
    cityTrigger.classList.remove("open");
  }
});


// country info on the dashboard
function showError(message) {
  infoBox.innerHTML = `
    <div class="error-state">
      <div class="error-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
      <p>${message}</p>
    </div>
  `;
}

async function getDetails(code) {
  infoBox.innerHTML = `<div class="empty-state"><p>Loading country information...</p></div>`;
  try {
    var response = await fetch("https://date.nager.at/api/v3/CountryInfo/" + code);

    if (!response.ok) {
      showError("Failed to load country information. Please try again.");
      return;
    }

    var data = await response.json();
    displayCountryInfo(data);
  } catch (error) {
    console.log("Error loading country info:", error);
    if (navigator.onLine === false) {
      showError("No internet connection. Please check your network and try again.");
    } else {
      showError("Failed to load country information. Please try again.");
    }
  }
}

function displayCountryInfo(country) {
  var neighbors = "";
  if (country.borders && country.borders.length > 0) {
    for (var i = 0; i < country.borders.length; i++) {
      neighbors += `<span class="extra-tag border-tag">${country.borders[i].commonName}</span>`;
    }
  } else {
    neighbors = `<span class="extra-tag">No land borders</span>`;
  }

  infoBox.innerHTML = `
    <div class="dashboard-country-header">
      <img src="https://flagcdn.com/w160/${country.countryCode.toLowerCase()}.png" alt="${country.commonName}" class="dashboard-country-flag">
      <div class="dashboard-country-title">
        <h3>${country.commonName}</h3>
        <p class="official-name">${country.officialName}</p>
        <span class="region"><i class="fa-solid fa-location-dot"></i> ${country.region}</span>
      </div>
    </div>

    <div class="dashboard-country-grid">
      <div class="dashboard-country-detail">
        <i class="fa-solid fa-flag"></i>
        <span class="label">Country Code</span>
        <span class="value">${country.countryCode}</span>
      </div>
      <div class="dashboard-country-detail">
        <i class="fa-solid fa-globe"></i>
        <span class="label">Region</span>
        <span class="value">${country.region}</span>
      </div>
    </div>

    <div class="dashboard-country-extras">
      <div class="dashboard-country-extra">
        <h4><i class="fa-solid fa-map-location-dot"></i> Neighbors</h4>
        <div class="extra-tags">${neighbors}</div>
      </div>
    </div>

    <div class="dashboard-country-actions">
      <a href="https://www.google.com/maps/place/${country.commonName}" target="_blank" class="btn-map-link">
        <i class="fa-solid fa-map"></i> View on Google Maps
      </a>
    </div>
  `;
}

async function loadHolidayCount(code, year) {
  try {
    var response = await fetch("https://date.nager.at/api/v3/PublicHolidays/" + year + "/" + code);
    if (response.ok) {
      var holidays = await response.json();
      document.getElementById("stat-holidays").textContent = holidays.length;
    }
  } catch (error) {
    console.log("Error loading holiday count:", error);
  }
}

exploreBtn.addEventListener("click", function () {
  if (selectedCountryCode === "") {
    Swal.fire({
      icon: "warning",
      title: "Select a country first",
      text: "Please choose a country to explore.",
    });
  } else {
    selectedFlag.src = `https://flagcdn.com/w80/${selectedCountryCode.toLowerCase()}.png`;
    selectedFlag.alt = selectedCountryName;
    selectedNameBox.textContent = selectedCountryName;

    if (selectedCityName === "") {
      selectedCityBox.textContent = "";
    } else {
      selectedCityBox.textContent = "• " + selectedCityName;
    }

    selectedDestination.classList.remove("hidden");
    getDetails(selectedCountryCode);
    loadHolidayCount(selectedCountryCode, yearSelect.value);
  }
});

clearBtn.addEventListener("click", function () {
  selectedCountryCode = "";
  selectedCountryName = "";
  selectedCityName = "";

  selectedText.innerHTML = "Select Country";
  document.getElementById("city-selected-text").innerHTML = "Select City";
  selectedDestination.classList.add("hidden");

  infoBox.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon"><i class="fa-solid fa-globe"></i></div>
      <p>Select a country to view detailed information</p>
    </div>
  `;

  cityList.innerHTML = `<div class="custom-select-empty">Select a country first</div>`;

  currencyLoadedFor = "";
  showCurrencyEmpty();
});


// navigation
function showView(viewName) {
  for (var i = 0; i < views.length; i++) {
    views[i].classList.remove("active");
  }
  document.getElementById(viewName + "-view").classList.add("active");

  for (var j = 0; j < navItems.length; j++) {
    if (navItems[j].getAttribute("data-view") === viewName) {
      navItems[j].classList.add("active");
    } else {
      navItems[j].classList.remove("active");
    }
  }

  if (viewName === "holidays") {
    showHolidays();
  } else if (viewName === "events") {
    showEvents();
  } else if (viewName === "weather") {
    showWeather();
  } else if (viewName === "long-weekends") {
    showLongWeekends();
  } else if (viewName === "currency") {
    showCurrency();
  } else if (viewName === "sun-times") {
    showSunTimes();
  } else if (viewName === "my-plans") {
    showPlans();
  }
}

for (var n = 0; n < navItems.length; n++) {
  navItems[n].addEventListener("click", function (event) {
    event.preventDefault();
    showView(this.getAttribute("data-view"));
  });
}


// holidays
var holidaysContent = document.getElementById("holidays-content");
var holidaysSelection = document.getElementById("holidays-selection");

function showHolidays() {
  if (selectedCountryCode === "") {
    holidaysSelection.innerHTML = "";
    holidaysContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-calendar-xmark"></i></div>
        <h3>No Country Selected</h3>
        <p>Select a country from the dashboard to explore public holidays</p>
        <button class="btn-primary" id="go-dashboard-btn">
          <i class="fa-solid fa-globe"></i> Go to Dashboard
        </button>
      </div>
    `;
  } else {
    getHolidays(selectedCountryCode, yearSelect.value);
  }
}

holidaysContent.addEventListener("click", function (event) {
  var btn = event.target.closest("#go-dashboard-btn");
  if (btn) {
    showView("dashboard");
  }
});

async function getHolidays(code, year) {
  holidaysSelection.innerHTML = `
    <div class="current-selection-badge">
      <img src="https://flagcdn.com/w40/${code.toLowerCase()}.png" alt="${selectedCountryName}" class="selection-flag">
      <span>${selectedCountryName}</span>
      <span class="selection-year">${year}</span>
    </div>
  `;
  holidaysContent.innerHTML = `<div class="empty-state"><p>Loading holidays...</p></div>`;

  try {
    var response = await fetch("https://date.nager.at/api/v3/PublicHolidays/" + year + "/" + code);

    if (!response.ok) {
      holidaysContent.innerHTML = `<div class="empty-state"><p>No holidays found for this country.</p></div>`;
      return;
    }

    var holidays = await response.json();
    displayHolidays(holidays);
  } catch (error) {
    console.log("Error loading holidays:", error);
    holidaysContent.innerHTML = `<div class="empty-state"><p>Failed to load holidays. Please try again.</p></div>`;
  }
}

function displayHolidays(holidays) {
  if (holidays.length === 0) {
    holidaysContent.innerHTML = `<div class="empty-state"><p>No holidays found.</p></div>`;
    return;
  }

  var cards = "";
  for (var i = 0; i < holidays.length; i++) {
    var parts = holidays[i].date.split("-");
    var dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    var day = parseInt(parts[2]);
    var month = monthNames[parseInt(parts[1]) - 1];
    var dayName = dayNames[dateObj.getDay()];

    var plan = {
      id: "holiday-" + selectedCountryCode + "-" + holidays[i].date + "-" + i,
      type: "holiday",
      title: holidays[i].localName,
      subtitle: holidays[i].name,
      date: dayName + ", " + day + " " + month + " " + parts[0],
      countryCode: selectedCountryCode,
      country: selectedCountryName,
    };

    cards += `
      <div class="holiday-card">
        <div class="holiday-card-header">
          <div class="holiday-date-box"><span class="day">${day}</span><span class="month">${month}</span></div>
          ${heartButton(plan, "holiday-action-btn")}
        </div>
        <h3>${holidays[i].localName}</h3>
        <p class="holiday-name">${holidays[i].name}</p>
        <div class="holiday-card-footer">
          <span class="holiday-day-badge"><i class="fa-regular fa-calendar"></i> ${dayName}</span>
          <span class="holiday-type-badge">${holidays[i].types[0]}</span>
        </div>
      </div>
    `;
  }
  holidaysContent.innerHTML = cards;
  document.getElementById("stat-holidays").textContent = holidays.length;
}


// events (no api for this one so the data is fake)
var eventsContent = document.getElementById("events-content");
var eventsSelection = document.getElementById("events-selection");

function showEvents() {
  if (selectedCountryCode === "") {
    eventsSelection.innerHTML = "";
    eventsContent.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon"><i class="fa-solid fa-ticket"></i></div>
        <h3>No Country Selected</h3>
        <p>Select a country and city from the dashboard to discover events</p>
        <button class="btn-primary" id="go-dashboard-events-btn">
          <i class="fa-solid fa-globe"></i> Go to Dashboard
        </button>
      </div>
    `;
  } else if (selectedCityName === "") {
    eventsSelection.innerHTML = `
      <div class="current-selection-badge">
        <img src="https://flagcdn.com/w40/${selectedCountryCode.toLowerCase()}.png" alt="${selectedCountryName}" class="selection-flag">
        <span>${selectedCountryName}</span>
      </div>
    `;
    eventsContent.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon"><i class="fa-solid fa-ticket"></i></div>
        <h3>No City Selected</h3>
        <p>Select a city from the dashboard to discover events</p>
        <button class="btn-primary" id="go-dashboard-events-btn">
          <i class="fa-solid fa-globe"></i> Go to Dashboard
        </button>
      </div>
    `;
  } else {
    eventsSelection.innerHTML = `
      <div class="current-selection-badge">
        <img src="https://flagcdn.com/w40/${selectedCountryCode.toLowerCase()}.png" alt="${selectedCountryName}" class="selection-flag">
        <span>${selectedCountryName}</span>
        <span class="selection-city">• ${selectedCityName}</span>
      </div>
    `;
    getEvents(selectedCityName, selectedCountryCode);
  }
}

function getEvents(city, countryCode) {
  var templates = [
    {
      title: "Jazz Night Live in ",
      category: "Music",
      date: "Feb 15, 2027 at 20:00",
      place: "Opera House",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop",
    },
    {
      title: "Football Match in ",
      category: "Sports",
      date: "Feb 22, 2027 at 19:00",
      place: "City Stadium",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop",
    },
    {
      title: "Theatre Play in ",
      category: "Arts",
      date: "Mar 5, 2027 at 21:00",
      place: "Cultural Center",
      image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=200&fit=crop",
    },
    {
      title: "Symphony Orchestra in ",
      category: "Music",
      date: "Mar 12, 2027 at 19:30",
      place: "Concert Hall",
      image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=200&fit=crop",
    },
  ];

  var cards = "";
  for (var i = 0; i < templates.length; i++) {
    var plan = {
      id: "event-" + countryCode + "-" + city + "-" + i,
      type: "event",
      title: templates[i].title + city,
      subtitle: templates[i].place + ", " + city,
      date: templates[i].date,
      countryCode: countryCode,
      country: selectedCountryName,
    };

    cards += `
      <div class="event-card">
        <div class="event-card-image">
          <img src="${templates[i].image}" alt="${templates[i].title}${city}">
          <span class="event-card-category">${templates[i].category}</span>
          ${heartButton(plan, "event-card-save")}
        </div>
        <div class="event-card-body">
          <h3>${templates[i].title}${city}</h3>
          <div class="event-card-info">
            <div><i class="fa-regular fa-calendar"></i>${templates[i].date}</div>
            <div><i class="fa-solid fa-location-dot"></i>${templates[i].place}, ${city}</div>
          </div>
          <div class="event-card-footer">
            ${heartButton(plan, "btn-event", "Save")}
            <a href="#" class="btn-buy-ticket"><i class="fa-solid fa-ticket"></i> Buy Tickets</a>
          </div>
        </div>
      </div>
    `;
  }
  eventsContent.innerHTML = cards;
}

eventsContent.addEventListener("click", function (event) {
  var btn = event.target.closest("#go-dashboard-events-btn");
  if (btn) {
    showView("dashboard");
  }
});


// weather
var weatherContent = document.getElementById("weather-content");
var weatherSelection = document.getElementById("weather-selection");

function showWeather() {
  if (selectedCityName === "") {
    weatherSelection.innerHTML = "";
    weatherContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon weather-anim-icon">
          <i class="fa-solid fa-question icon-question"></i>
          <i class="fa-solid fa-exclamation icon-exclaim"></i>
        </div>
        <h3>No City Selected</h3>
        <p>Select a country and city from the dashboard to see the weather forecast</p>
        <button class="btn-primary" id="go-dashboard-weather-btn">
          <i class="fa-solid fa-globe"></i> Go to Dashboard
        </button>
      </div>
    `;
  } else {
    weatherSelection.innerHTML = `
      <div class="current-selection-badge">
        <img src="https://flagcdn.com/w40/${selectedCountryCode.toLowerCase()}.png" alt="${selectedCountryName}" class="selection-flag">
        <span>${selectedCountryName}</span>
        <span class="selection-city">• ${selectedCityName}</span>
      </div>
    `;
    getWeather(selectedCityName, selectedCountryCode);
  }
}

weatherContent.addEventListener("click", function (event) {
  var btn = event.target.closest("#go-dashboard-weather-btn");
  if (btn) {
    showView("dashboard");
  }
});

function getWeatherInfo(code) {
  if (code === 0) {
    return { text: "Clear sky", icon: "fa-sun" };
  } else if (code === 1) {
    return { text: "Mainly clear", icon: "fa-cloud-sun" };
  } else if (code === 2) {
    return { text: "Partly cloudy", icon: "fa-cloud-sun" };
  } else if (code === 3) {
    return { text: "Overcast", icon: "fa-cloud" };
  } else if (code === 45 || code === 48) {
    return { text: "Fog", icon: "fa-smog" };
  } else if (code >= 51 && code <= 57) {
    return { text: "Drizzle", icon: "fa-cloud-rain" };
  } else if (code >= 61 && code <= 67) {
    return { text: "Rain", icon: "fa-cloud-showers-heavy" };
  } else if (code >= 71 && code <= 77) {
    return { text: "Snow", icon: "fa-snowflake" };
  } else if (code >= 80 && code <= 82) {
    return { text: "Rain showers", icon: "fa-cloud-showers-heavy" };
  } else if (code >= 95) {
    return { text: "Thunderstorm", icon: "fa-bolt" };
  } else {
    return { text: "Unknown", icon: "fa-cloud" };
  }
}

function formatHour(hour) {
  var suffix = "AM";
  if (hour >= 12) {
    suffix = "PM";
  }
  var h = hour % 12;
  if (h === 0) {
    h = 12;
  }
  return h + " " + suffix;
}

function showWeatherMessage(icon, title, text) {
  weatherContent.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon"><i class="fa-solid ${icon}"></i></div>
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `;
}

// get lat and lon of the city (used by weather and sun times)
async function findPlace(city, countryCode) {
  var geoResponse = await fetch(
    "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) +
    "&count=10&language=en&countryCode=" + countryCode
  );

  if (!geoResponse.ok) {
    return null;
  }

  var geoData = await geoResponse.json();

  if (!geoData.results || geoData.results.length === 0) {
    return null;
  }

  // try to find the one in the same country
  var place = geoData.results[0];
  for (var i = 0; i < geoData.results.length; i++) {
    if (geoData.results[i].country_code === countryCode) {
      place = geoData.results[i];
      break;
    }
  }
  return place;
}

async function getWeather(city, countryCode) {
  showWeatherMessage("fa-cloud-sun", "Loading weather...", "Getting the forecast for " + city);

  try {
    var place = await findPlace(city, countryCode);

    if (place === null) {
      showWeatherMessage("fa-location-crosshairs", "Location not found", "No weather data found for " + city + ". Try another city.");
      return;
    }

    var url =
      "https://api.open-meteo.com/v1/forecast?latitude=" + place.latitude +
      "&longitude=" + place.longitude +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index" +
      "&hourly=temperature_2m,weather_code,precipitation_probability" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max" +
      "&timezone=auto";

    var response = await fetch(url);

    if (!response.ok) {
      showWeatherMessage("fa-triangle-exclamation", "Something went wrong", "Failed to load the forecast. Please try again.");
      return;
    }

    var data = await response.json();
    displayWeather(data, city);
  } catch (error) {
    console.log("Error loading weather:", error);
    showWeatherMessage("fa-triangle-exclamation", "Something went wrong", "Failed to load weather. Please check your connection and try again.");
  }
}

function displayWeather(data, city) {
  var current = data.current;
  var daily = data.daily;
  var hourly = data.hourly;
  var info = getWeatherInfo(current.weather_code);

  var dateParts = current.time.slice(0, 10).split("-");
  var dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  var dateText = dayNames[dateObj.getDay()] + ", " + parseInt(dateParts[2]) + " " + monthNames[parseInt(dateParts[1]) - 1] + " " + dateParts[0];

  var uv = "N/A";
  if (current.uv_index !== undefined && current.uv_index !== null) {
    uv = Math.round(current.uv_index);
  } else if (daily.uv_index_max) {
    uv = Math.round(daily.uv_index_max[0]);
  }

  var precip = 0;
  if (daily.precipitation_probability_max && daily.precipitation_probability_max[0]) {
    precip = daily.precipitation_probability_max[0];
  }

  // find the current hour in the hourly list
  var hourKey = current.time.slice(0, 13);
  var startIndex = 0;
  for (var i = 0; i < hourly.time.length; i++) {
    if (hourly.time[i].slice(0, 13) === hourKey) {
      startIndex = i;
      break;
    }
  }

  // next 8 hours
  var hourlyItems = "";
  for (var h = startIndex; h < startIndex + 8 && h < hourly.time.length; h++) {
    var hourInfo = getWeatherInfo(hourly.weather_code[h]);
    var label = formatHour(parseInt(hourly.time[h].slice(11, 13)));
    var nowClass = "";
    if (h === startIndex) {
      label = "Now";
      nowClass = " now";
    }
    hourlyItems += `
      <div class="hourly-item${nowClass}">
        <span class="hourly-time">${label}</span>
        <div class="hourly-icon"><i class="fa-solid ${hourInfo.icon}"></i></div>
        <span class="hourly-temp">${Math.round(hourly.temperature_2m[h])}°</span>
      </div>
    `;
  }

  // 7 days
  var forecastItems = "";
  for (var d = 0; d < daily.time.length; d++) {
    var p = daily.time[d].split("-");
    var dObj = new Date(p[0], p[1] - 1, p[2]);
    var dayLabel = dayNames[dObj.getDay()].slice(0, 3);
    var todayClass = "";
    if (d === 0) {
      dayLabel = "Today";
      todayClass = " today";
    }
    var dayInfo = getWeatherInfo(daily.weather_code[d]);
    var rain = "";
    if (daily.precipitation_probability_max && daily.precipitation_probability_max[d]) {
      rain = `<i class="fa-solid fa-droplet"></i><span>${daily.precipitation_probability_max[d]}%</span>`;
    }
    forecastItems += `
      <div class="forecast-day${todayClass}">
        <div class="forecast-day-name"><span class="day-label">${dayLabel}</span><span class="day-date">${parseInt(p[2])} ${monthNames[parseInt(p[1]) - 1]}</span></div>
        <div class="forecast-icon"><i class="fa-solid ${dayInfo.icon}"></i></div>
        <div class="forecast-temps"><span class="temp-max">${Math.round(daily.temperature_2m_max[d])}°</span><span class="temp-min">${Math.round(daily.temperature_2m_min[d])}°</span></div>
        <div class="forecast-precip">${rain}</div>
      </div>
    `;
  }

  weatherContent.innerHTML = `
    <div class="weather-hero-card weather-sunny">
      <div class="weather-location">
        <i class="fa-solid fa-location-dot"></i>
        <span>${city}</span>
        <span class="weather-time">${dateText}</span>
      </div>
      <div class="weather-hero-main">
        <div class="weather-hero-left">
          <div class="weather-hero-icon"><i class="fa-solid ${info.icon}"></i></div>
          <div class="weather-hero-temp">
            <span class="temp-value">${Math.round(current.temperature_2m)}</span>
            <span class="temp-unit">°C</span>
          </div>
        </div>
        <div class="weather-hero-right">
          <div class="weather-condition">${info.text}</div>
          <div class="weather-feels">Feels like ${Math.round(current.apparent_temperature)}°C</div>
          <div class="weather-high-low">
            <span class="high"><i class="fa-solid fa-arrow-up"></i> ${Math.round(daily.temperature_2m_max[0])}°</span>
            <span class="low"><i class="fa-solid fa-arrow-down"></i> ${Math.round(daily.temperature_2m_min[0])}°</span>
          </div>
        </div>
      </div>
    </div>

    <div class="weather-details-grid">
      <div class="weather-detail-card">
        <div class="detail-icon humidity"><i class="fa-solid fa-droplet"></i></div>
        <div class="detail-info">
          <span class="detail-label">Humidity</span>
          <span class="detail-value">${current.relative_humidity_2m}%</span>
        </div>
      </div>
      <div class="weather-detail-card">
        <div class="detail-icon wind"><i class="fa-solid fa-wind"></i></div>
        <div class="detail-info">
          <span class="detail-label">Wind</span>
          <span class="detail-value">${Math.round(current.wind_speed_10m)} km/h</span>
        </div>
      </div>
      <div class="weather-detail-card">
        <div class="detail-icon uv"><i class="fa-solid fa-sun"></i></div>
        <div class="detail-info">
          <span class="detail-label">UV Index</span>
          <span class="detail-value">${uv}</span>
        </div>
      </div>
      <div class="weather-detail-card">
        <div class="detail-icon precip"><i class="fa-solid fa-cloud-rain"></i></div>
        <div class="detail-info">
          <span class="detail-label">Precipitation</span>
          <span class="detail-value">${precip}%</span>
        </div>
      </div>
    </div>

    <div class="weather-section">
      <h3 class="weather-section-title"><i class="fa-solid fa-clock"></i> Hourly Forecast</h3>
      <div class="hourly-scroll">${hourlyItems}</div>
    </div>

    <div class="weather-section">
      <h3 class="weather-section-title"><i class="fa-solid fa-calendar-week"></i> 7-Day Forecast</h3>
      <div class="forecast-list">${forecastItems}</div>
    </div>
  `;
}


// long weekends
var lwContent = document.getElementById("lw-content");
var lwSelection = document.getElementById("lw-selection");

function showLongWeekends() {
  if (selectedCountryCode === "" || selectedCityName === "") {
    lwSelection.innerHTML = "";

    var title = "No Country Selected";
    var message = "Select a country and city from the dashboard to discover long weekend opportunities";

    if (selectedCountryCode !== "" && selectedCityName === "") {
      title = "No City Selected";
      message = "Select a city from the dashboard to discover long weekend opportunities";
    }

    lwContent.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon"><i class="fa-solid fa-umbrella-beach"></i></div>
        <h3>${title}</h3>
        <p>${message}</p>
        <button class="btn-primary" id="go-dashboard-lw-btn">
          <i class="fa-solid fa-globe"></i> Go to Dashboard
        </button>
      </div>
    `;
    return;
  }

  var year = yearSelect.value;

  lwSelection.innerHTML = `
    <div class="current-selection-badge">
      <img src="https://flagcdn.com/w40/${selectedCountryCode.toLowerCase()}.png" alt="${selectedCountryName}" class="selection-flag">
      <span>${selectedCountryName}</span>
      <span class="selection-year">${year}</span>
    </div>
  `;

  getLongWeekends(selectedCountryCode, year);
}

lwContent.addEventListener("click", function (event) {
  var btn = event.target.closest("#go-dashboard-lw-btn");
  if (btn) {
    showView("dashboard");
  }
});

async function getLongWeekends(code, year) {
  lwContent.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <p>Loading long weekends...</p>
    </div>
  `;

  try {
    var response = await fetch("https://date.nager.at/api/v3/LongWeekend/" + year + "/" + code);

    if (!response.ok) {
      throw new Error("Failed to load long weekends");
    }

    var data = await response.json();
    displayLongWeekends(data);
  } catch (error) {
    console.log("Error loading long weekends:", error);

    lwContent.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <h3>Something went wrong</h3>
        <p>Failed to load long weekends. Please try again.</p>
      </div>
    `;
  }
}

function displayLongWeekends(weekends) {
  if (weekends.length === 0) {
    lwContent.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>No Long Weekends Found</h3>
        <p>No long weekends available for this year.</p>
      </div>
    `;
    return;
  }

  var cards = "";

  for (var i = 0; i < weekends.length; i++) {
    var startDate = new Date(weekends[i].startDate);
    var endDate = new Date(weekends[i].endDate);

    // one box for each day
    var days = "";
    var currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      var dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" });
      var dayNumber = currentDate.getDate();
      var weekendClass = "";

      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        weekendClass = "weekend";
      }

      days += `
        <div class="lw-day ${weekendClass}">
          <span class="name">${dayName}</span>
          <span class="num">${dayNumber}</span>
        </div>
      `;

      currentDate.setDate(currentDate.getDate() + 1);
    }

    var infoClass = "success";
    var infoIcon = "fa-check-circle";
    var infoText = "No extra days off needed!";

    if (weekends[i].needBridgeDay) {
      infoClass = "warning";
      infoIcon = "fa-info-circle";
      infoText = "Requires taking a bridge day off";
    }

    var startText = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    var endText = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    var plan = {
      id: "lw-" + selectedCountryCode + "-" + weekends[i].startDate,
      type: "longweekend",
      title: weekends[i].dayCount + " Day Long Weekend",
      subtitle: infoText,
      date: startText + " - " + endText,
      countryCode: selectedCountryCode,
      country: selectedCountryName,
    };

    cards += `
      <div class="lw-card">
        <div class="lw-card-header">
          <span class="lw-badge"><i class="fa-solid fa-calendar-days"></i> ${weekends[i].dayCount} Days</span>
          ${heartButton(plan, "holiday-action-btn")}
        </div>

        <h3>Long Weekend #${i + 1}</h3>

        <div class="lw-dates">
          <i class="fa-regular fa-calendar"></i> ${startText} - ${endText}
        </div>

        <div class="lw-info-box ${infoClass}">
          <i class="fa-solid ${infoIcon}"></i> ${infoText}
        </div>

        <div class="lw-days-visual">${days}</div>
      </div>
    `;
  }

  lwContent.innerHTML = cards;
}


// currency
var CURRENCY_URL = "https://open.er-api.com/v6/latest/USD";
var currencyAmount = document.getElementById("currency-amount");
var currencyFrom = document.getElementById("currency-from");
var currencyTo = document.getElementById("currency-to");
var currencyResult = document.getElementById("currency-result");
var popularCurrencies = document.getElementById("popular-currencies");
var swapBtn = document.getElementById("swap-currencies-btn");
var convertBtn = document.getElementById("convert-btn");

var quickList = ["EUR", "GBP", "AED", "SAR", "JPY", "CAD", "INR"];
var currencyNames = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  JPY: "Japanese Yen",
  CAD: "Canadian Dollar",
  INR: "Indian Rupee",
  EGP: "Egyptian Pound",
};
var currencyRates = {};
var currencyLastUpdate = "";
var currencyDataLoaded = false;
var currencyLoadedFor = "";
var localCurrency = "";
var countriesCurrencyList = [];

function getCurrencyName(code) {
  if (currencyNames[code] !== undefined) {
    return currencyNames[code];
  }
  return code;
}

function showCurrencyEmpty() {
  currencyFrom.classList.add("hidden");
  currencyTo.classList.add("hidden");
  currencyResult.classList.add("hidden");
  currencyResult.innerHTML = "";
  popularCurrencies.innerHTML = "";
}

function showCurrency() {
  if (selectedCountryCode === "") {
    currencyLoadedFor = "";
    showCurrencyEmpty();
  } else if (currencyLoadedFor !== selectedCountryCode) {
    loadCurrency(selectedCountryCode);
  }
}

async function loadCurrency(code) {
  try {
    // currency of every country (only the first time)
    if (countriesCurrencyList.length === 0) {
      var currencyResponse = await fetch("https://countriesnow.space/api/v0.1/countries/currency");

      if (!currencyResponse.ok) {
        throw new Error("Country currency failed");
      }

      var currencyData = await currencyResponse.json();
      countriesCurrencyList = currencyData.data;
    }

    localCurrency = "USD";
    for (var i = 0; i < countriesCurrencyList.length; i++) {
      if (countriesCurrencyList[i].iso2 === code) {
        localCurrency = countriesCurrencyList[i].currency;
        break;
      }
    }

    // exchange rates (only the first time)
    if (currencyDataLoaded === false) {
      var ratesResponse = await fetch(CURRENCY_URL);

      if (!ratesResponse.ok) {
        throw new Error("Rates failed");
      }

      var ratesData = await ratesResponse.json();

      if (ratesData.result !== "success") {
        throw new Error("Rates failed");
      }

      currencyRates = ratesData.rates;
      currencyLastUpdate = ratesData.time_last_update_utc;
      fillCurrencySelects();
      currencyDataLoaded = true;
    }

    var toCode = localCurrency;
    if (localCurrency === "USD" || currencyRates[localCurrency] === undefined) {
      toCode = "EUR";
    }

    currencyFrom.classList.remove("hidden");
    currencyTo.classList.remove("hidden");
    currencyFrom.value = "USD";
    currencyTo.value = toCode;

    currencyLoadedFor = code;
    convertCurrency();
    displayPopularCurrencies();
  } catch (error) {
    console.log("Error loading currency:", error);
    Swal.fire({
      icon: "error",
      title: "Something went wrong",
      text: "Failed to load currency data. Please try again.",
    });
  }
}

function fillCurrencySelects() {
  var options = "";
  var codes = Object.keys(currencyRates);
  for (var i = 0; i < codes.length; i++) {
    options += `<option value="${codes[i]}">${codes[i]}</option>`;
  }
  currencyFrom.innerHTML = options;
  currencyTo.innerHTML = options;
}

function convertCurrency() {
  var amount = Number(currencyAmount.value);

  if (isNaN(amount) || amount <= 0) {
    Swal.fire({
      icon: "warning",
      title: "Invalid amount",
      text: "Please enter an amount greater than 0.",
    });
    return;
  }

  var from = currencyFrom.value;
  var to = currencyTo.value;
  var rate = currencyRates[to] / currencyRates[from];
  var total = amount * rate;

  var rateText = rate.toFixed(2);
  if (rate < 1) {
    rateText = rate.toFixed(4);
  }

  var updated = new Date(currencyLastUpdate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  currencyResult.innerHTML = `
    <div class="conversion-display">
      <div class="conversion-from">
        <span class="amount">${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span class="currency-code">${from}</span>
      </div>
      <div class="conversion-equals"><i class="fa-solid fa-equals"></i></div>
      <div class="conversion-to">
        <span class="amount">${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span class="currency-code">${to}</span>
      </div>
    </div>
    <div class="exchange-rate-info">
      <p>1 ${from} = ${rateText} ${to}</p>
      <small>Last updated: ${updated}</small>
    </div>
  `;
  currencyResult.classList.remove("hidden");
}

function displayPopularCurrencies() {
  var list = quickList.slice();

  // put the local currency in the list too
  if (localCurrency !== "USD" && list.indexOf(localCurrency) === -1) {
    list.splice(2, 0, localCurrency);
  }

  var cards = "";
  for (var i = 0; i < list.length; i++) {
    var code = list[i];
    if (currencyRates[code] !== undefined) {
      cards += `
        <div class="popular-currency-card">
          <img src="https://flagcdn.com/w40/${code.slice(0, 2).toLowerCase()}.png" alt="${code}" class="flag">
          <div class="info">
            <div class="code">${code}</div>
            <div class="name">${getCurrencyName(code)}</div>
          </div>
          <div class="rate">${currencyRates[code].toFixed(4)}</div>
        </div>
      `;
    }
  }
  popularCurrencies.innerHTML = cards;
}

convertBtn.addEventListener("click", convertCurrency);

swapBtn.addEventListener("click", function () {
  var temp = currencyFrom.value;
  currencyFrom.value = currencyTo.value;
  currencyTo.value = temp;
  convertCurrency();
});


// sun times
var sunContent = document.getElementById("sun-times-content");
var sunSelection = document.getElementById("sun-selection");

function showSunTimes() {
  if (selectedCityName === "") {
    sunSelection.innerHTML = "";
    sunContent.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon"><i class="fa-solid fa-sun"></i></div>
        <h3>No City Selected</h3>
        <p>Select a country and city from the dashboard to see sunrise and sunset times</p>
        <button class="btn-primary" id="go-dashboard-sun-btn">
          <i class="fa-solid fa-globe"></i> Go to Dashboard
        </button>
      </div>
    `;
  } else {
    sunSelection.innerHTML = `
      <div class="current-selection-badge">
        <img src="https://flagcdn.com/w40/${selectedCountryCode.toLowerCase()}.png" alt="${selectedCountryName}" class="selection-flag">
        <span>${selectedCountryName}</span>
        <span class="selection-city">• ${selectedCityName}</span>
      </div>
    `;
    getSunTimes(selectedCityName, selectedCountryCode);
  }
}

sunContent.addEventListener("click", function (event) {
  var btn = event.target.closest("#go-dashboard-sun-btn");
  if (btn) {
    showView("dashboard");
  }
});

function showSunMessage(icon, title, text) {
  sunContent.innerHTML = `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <div class="empty-icon"><i class="fa-solid ${icon}"></i></div>
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `;
}

async function getSunTimes(city, countryCode) {
  showSunMessage("fa-sun", "Loading sun times...", "Getting sunrise and sunset for " + city);

  try {
    var place = await findPlace(city, countryCode);

    if (place === null) {
      showSunMessage("fa-location-crosshairs", "Location not found", "No sun times found for " + city + ". Try another city.");
      return;
    }

    var timezone = place.timezone;
    if (timezone === undefined) {
      timezone = "UTC";
    }

    // today's date in the city's timezone
    var today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });

    var response = await fetch(
      "https://api.sunrise-sunset.org/json?lat=" + place.latitude +
      "&lng=" + place.longitude +
      "&date=" + today +
      "&formatted=0"
    );

    if (!response.ok) {
      showSunMessage("fa-triangle-exclamation", "Something went wrong", "Failed to load sun times. Please try again.");
      return;
    }

    var data = await response.json();

    if (data.status !== "OK") {
      showSunMessage("fa-triangle-exclamation", "Something went wrong", "No sun data available for this location.");
      return;
    }

    displaySunTimes(data.results, city, timezone);
  } catch (error) {
    console.log("Error loading sun times:", error);
    showSunMessage("fa-triangle-exclamation", "Something went wrong", "Failed to load sun times. Please check your connection and try again.");
  }
}

function formatSunTime(isoTime, timezone) {
  return new Date(isoTime).toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displaySunTimes(results, city, timezone) {
  var now = new Date();

  var dateText = now.toLocaleDateString("en-US", {
    timeZone: timezone,
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  var dayText = now.toLocaleDateString("en-US", {
    timeZone: timezone,
    weekday: "long",
  });

  // day_length comes in seconds
  var dayLength = results.day_length;
  var hours = Math.floor(dayLength / 3600);
  var minutes = Math.floor((dayLength % 3600) / 60);
  var dayLengthText = hours + "h " + minutes + "m";

  var darkSeconds = 86400 - dayLength;
  var darkHours = Math.floor(darkSeconds / 3600);
  var darkMinutes = Math.floor((darkSeconds % 3600) / 60);
  var darkText = darkHours + "h " + darkMinutes + "m";

  var percent = ((dayLength / 86400) * 100).toFixed(1);

  sunContent.innerHTML = `
    <div class="sun-main-card">
      <div class="sun-main-header">
        <div class="sun-location">
          <h2><i class="fa-solid fa-location-dot"></i> ${city}</h2>
          <p>Sun times for your selected location</p>
        </div>
        <div class="sun-date-display">
          <div class="date">${dateText}</div>
          <div class="day">${dayText}</div>
        </div>
      </div>

      <div class="sun-times-grid">
        <div class="sun-time-card dawn">
          <div class="icon"><i class="fa-solid fa-moon"></i></div>
          <div class="label">Dawn</div>
          <div class="time">${formatSunTime(results.civil_twilight_begin, timezone)}</div>
          <div class="sub-label">Civil Twilight</div>
        </div>
        <div class="sun-time-card sunrise">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Sunrise</div>
          <div class="time">${formatSunTime(results.sunrise, timezone)}</div>
          <div class="sub-label">Golden Hour Start</div>
        </div>
        <div class="sun-time-card noon">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Solar Noon</div>
          <div class="time">${formatSunTime(results.solar_noon, timezone)}</div>
          <div class="sub-label">Sun at Highest</div>
        </div>
        <div class="sun-time-card sunset">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Sunset</div>
          <div class="time">${formatSunTime(results.sunset, timezone)}</div>
          <div class="sub-label">Golden Hour End</div>
        </div>
        <div class="sun-time-card dusk">
          <div class="icon"><i class="fa-solid fa-moon"></i></div>
          <div class="label">Dusk</div>
          <div class="time">${formatSunTime(results.civil_twilight_end, timezone)}</div>
          <div class="sub-label">Civil Twilight</div>
        </div>
        <div class="sun-time-card daylight">
          <div class="icon"><i class="fa-solid fa-hourglass-half"></i></div>
          <div class="label">Day Length</div>
          <div class="time">${dayLengthText}</div>
          <div class="sub-label">Total Daylight</div>
        </div>
      </div>
    </div>

    <div class="day-length-card">
      <h3><i class="fa-solid fa-chart-pie"></i> Daylight Distribution</h3>
      <div class="day-progress">
        <div class="day-progress-bar">
          <div class="day-progress-fill" style="width: ${percent}%"></div>
        </div>
      </div>
      <div class="day-length-stats">
        <div class="day-stat">
          <div class="value">${dayLengthText}</div>
          <div class="label">Daylight</div>
        </div>
        <div class="day-stat">
          <div class="value">${percent}%</div>
          <div class="label">of 24 Hours</div>
        </div>
        <div class="day-stat">
          <div class="value">${darkText}</div>
          <div class="label">Darkness</div>
        </div>
      </div>
    </div>
  `;
}


// my plans
var savedPlans = [];
var currentPlans = {};
var plansFilter = "all";
var plansContent = document.getElementById("plans-content");
var clearPlansBtn = document.getElementById("clear-all-plans-btn");

var storedPlans = localStorage.getItem("savedPlans");
if (storedPlans !== null) {
  savedPlans = JSON.parse(storedPlans);
}

function savePlansToStorage() {
  localStorage.setItem("savedPlans", JSON.stringify(savedPlans));
}

function findSavedIndex(id) {
  for (var i = 0; i < savedPlans.length; i++) {
    if (savedPlans[i].id === id) {
      return i;
    }
  }
  return -1;
}

function countPlans(type) {
  if (type === "all") {
    return savedPlans.length;
  }
  var count = 0;
  for (var i = 0; i < savedPlans.length; i++) {
    if (savedPlans[i].type === type) {
      count++;
    }
  }
  return count;
}

function heartButton(plan, buttonClass, label) {
  // save the plan here so togglePlan can find it later
  currentPlans[plan.id] = plan;

  var icon = "fa-regular";
  var savedClass = "";
  var text = "";

  if (label !== undefined) {
    text = " " + label;
  }

  if (findSavedIndex(plan.id) !== -1) {
    icon = "fa-solid";
    savedClass = " saved";
    if (label !== undefined) {
      text = " Saved";
    }
  }

  return `<button class="${buttonClass}${savedClass}" data-plan-id="${plan.id}"><i class="${icon} fa-heart"></i>${text}</button>`;
}

function updateHeartButtons() {
  var buttons = document.querySelectorAll("[data-plan-id]");
  for (var i = 0; i < buttons.length; i++) {
    var id = buttons[i].getAttribute("data-plan-id");
    var isSaved = findSavedIndex(id) !== -1;
    var isTextButton = buttons[i].classList.contains("btn-event");

    if (isSaved) {
      buttons[i].classList.add("saved");
      if (isTextButton) {
        buttons[i].innerHTML = `<i class="fa-solid fa-heart"></i> Saved`;
      } else {
        buttons[i].innerHTML = `<i class="fa-solid fa-heart"></i>`;
      }
    } else {
      buttons[i].classList.remove("saved");
      if (isTextButton) {
        buttons[i].innerHTML = `<i class="fa-regular fa-heart"></i> Save`;
      } else {
        buttons[i].innerHTML = `<i class="fa-regular fa-heart"></i>`;
      }
    }
  }
}

function updatePlansCount() {
  var statSaved = document.getElementById("stat-saved");
  if (statSaved) {
    statSaved.textContent = savedPlans.length;
  }

  document.getElementById("filter-all-count").textContent = countPlans("all");
  document.getElementById("filter-holiday-count").textContent = countPlans("holiday");
  document.getElementById("filter-event-count").textContent = countPlans("event");
  document.getElementById("filter-lw-count").textContent = countPlans("longweekend");
}

function togglePlan(id) {
  var index = findSavedIndex(id);

  if (index !== -1) {
    savedPlans.splice(index, 1);
  } else {
    savedPlans.push(currentPlans[id]);
  }

  savePlansToStorage();
  updateHeartButtons();
  updatePlansCount();
}

function showPlans() {
  var filters = document.querySelectorAll(".plan-filter");
  for (var t = 0; t < filters.length; t++) {
    if (filters[t].getAttribute("data-filter") === plansFilter) {
      filters[t].classList.add("active");
    } else {
      filters[t].classList.remove("active");
    }
  }

  var visible = [];
  for (var i = 0; i < savedPlans.length; i++) {
    if (plansFilter === "all" || savedPlans[i].type === plansFilter) {
      visible.push(savedPlans[i]);
    }
  }

  if (visible.length === 0) {
    plansContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-heart-crack"></i></div>
        <h3>No Saved Plans Yet</h3>
        <p>Start exploring and save holidays, events, or long weekends you like!</p>
        <button class="btn-primary" id="start-exploring-btn">
          <i class="fa-solid fa-compass"></i> Start Exploring
        </button>
      </div>
    `;
    return;
  }

  var cards = "";
  for (var j = 0; j < visible.length; j++) {
    var plan = visible[j];
    var typeIcon = "fa-calendar-check";
    var typeLabel = "Holiday";

    if (plan.type === "event") {
      typeIcon = "fa-ticket";
      typeLabel = "Event";
    } else if (plan.type === "longweekend") {
      typeIcon = "fa-umbrella-beach";
      typeLabel = "Long Weekend";
    }

    cards += `
      <div class="saved-plan-card">
        <div class="saved-plan-top">
          <span class="saved-plan-type"><i class="fa-solid ${typeIcon}"></i> ${typeLabel}</span>
          <button class="saved-plan-remove" data-remove-id="${plan.id}"><i class="fa-solid fa-heart"></i></button>
        </div>
        <h3>${plan.title}</h3>
        <p>${plan.subtitle}</p>
        <div class="saved-plan-footer">
          <span class="saved-plan-country">
            <img src="https://flagcdn.com/w40/${plan.countryCode.toLowerCase()}.png" alt="${plan.country}" class="selection-flag">
            ${plan.country}
          </span>
          <span><i class="fa-regular fa-calendar"></i> ${plan.date}</span>
        </div>
      </div>
    `;
  }
  plansContent.innerHTML = cards;
}

document.addEventListener("click", function (event) {
  var heartBtn = event.target.closest("[data-plan-id]");
  if (heartBtn) {
    togglePlan(heartBtn.getAttribute("data-plan-id"));
    return;
  }

  var removeBtn = event.target.closest("[data-remove-id]");
  if (removeBtn) {
    togglePlan(removeBtn.getAttribute("data-remove-id"));
    showPlans();
    return;
  }

  var filterBtn = event.target.closest(".plan-filter");
  if (filterBtn) {
    plansFilter = filterBtn.getAttribute("data-filter");
    showPlans();
    return;
  }

  var startBtn = event.target.closest("#start-exploring-btn");
  if (startBtn) {
    showView("dashboard");
  }
});

clearPlansBtn.addEventListener("click", function () {
  if (savedPlans.length === 0) {
    return;
  }

  Swal.fire({
    icon: "warning",
    title: "Clear all plans?",
    text: "All your saved plans will be removed.",
    showCancelButton: true,
    confirmButtonText: "Yes, clear all",
  }).then(function (result) {
    if (result.isConfirmed) {
      savedPlans = [];
      savePlansToStorage();
      updateHeartButtons();
      updatePlansCount();
      showPlans();
    }
  });
});

updatePlansCount();
showPlans();


// date and time in the navbar
var dateTimeBox = document.getElementById("current-datetime");

function updateDateTime() {
  var now = new Date();

  var dateText = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  var timeText = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (dateTimeBox !== null) {
    dateTimeBox.textContent = dateText + ", " + timeText;
  }
}

updateDateTime();
setInterval(updateDateTime, 1000);