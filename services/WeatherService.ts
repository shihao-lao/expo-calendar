import { getIP, getLocalWeather } from "@/utils/map-api";
import { getCitySearch, getNowWeather } from "@/utils/weather-api";

export interface WeatherSummary {
  city: string;
  text: string;
  temp: string;
  humidity?: string;
  windDir?: string;
  updatedAt?: string;
  source: "qweather" | "amap";
}

const DEFAULT_CITY = "北京";

function normalizeCityName(city?: string) {
  if (!city || city === "[]") return DEFAULT_CITY;
  return city.replace(/市$/, "") || DEFAULT_CITY;
}

async function resolveQWeatherLocation(city: string) {
  const lookup = await getCitySearch(city);
  const location = lookup.location?.[0];

  return {
    id: location?.id || city,
    name: location?.name || city,
  };
}

async function getAmapFallbackWeather(city: string, adcode?: string) {
  const response = await getLocalWeather({ city: adcode || city });
  const live = response.lives?.[0];

  if (!live) {
    throw new Error("高德天气没有返回实时天气");
  }

  return {
    city: live.city || city,
    text: live.weather,
    temp: live.temperature,
    humidity: live.humidity,
    windDir: live.winddirection,
    updatedAt: live.reporttime,
    source: "amap" as const,
  };
}

async function resolveCurrentCity() {
  try {
    const ip = await getIP();
    return {
      city: normalizeCityName(ip.city),
      adcode: ip.adcode,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn("高德 IP 定位失败，使用默认城市:", error);
    }

    return {
      city: DEFAULT_CITY,
      adcode: undefined,
    };
  }
}

export const WeatherService = {
  getCurrentWeather: async (): Promise<WeatherSummary> => {
    const { city, adcode } = await resolveCurrentCity();

    try {
      const location = await resolveQWeatherLocation(city);
      const response = await getNowWeather(location.id);

      if (!response.now) {
        throw new Error("和风天气没有返回实时天气");
      }

      return {
        city: location.name,
        text: response.now.text,
        temp: response.now.temp,
        humidity: response.now.humidity,
        windDir: response.now.windDir,
        updatedAt: response.now.obsTime || response.updateTime,
        source: "qweather",
      };
    } catch (error) {
      if (__DEV__) {
        console.warn("和风天气请求失败，切换到高德天气兜底:", error);
      }

      return getAmapFallbackWeather(city, adcode);
    }
  },
};
