import weatherClient from "./weather-service";

export interface QWeatherNow {
  obsTime: string;
  temp: string;
  feelsLike: string;
  icon: string;
  text: string;
  wind360: string;
  windDir: string;
  windScale: string;
  windSpeed: string;
  humidity: string;
  precip: string;
  pressure: string;
  vis: string;
  cloud?: string;
  dew?: string;
}

export interface QWeatherNowResponse {
  code: string;
  updateTime?: string;
  fxLink?: string;
  now?: QWeatherNow;
}

export interface QWeatherLocation {
  name: string;
  id: string;
  lat: string;
  lon: string;
  adm2: string;
  adm1: string;
  country: string;
  tz: string;
  utcOffset: string;
  isDst: string;
  type: string;
  rank: string;
  fxLink: string;
}

export interface QWeatherCityLookupResponse {
  code: string;
  location?: QWeatherLocation[];
}

export const getNowWeather = (location: string) => {
  return weatherClient.get<QWeatherNowResponse>("/v7/weather/now", {
    params: { location },
  });
};

export const get7dForecast = (location: string) => {
  return weatherClient.get("/v7/weather/7d", {
    params: { location },
  });
};

export const getAirQuality = (location: string) => {
  return weatherClient.get("/v7/air/now", {
    params: { location },
  });
};

export const getCitySearch = (location: string) => {
  return weatherClient.get<QWeatherCityLookupResponse>("/geo/v2/city/lookup", {
    params: { location },
  });
};
