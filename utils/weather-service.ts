const WEATHER_API_HOST_RAW = process.env.EXPO_PUBLIC_WEATHER_API_HOST;
const WEATHER_API_HOST = WEATHER_API_HOST_RAW
  ? WEATHER_API_HOST_RAW.replace(/^https?:\/\//, "").replace(/\/+$/, "")
  : "";
const BASE_URL = WEATHER_API_HOST ? `https://${WEATHER_API_HOST}` : "";
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_KEY;

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  params?: QueryParams;
}

interface ApiLog {
  type: "request" | "response" | "response-error" | "business-error";
  url?: string;
  status?: number;
  duration?: number;
  params?: QueryParams;
  data?: unknown;
  error?: string;
  timestamp: string;
}

const weatherLogs: ApiLog[] = [];

export function getWeatherLogs() {
  return weatherLogs;
}

function buildQuery(params: QueryParams) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    searchParams.append(key, String(value));
  }

  return searchParams.toString();
}

function redactParams(params: QueryParams) {
  return {
    ...params,
    ...(params.key ? { key: "***" } : {}),
  };
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function get<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error("缺少 EXPO_PUBLIC_WEATHER_API_HOST，无法调用和风天气 API");
  }
  if (!API_KEY) {
    throw new Error("缺少 EXPO_PUBLIC_WEATHER_KEY，无法调用和风天气 API");
  }

  const startTime = Date.now();
  const mergedParams: QueryParams = { ...(options.params || {}), key: API_KEY };
  const query = buildQuery(mergedParams);
  const url = `${BASE_URL}${path}${query ? `?${query}` : ""}`;
  const safeParams = redactParams(mergedParams);

  weatherLogs.push({
    type: "request",
    url: `${BASE_URL}${path}`,
    params: safeParams,
    timestamp: new Date().toLocaleString(),
  });

  if (__DEV__) {
    console.log(`[QWeather] GET ${path}`, safeParams);
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(url, 10000);
  } catch (error) {
    const errorName =
      error && typeof error === "object" && "name" in error
        ? String((error as { name?: unknown }).name)
        : "";
    const message =
      errorName === "AbortError"
        ? "请求无响应（可能是网络超时或跨域问题）"
        : error instanceof Error
          ? error.message
          : "网络请求失败";

    weatherLogs.push({
      type: "response-error",
      error: message,
      timestamp: new Date().toLocaleString(),
    });
    throw new Error(message);
  }

  const duration = Date.now() - startTime;
  const data = (await response.json().catch(() => null)) as
    | (T & { code?: string; msg?: string })
    | null;

  weatherLogs.push({
    type: "response",
    url: `${BASE_URL}${path}`,
    status: response.status,
    duration,
    data,
    timestamp: new Date().toLocaleString(),
  });

  if (!response.ok) {
    throw new Error(`[${response.status}] ${response.statusText}`);
  }

  if (data && data.code && data.code !== "200") {
    const errorMsg = data.msg || `业务错误（code: ${data.code}）`;
    weatherLogs.push({
      type: "business-error",
      error: errorMsg,
      timestamp: new Date().toLocaleString(),
    });
    throw new Error(errorMsg);
  }

  return data as T;
}

export default { get };
