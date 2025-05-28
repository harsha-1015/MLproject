from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from models.ml_model import predict_wind_power, find_best_location

@api_view(['POST'])
def predict_power(request):
    try:
        lat = float(request.data.get('lat'))
        lon = float(request.data.get('lon'))
        windmills = int(request.data.get('windmills'))
        temperature = float(request.data.get('temperature'))
        pressure = float(request.data.get('pressure'))
        wind_speed = float(request.data.get('windSpeed'))
    except (TypeError, ValueError):
        return Response({'error': 'Invalid input. Please ensure all fields are correctly formatted.'},
                        status=status.HTTP_400_BAD_REQUEST)

   
    predicted_power = predict_wind_power(temperature, pressure, wind_speed, windmills)
    optimal_place = find_best_location(lat, lon, windmills)
    print(optimal_place)

    return Response({
        'temperature': temperature,
        'windSpeed': wind_speed,
        'pressure': pressure,
        'predictedPower': predicted_power,
        'placeName': 'N/A (provided by user)', 
        'optimalLocation': optimal_place
    })
