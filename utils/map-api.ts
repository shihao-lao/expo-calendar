import mapClient from "./map-service";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface AmapIpResponse {
  status: string;
  info: string;
  infocode: string;
  province?: string;
  city?: string;
  adcode?: string;
  rectangle?: string;
}

export interface AmapWeatherLive {
  province: string;
  city: string;
  adcode: string;
  weather: string;
  temperature: string;
  winddirection: string;
  windpower: string;
  humidity: string;
  reporttime: string;
  temperature_float?: string;
  humidity_float?: string;
}

export interface AmapWeatherResponse {
  status: string;
  count: string;
  info: string;
  infocode: string;
  lives?: AmapWeatherLive[];
}

export const getLocalWeather = async (params: QueryParams = {}) => {
  return mapClient.get<AmapWeatherResponse>("/v3/weather/weatherInfo", {
    params,
  });
};

export const getIP = async (params: QueryParams = {}) => {
  return mapClient.get<AmapIpResponse>("/v3/ip", { params });
};

export const getGeoCode = async (params: QueryParams = {}) => {
  return mapClient.get("/v3/geocode/geo", { params });
};

export const getAdCode = async (longitude: number, latitude: number) => {
  return mapClient.get("/v3/geocode/regeo", {
    params: {
      location: `${longitude},${latitude}`,
      radius: 1000,
      extensions: "all",
      batch: false,
      roadlevel: 0,
    },
  });
};
