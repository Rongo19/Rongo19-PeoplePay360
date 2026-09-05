const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const LOGIN_ENDPOINT = import.meta.env.VITE_LOGIN_ENDPOINT || "/auth/login";

function getApiUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`;
}

async function request(endpoint, options = {}) {
  const response = await fetch(getApiUrl(endpoint), {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof body === "object" && body?.message
      ? body.message
      : "Invalid email or password.";
    throw new Error(message);
  }

  return body;
}

export function login(credentials) {
  return request(LOGIN_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}