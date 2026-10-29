export function formatForecastDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const forecastDate = new Date(year, month - 1, day);

  return forecastDate.toLocaleDateString("en-US", {
    weekday: "long",
  });
}