import sys
import json
import psycopg2
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

# Input from Node.js
user_id = int(sys.argv[1])
metric_type = sys.argv[2]

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname='health_monitor',
    user='postgres',
    password='pass123',
    host='localhost',
    port='5432'
)
cursor = conn.cursor()

# Fetch user metric history
query = """
    SELECT recorded_at, value
    FROM health_data
    WHERE user_id = %s AND metric_type = %s
    ORDER BY recorded_at
"""
cursor.execute(query, (user_id, metric_type))
rows = cursor.fetchall()
cursor.close()
conn.close()

if len(rows) < 10:
    print(json.dumps({"error": "Not enough data"}))
    sys.exit(1)

# Prepare DataFrame
df = pd.DataFrame(rows, columns=['date', 'value'])
df['date'] = pd.to_datetime(df['date'])
df['value'] = pd.to_numeric(df['value'], errors='coerce')
df.dropna(inplace=True)
df.set_index('date', inplace=True)

# Train ARIMA
model = ARIMA(df['value'], order=(1, 1, 1))  # p,d,q values can be tuned
model_fit = model.fit()

# Forecast 3 future points
forecast = model_fit.forecast(steps=3)

# Output forecast as JSON
print(json.dumps(forecast.tolist()))