// src/shared/api/client.js
const API_BASE = "http://localhost:4000";


/** 
 * Pomocnicza funkcja do obsługi żądań HTTP.
 * Automatycznie dodaje token z localStorage i nagłówki JSON.
 */
async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // automatycznie próba odczytu JSON
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* może być pusta odpowiedź */
  }

  if (!res.ok) {
    const message = data?.error || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// 📦 Eksport standardowego klienta API
export const apiClient = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
export const http = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body || {}) }),
  del: (path, body) =>
    request(path, { method: "DELETE", body: JSON.stringify(body || {}) }),
};