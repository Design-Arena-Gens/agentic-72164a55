"use client";
import { useEffect, useState } from 'react';

export default function InstagramPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [igUserId, setIgUserId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const s = localStorage.getItem('agentic-settings');
    if (s) {
      const v = JSON.parse(s);
      setIgUserId(v.igUserId || '');
      setAccessToken(v.igToken || '');
    }
  }, []);

  async function post() {
    if (!videoUrl.startsWith('http')) { alert('Provide a public video URL'); return; }
    const res = await fetch('/api/instagram/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ igUserId, accessToken, videoUrl, caption })
    });
    const j = await res.json();
    if (!res.ok) alert('Failed: ' + JSON.stringify(j));
    else alert('Posted to Instagram Reels.');
  }

  return (
    <main className="card p-4">
      <h2 className="text-lg font-semibold mb-3">Instagram Reels (Business)</h2>
      <p className="text-sm text-white/60 mb-4">Requires Instagram Business account, long-lived token, and a publicly accessible video URL.</p>
      <div className="grid gap-3">
        <input className="input" value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="Public video URL (e.g. from a CDN or S3)"/>
        <input className="input" value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption"/>
        <button className="btn" onClick={post}>Publish Reel</button>
      </div>
    </main>
  );
}
