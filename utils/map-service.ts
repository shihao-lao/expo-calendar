const BASE_URL = "https://restapi.amap.com";
const API_KEY = process.env.EXPO_PUBLIC_AMAP_KEY;

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  params?: QueryParams;
}

interface ApiLog {
  type: "request" | "response" | "response-error";
  url?: string;
  status?: number;
  params?: QueryParams;
  data?: unknown;
  error?: string;
  timestamp: string;
}

const amapLogs: ApiLog[] = [];

export function getAmapLogs() {
  return amapLogs;
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

async function get<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const mergedParams: QueryParams = { ...(options.params || {}) };

  if (API_KEY) mergedParams.key = API_KEY;
  if (!mergedParams.key) {
    throw new Error("缺少 EXPO_PUBLIC_AMAP_KEY，无法调用高德 API");
  }

  const query = buildQuery(mergedParams);
  const url = `${BASE_URL}${path}${query ? `?${query}` : ""}`;
  const safeParams = redactParams(mergedParams);

  amapLogs.push({
    type: "request",
    url: `${BASE_URL}${path}`,
    params: safeParams,
    timestamp: new Date().toLocaleString(),
  });

  if (__DEV__) {
    console.log(`[AMap] GET ${path}`, safeParams);
  }

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    amapLogs.push({
      type: "response-error",
      error: message,
      timestamp: new Date().toLocaleString(),
    });
    throw new Error(message);
  }

  const data = (await response.json().catch(() => null)) as
    | (T & { status?: string; info?: string })
    | null;

  amapLogs.push({
    type: "response",
    url: `${BASE_URL}${path}`,
    status: response.status,
    data,
    timestamp: new Date().toLocaleString(),
  });

  if (!response.ok) {
    throw new Error(`[${response.status}] ${response.statusText}`);
  }

  if (data && data.status === "0") {
    throw new Error(data.info || "高德 API 返回失败");
  }

  return data as T;
}

export default { get };
