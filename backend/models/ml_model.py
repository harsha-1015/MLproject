import pandas as pd
import math
import os
import joblib
from geopy.distance import geodesic


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEATHER_DATA_PATH = os.path.join(BASE_DIR, '..', 'models', 'daily_weather_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'wind_model.pkl')


try:
    model = joblib.load(MODEL_PATH)
    print(" Wind model loaded.")
except FileNotFoundError:
    model = None
    print(" Model file not found!")


try:
    df = pd.read_csv(WEATHER_DATA_PATH)
    df = df.dropna(subset=['tavg', 'pres', 'wspd', 'Latitude', 'Longitude'])
    print(f" Weather data loaded: {df.shape[0]} valid rows")
except Exception as e:
    print(f" Failed to load weather data: {e}")
    df = pd.DataFrame()


def predict_wind_power(temp, pressure, wind_speed, windmills):
    if model is None:
        print(" Wind model not loaded.")
        return 0
    input_df = pd.DataFrame([{
        'tavg': temp,
        'pres': pressure,
        'wspd': wind_speed,
        'windmills': int(windmills)
    }])
    try:
        return round(model.predict(input_df)[0], 2)
    except Exception as e:
        print(f" Model prediction failed: {e}")
        return 0


def find_best_location(lat, lon, windmills):
    radius_km = 50
    best_row = None
    best_power = -1
    nearby_points = 0

    for _, row in df.iterrows():
        dist = geodesic((lat, lon), (row['Latitude'], row['Longitude'])).kilometers
        
        if dist <= radius_km:
            nearby_points += 1
            power = predict_wind_power(row['tavg'], row['pres'], row['wspd'], windmills)
            if power > best_power:
                best_power = power
                best_row = row

    print(f" Found {nearby_points} nearby weather points within {radius_km} km.")

    if best_row is not None:
        print(f" Best location: ({best_row['Latitude']}, {best_row['Longitude']}) with {best_power} MW")
        return {
            'lat': best_row['Latitude'],
            'lon': best_row['Longitude'],
            'temperature': best_row['tavg'],
            'wind_speed': best_row['wspd'],
            'pressure': best_row['pres'],
            'predictedPower': best_power,
        }
    else:
        print(" No optimal location found within radius.")
        return None
