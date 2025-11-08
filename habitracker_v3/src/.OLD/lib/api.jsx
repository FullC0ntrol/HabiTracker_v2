// client/src/lib/api.js
export const API_BASE = 'http://localhost:4000';

function authHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  // DEV: odkomentuj jeśli testujesz bez logowania
  // headers['x-demo-user'] = 'demo';
  return headers;
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body || {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

// DELETE z opcjonalnym body (przydaje się do naszych endpointów)
export async function apiDelete(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined
  });
  // niektóre DELETE zwracają pustą odpowiedź
  let data = null;
  try { data = await res.json(); } catch { console.log("api.jsx catch error")}
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export const API_PATHS = {
  planToday: '/api/MÓJ-ENDPOINT-PLanu', // <-- TU WSTAW SWÓJ PRAWIDŁOWY PATH
};