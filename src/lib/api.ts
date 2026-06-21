const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type RequestOptions = {
  token: string | null;
  body?: unknown;
};

async function request<T>(
  method: string,
  path: string,
  { token, body }: RequestOptions,
): Promise<{ success: boolean; data?: T; error?: { code: string; message: string } }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    return {
      success: false,
      error: json.error ?? { code: "UNKNOWN", message: "Something went wrong." },
    };
  }

  return json;
}

export const api = {
  get: <T>(path: string, token: string | null) =>
    request<T>("GET", path, { token }),

  post: <T>(path: string, body: unknown, token: string | null) =>
    request<T>("POST", path, { token, body }),

  patch: <T>(path: string, body: unknown, token: string | null) =>
    request<T>("PATCH", path, { token, body }),
};
