exports.analyzeBpWeatherCorrelation = ({
  bpSeries,
  weatherSeries
}) => {
  if (!bpSeries?.length || !weatherSeries?.length) return null;

  let coldDays = 0;
  let coldHighBpDays = 0;

  for (const day of bpSeries) {
    const weather = weatherSeries.find(w => w.date === day.date);
    if (!weather) continue;

    if (weather.avgTemp <= 10) {
      coldDays++;
      if (day.value >= 140) coldHighBpDays++;
    }
  }

  if (coldDays >= 5 && coldHighBpDays / coldDays >= 0.6) {
    return {
      factor: "cold_temperature",
      confidence: "moderate",
      message:
        "Higher blood pressure values frequently occurred on colder days."
    };
  }

  return null;
};
