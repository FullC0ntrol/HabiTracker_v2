// client/src/Account.jsx
import { useEffect, useState } from "react";
import { API_BASE } from "./../../lib/api";
import { authHeaders } from "./../../lib/authHeaders";

export default function Account() {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/me`, { headers: authHeaders(false) });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "me failed");
        setMe(data);
      } catch (e) {
        setErr("Unauthorized — login with PIN or enable x-demo-user header." + e);
      }
    })();
  }, []);

  return (
    <div className="p-6 text-white max-w-2xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-6 text-center text-cyan-400">👤 Account</h2>

      {err && <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-400/40 mb-4">🚨 {err}</div>}

      <div className="rounded-xl border border-white/10 bg-white/10 p-4 space-y-3">
        <Row label="Username" value={me?.username ?? "—"} />
      </div>

      <div className="mt-4 flex gap-3">
        <button className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold">
          Edit profile
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-600 font-semibold"
          onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-300">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
