// API base URL
const API_BASE_URL = "https://api.weatherapi.com/v1"
const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY

// Types for the API responses
export interface WeatherLocation {
  name: string
  region: string
  country: string
  lat: number
  lon: number
}

export interface WeatherCondition {
  text: string
  icon: string
  code: number
}

export interface CurrentWeather {
  temp_c: number
  temp_f: number
  feelslike_c: number
  feelslike_f: number
  condition: WeatherCondition
  wind_kph: number
  wind_mph: number
  wind_dir: string
  pressure_mb: number
  precip_mm: number
  humidity: number
  cloud: number
  is_day: number
  uv: number
  vis_km: number
}

export interface ForecastDay {
  date: string
  day: {
    maxtemp_c: number
    maxtemp_f: number
    mintemp_c: number
    mintemp_f: number
    avgtemp_c: number
    avgtemp_f: number
    maxwind_kph: number
    maxwind_mph: number
    totalprecip_mm: number
    totalsnow_cm: number
    avgvis_km: number
    avghumidity: number
    daily_will_it_rain: number
    daily_chance_of_rain: number
    daily_will_it_snow: number
    daily_chance_of_snow: number
    condition: WeatherCondition
    uv: number
  }
  astro: {
    sunrise: string
    sunset: string
    moonrise: string
    moonset: string
    moon_phase: string
    moon_illumination: string
  }
  hour: Array<{
    time: string
    temp_c: number
    temp_f: number
    condition: WeatherCondition
    wind_kph: number
    wind_mph: number
    wind_dir: string
    pressure_mb: number
    precip_mm: number
    humidity: number
    cloud: number
    feelslike_c: number
    feelslike_f: number
    windchill_c: number
    windchill_f: number
    heatindex_c: number
    heatindex_f: number
    dewpoint_c: number
    dewpoint_f: number
    will_it_rain: number
    chance_of_rain: number
    will_it_snow: number
    chance_of_snow: number
    vis_km: number
    vis_miles: number
    gust_kph: number
    gust_mph: number
    uv: number
  }>
}

export interface WeatherForecast {
  forecastday: ForecastDay[]
}

export interface WeatherData {
  location: WeatherLocation
  current: CurrentWeather
  forecast: WeatherForecast
}

// Function to fetch current weather data
export async function fetchCurrentWeather(query: string): Promise<WeatherData> {
  if (!API_KEY) {
    console.error("Weather API key is missing. Please set NEXT_PUBLIC_WEATHER_API_KEY environment variable.")
    throw new Error("Weather API key is missing")
  }

  try {
    console.log(`Fetching weather data for: ${query}`)
    const response = await fetch(
      `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=7&aqi=no&alerts=no`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Weather API error (${response.status}): ${errorText}`)
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Weather data fetched successfully")
    return data
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error
  }
}

// Function to search for locations
export async function searchLocations(query: string) {
  if (!API_KEY) {
    console.error("Weather API key is missing. Please set NEXT_PUBLIC_WEATHER_API_KEY environment variable.")
    throw new Error("Weather API key is missing")
  }

  try {
    const response = await fetch(`${API_BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Location search error (${response.status}): ${errorText}`)
      throw new Error(`Location search error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error searching locations:", error)
    throw error
  }
}

// Function to get weather for major cities
export async function fetchMajorCitiesWeather(cities: string[]): Promise<WeatherData[]> {
  try {
    const promises = cities.map((city) => fetchCurrentWeather(city))
    return await Promise.all(promises)
  } catch (error) {
    console.error("Error fetching major cities weather:", error)
    throw error
  }
}
