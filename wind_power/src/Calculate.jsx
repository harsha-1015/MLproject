import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Link } from "react-router-dom";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const OPENWEATHER_API_KEY = "48a79aadfa15ea6114cb45496ae56c02";

// Component to recenter map
function RecenterMap({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) {
      map.flyTo([lat, lon], 7);
    }
  }, [lat, lon]);
  return null;
}

// Handle click on map
function LocationPicker({ onSelectLocation }) {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          alert("Weather fetch failed");
          return;
        }

        const data = await response.json();

        const weather = {
          latitude: lat,
          longitude: lon,
          temperature: data.main.temp,
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          placeName: data.name || "Selected Location",
        };

        onSelectLocation(weather);
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    },
  });
  return null;
}

export default function Calculate() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [windmills, setWindmills] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [optimalCoords, setOptimalCoords] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [noOptimalFound, setNoOptimalFound] = useState(false); // ✅ New state

  const fetchPrediction = async () => {
    if (!latitude || !longitude || !windmills || !weatherData) {
      alert("Please select a location and enter windmills count.");
      return;
    }

    setLoading(true);
    setNoOptimalFound(false); // Reset message on new search

    try {
      const response = await fetch("http://127.0.0.1:8000/api/predict_power/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: latitude,
          lon: longitude,
          windmills,
          temperature: weatherData.temperature,
          pressure: weatherData.pressure,
          windSpeed: weatherData.windSpeed,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error("Main prediction failed");

      setWeatherData((prev) => ({
        ...prev,
        windDensity: data.windDensity,
        predictedPower: data.predictedPower,
      }));

      // Optimal location logic
      if (data.optimalLocation?.lat && data.optimalLocation?.lon) {
        const { lat: optLat, lon: optLon } = data.optimalLocation;

        const optWeatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${optLat}&lon=${optLon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        const optWeather = await optWeatherRes.json();

        const optPredictionRes = await fetch("http://127.0.0.1:8000/api/predict_power/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: optLat,
            lon: optLon,
            windmills,
            temperature: optWeather.main.temp,
            pressure: optWeather.main.pressure,
            windSpeed: optWeather.wind.speed,
          }),
        });

        const optPrediction = await optPredictionRes.json();

        setOptimalCoords({
          lat: optLat,
          lon: optLon,
          windDensity: optPrediction.windDensity,
          predictedPower: optPrediction.predictedPower,
        });
      } else {
        setOptimalCoords(null);
        setNoOptimalFound(true); // ✅ Show message
      }

      setMapKey((prev) => prev + 1);
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Something went wrong with prediction.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (weather) => {
    setLatitude(weather.latitude);
    setLongitude(weather.longitude);
    setWeatherData({
      temperature: weather.temperature,
      pressure: weather.pressure,
      windSpeed: weather.windSpeed,
      placeName: weather.placeName,
    });
    setOptimalCoords(null);
    setNoOptimalFound(false); // ✅ Reset on new click
    setMapKey((prev) => prev + 1);
  };

  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
    iconSize: [30, 30],
  });

  const optimalIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/484/484662.png",
    iconSize: [30, 30],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-wide">Wind Power Predictor</h1>
        <nav className="space-x-6 text-lg">
          <Link to="/" className="hover:text-blue-300">Home</Link>
          <Link to="/calculate" className="hover:text-blue-300">Calculate</Link>
        </nav>
      </header>

      <main className="p-8 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6">
          {/* Input Card */}
          <div className="bg-white shadow-2xl rounded-2xl p-8 flex-1 text-center border border-blue-200">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Select Location & Details</h2>

            {latitude && longitude && (
              <div className="mb-4 text-blue-900 font-medium">
                <p>Latitude: {latitude.toFixed(4)}</p>
                <p>Longitude: {longitude.toFixed(4)}</p>
                <p>Place: {weatherData?.placeName}</p>
              </div>
            )}

            <input
              type="number"
              placeholder="Enter number of windmills"
              className="border w-full p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={windmills}
              onChange={(e) => setWindmills(e.target.value)}
            />

            <button
              onClick={fetchPrediction}
              disabled={!latitude || !longitude || !windmills || loading}
              className={`px-6 py-2 rounded-full transition ${
                !latitude || !longitude || !windmills || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-700 text-white hover:bg-green-800"
              }`}
            >
              {loading ? "Processing..." : "Submit"}
            </button>

            {/* Results */}
            {weatherData?.predictedPower && (
              <div className="mt-6 text-left text-blue-900">
                <h3 className="text-xl font-bold mb-2">Weather Data:</h3>
                <p>Temperature: {weatherData.temperature} °C</p>
                <p>Wind Speed: {weatherData.windSpeed} m/s</p>
                <p>Pressure: {weatherData.pressure} hPa</p>

                <h3 className="text-xl font-bold mt-4 mb-2">Prediction Results:</h3>
                <p>Predicted Power: {parseFloat(weatherData.predictedPower).toFixed(2)} kW</p>

                {/* ✅ Optimal Location */}
                <div className="mt-4 text-blue-900">
                  <h3 className="text-xl font-bold">Optimal Nearby Location:</h3>

                  {optimalCoords ? (
                    <>
                      <p className="font-semibold">Latitude: {optimalCoords.lat.toFixed(4)}</p>
                      <p className="font-semibold">Longitude: {optimalCoords.lon.toFixed(4)}</p>
                      <p className="font-semibold">
                        Optimal Predicted Power: {parseFloat(optimalCoords.predictedPower).toFixed(2)} kW
                      </p>
                    </>
                  ) : noOptimalFound ? (
                    <p className="text-red-600 font-semibold">No optimal place found nearby.</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="relative w-full h-[500px] lg:w-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-blue-300">
            <MapContainer
              key={mapKey}
              center={[latitude || 20, longitude || 78]}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker onSelectLocation={handleLocationSelect} />
              <RecenterMap lat={optimalCoords?.lat || latitude} lon={optimalCoords?.lon || longitude} />

              {latitude && longitude && (
                <Marker position={[latitude, longitude]} icon={userIcon} />
              )}

              {optimalCoords?.lat && optimalCoords?.lon && (
                <Marker position={[optimalCoords.lat, optimalCoords.lon]} icon={optimalIcon} />
              )}
            </MapContainer>
          </div>
        </div>
      </main>
    </div>
  );
}