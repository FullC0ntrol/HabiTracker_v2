// client/src/lib/authHeaders.js
export function authHeaders(json = true) {
  const token = localStorage.getItem('token');
  const h = json ? { 'Content-Type': 'application/json' } : {};
  if (token) h.Authorization = `Bearer ${token}`;
  // DEV bez logowania:
  // h['x-demo-user'] = 'demo';
  return h;
}
