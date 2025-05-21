"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, MapPin, Wind, Droplets, Sunrise, Sunset, Thermometer, AlertTriangle, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchCurrentWeather, fetchMajorCitiesWeather, type WeatherData } from "@/utils/weather-api"

export default function WeatherDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [weatherBackground, setWeatherBackground] = useState("bg-day-clear")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [majorCitiesData, setMajorCitiesData] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState("Faisalabad")

  // Fetch weather data for the current location
  const loadWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching weather data for location:", currentLocation)

      const data = await fetchCurrentWeather(currentLocation)
      setWeatherData(data)

      // Also fetch data for major cities in Pakistan
      try {
        const majorCities = ["Karachi", "Lahore", "Islamabad", "Peshawar"]
        const citiesData = await fetchMajorCitiesWeather(majorCities)
        setMajorCitiesData(citiesData)
      } catch (citiesError) {
        console.error("Error fetching major cities data:", citiesError)
        setMajorCitiesData([])
      }

      setLoading(false)
    } catch (err) {
      console.error("Error in loadWeatherData:", err)
      setError("Failed to load weather data. Please try again.")
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeatherData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation])

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      setCurrentTime(timeString)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  // Set background based on weather data
  useEffect(() => {
    if (!weatherData) return

    const isDay = weatherData.current.is_day === 1
    const condition = weatherData.current.condition.text.toLowerCase()

    let bgClass = "bg-day-clear" // default

    if (isDay) {
      if (condition.includes("cloud") || condition.includes("overcast")) {
        bgClass = "bg-day-cloudy"
      } else if (condition.includes("rain") || condition.includes("drizzle")) {
        bgClass = "bg-day-rain"
      } else if (condition.includes("snow") || condition.includes("sleet")) {
        bgClass = "bg-day-snow"
      } else if (condition.includes("fog") || condition.includes("mist")) {
        bgClass = "bg-day-fog"
      } else {
        bgClass = "bg-day-clear"
      }
    } else {
      if (condition.includes("cloud") || condition.includes("overcast")) {
        bgClass = "bg-night-cloudy"
      } else if (condition.includes("rain") || condition.includes("drizzle")) {
        bgClass = "bg-night-rain"
      } else if (condition.includes("snow") || condition.includes("sleet")) {
        bgClass = "bg-night-snow"
      } else if (condition.includes("fog") || condition.includes("mist")) {
        bgClass = "bg-night-fog"
      } else {
        bgClass = "bg-night-clear"
      }
    }

    setWeatherBackground(bgClass)
  }, [weatherData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setCurrentLocation(searchQuery)
      setSearchQuery("")
    }
  }

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation(`${latitude},${longitude}`)
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Could not get your location. Please try searching manually.")
        },
      )
    } else {
      setError("Geolocation is not supported by your browser. Please try searching manually.")
    }
  }

  const handleRetry = () => {
    loadWeatherData()
  }

  const getWeatherIcon = (condition: string) => {
    condition = condition.toLowerCase()
    if (condition.includes("cloud") || condition.includes("overcast")) {
      return <div className="text-gray-300 text-6xl">☁️</div>
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
      return <div className="text-blue-300 text-6xl">🌧️</div>
    } else if (condition.includes("snow") || condition.includes("sleet")) {
      return <div className="text-white text-6xl">❄️</div>
    } else if (condition.includes("fog") || condition.includes("mist")) {
      return <div className="text-gray-400 text-6xl">🌫️</div>
    } else if (condition.includes("partly")) {
      return <div className="text-yellow-300 text-6xl">⛅</div>
    } else {
      return <div className="text-yellow-300 text-6xl">☀️</div>
    }
  }

  // Loading state
  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-night-clear text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading weather data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-night-clear text-white flex items-center justify-center">
        <div className="text-center bg-white/10 p-6 rounded-xl max-w-md">
          <div className="text-red-400 text-5xl mb-4">
            <AlertTriangle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    )
  }

  // If we have no data yet, show nothing (prevents flash of content)
  if (!weatherData) {
    return null
  }

  return (
    <div className={`min-h-screen ${weatherBackground} text-white`}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-4xl font-bold mb-4 md:mb-0">Weather Dashboard</h1>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span>{currentTime}</span>
            </div>

            <form onSubmit={handleSearch} className="flex">
              <Input
                type="text"
                placeholder="Search city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 w-40 md:w-auto"
              />
              <Button type="submit" variant="ghost" size="icon" className="ml-1">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <Button variant="outline" size="sm" className="bg-white/10 border-white/20" onClick={handleMyLocation}>
              <MapPin className="h-4 w-4 mr-2" /> My Location
            </Button>
          </div>
        </header>

        <main>
          {/* Current Weather */}
          <div className="mb-12">
            <div className="flex items-start mb-2">
              <MapPin className="h-6 w-6 mr-2" />
              <div>
                <h2 className="text-3xl font-bold">{weatherData.location.name}</h2>
                <p className="text-white/70">
                  {weatherData.location.region}, {weatherData.location.country}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white/10 border-white/20 p-6 rounded-xl col-span-1">
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="text-8xl mb-4">
                    {weatherData.current.is_day === 0 && weatherData.current.condition.text === "Clear"
                      ? "🌙"
                      : getWeatherIcon(weatherData.current.condition.text)}
                  </div>
                  <div className="text-7xl font-bold mb-2">{Math.round(weatherData.current.temp_c)}°C</div>
                  <div className="text-xl text-white/70">
                    Feels like {Math.round(weatherData.current.feelslike_c)}°C
                  </div>
                  <div className="text-2xl mt-2">{weatherData.current.condition.text}</div>
                </CardContent>
              </Card>

              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white/10 border-white/20 p-6 rounded-xl">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-2">
                      <Wind className="h-6 w-6 mr-2" />
                      <h3 className="text-xl font-semibold">Wind</h3>
                    </div>
                    <div className="text-3xl font-bold mb-1">{weatherData.current.wind_kph} km/h</div>
                    <div className="text-white/70">{weatherData.current.wind_dir}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 p-6 rounded-xl">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-2">
                      <Droplets className="h-6 w-6 mr-2" />
                      <h3 className="text-xl font-semibold">Humidity</h3>
                    </div>
                    <div className="text-3xl font-bold">{weatherData.current.humidity}%</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 p-6 rounded-xl">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-2">
                      <Thermometer className="h-6 w-6 mr-2" />
                      <h3 className="text-xl font-semibold">Min / Max</h3>
                    </div>
                    <div className="text-2xl font-bold">
                      {Math.round(weatherData.forecast.forecastday[0].day.mintemp_c)}°C /{" "}
                      {Math.round(weatherData.forecast.forecastday[0].day.maxtemp_c)}°C
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 p-6 rounded-xl">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        <Sunrise className="h-6 w-6 mr-1" />
                        <Sunset className="h-6 w-6 ml-1" />
                      </div>
                      <h3 className="text-xl font-semibold ml-1">Sunrise / Sunset</h3>
                    </div>
                    <div className="text-xl font-bold">
                      {weatherData.forecast.forecastday[0].astro.sunrise} /{" "}
                      {weatherData.forecast.forecastday[0].astro.sunset}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7-Day Forecast</h2>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              {weatherData.forecast.forecastday.map((day, index) => (
                <Card key={index} className="bg-white/10 border-white/20 p-4 rounded-xl">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-semibold mb-2 text-center">
                      {index === 0 ? "Today" : new Date(day.date).toLocaleDateString("en-US", { weekday: "long" })}
                    </h3>
                    <div className="flex justify-center text-4xl mb-2">{getWeatherIcon(day.day.condition.text)}</div>
                    <p className="text-center mb-2">{day.day.condition.text}</p>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <div className="text-right">Min</div>
                      <div>{Math.round(day.day.mintemp_c)}°C</div>
                      <div className="text-right">Max</div>
                      <div>{Math.round(day.day.maxtemp_c)}°C</div>
                      <div className="text-right flex items-center justify-end">
                        <Droplets className="h-3 w-3 mr-1" />
                      </div>
                      <div>{day.day.avghumidity}%</div>
                      <div className="text-right flex items-center justify-end">
                        <Wind className="h-3 w-3 mr-1" />
                      </div>
                      <div>{Math.round(day.day.maxwind_kph)} km/h</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Major Cities */}
          {majorCitiesData.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Major Cities in Pakistan</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {majorCitiesData.map((city, index) => (
                  <Card key={index} className="bg-white/10 border-white/20 p-4 rounded-xl">
                    <CardContent className="p-0">
                      <div className="mb-1">
                        <h3 className="text-xl font-bold">{city.location.name}</h3>
                        <p className="text-sm text-white/70">{city.location.region}</p>
                      </div>
                      <div className="text-2xl font-bold mb-1">{Math.round(city.current.temp_c)}°C</div>
                      <p className="text-sm mb-2">Feels like {Math.round(city.current.feelslike_c)}°C</p>
                      <div className="flex items-center mb-2">
                        {getWeatherIcon(city.current.condition.text)}
                        <span className="ml-2">{city.current.condition.text}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Droplets className="h-4 w-4 mr-1" /> {city.current.humidity}%
                        </div>
                        <div className="flex items-center">
                          <Wind className="h-4 w-4 mr-1" /> {Math.round(city.current.wind_kph)} km/h
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
