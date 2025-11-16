"use client";
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [igToken, setIgToken] = useState("");
  const [igUserId, setIgUserId] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("agentic-settings");
    if (stored) {
      const v = JSON.parse(stored);
      setGoogleClientId(v.googleClientId || "");
      setGoogleApiKey(v.googleApiKey || "");
      setIgToken(v.igToken || "");
      setIgUserId(v.igUserId || "");
    }
  }, []);

  function save() {
    localStorage.setItem(
      "agentic-settings",
      JSON.stringify({ googleClientId, googleApiKey, igToken, igUserId })
    );
    alert("Saved locally");
  }

  return (
    <main className="card p-4">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm mb-1">Google Client ID (YouTube)</label>
          <input className="input" value={googleClientId} onChange={e=>setGoogleClientId(e.target.value)} placeholder="XXXXXXXX.apps.googleusercontent.com" />
        </div>
        <div>
          <label className="block text-sm mb-1">Google API Key (YouTube)</label>
          <input className="input" value={googleApiKey} onChange={e=>setGoogleApiKey(e.target.value)} placeholder="AIza..." />
        </div>
        <div>
          <label className="block text-sm mb-1">Instagram Long-Lived Token</label>
          <input className="input" value={igToken} onChange={e=>setIgToken(e.target.value)} placeholder="IGQ..." />
        </div>
        <div>
          <label className="block text-sm mb-1">Instagram Business User ID</label>
          <input className="input" value={igUserId} onChange={e=>setIgUserId(e.target.value)} placeholder="1784..." />
        </div>
      </div>

      <button className="btn mt-4" onClick={save}>Save</button>
      <p className="text-sm text-white/60 mt-3">Keys are stored only in your browser.</p>
    </main>
  );
}
