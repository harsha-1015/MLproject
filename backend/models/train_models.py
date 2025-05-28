
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error,r2_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEATHER_DATA_PATH = os.path.join(BASE_DIR, 'daily_weather_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'wind_model.pkl')


try:
    df = pd.read_csv(WEATHER_DATA_PATH)
except FileNotFoundError:
    print(" daily_weather_data.csv not found!")
    exit()

df = df.dropna(subset=['tavg', 'pres', 'wspd', 'Latitude', 'Longitude'])

df['windmills'] = 1
if 'power_output' not in df.columns:
    df['power_output'] = df['wspd'] * df['windmills'] * 1.2 + np.random.normal(0, 0.5, len(df))

X = df[['tavg', 'pres', 'wspd', 'windmills']]
y = df['power_output']


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


model = LinearRegression()
model.fit(X_train, y_train)
y_pred=model.predict(X_test)
mse=mean_squared_error(y_test,y_pred)
r2=r2_score(y_test,y_pred)
print("mean squared error=",mse)
print("r2_scor=",r2)
joblib.dump(model, MODEL_PATH)
print(f"Model trained and saved to: {MODEL_PATH}")
