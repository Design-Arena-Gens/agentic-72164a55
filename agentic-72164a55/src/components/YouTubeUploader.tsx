"use client";
import { useEffect, useMemo, useState } from 'react';
import { Upload } from 'lucide-react';

declare global {
  interface Window { google?: any; }
}

export default function YouTubeUploader({ videoUrl, defaultTitle }: { videoUrl: string | null, defaultTitle: string }) {
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [title, setTitle] = useState(defaultTitle);
  const [desc, setDesc] = useState("Auto-generated via Agentic Reels AI");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("agentic-settings");
    if (s) {
      const v = JSON.parse(s);
      setClientId(v.googleClientId || "");
      setApiKey(v.googleApiKey || "");
    }
  }, []);

  useEffect(() => { setTitle(defaultTitle); }, [defaultTitle]);

  function initGsi() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.body.appendChild(script);
  }

  async function authorize() {
    if (!clientId || !apiKey) { alert('Set Google Client ID and API Key in Settings'); return; }
    initGsi();
    const tokenClient = await new Promise<any>((resolve) => {
      const check = () => {
        // @ts-ignore
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          // @ts-ignore
          resolve(window.google.accounts.oauth2);
        } else { setTimeout(check, 300); }
      };
      check();
    });

    const client = tokenClient.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/youtube.upload',
      callback: (tokenResp: any) => {
        if (tokenResp && tokenResp.access_token) {
          localStorage.setItem('yt_access_token', tokenResp.access_token);
          setAuthorized(true);
        }
      },
    });
    client.requestAccessToken();
  }

  async function upload() {
    const accessToken = localStorage.getItem('yt_access_token');
    if (!accessToken) { alert('Authorize YouTube first'); return; }
    if (!videoUrl) { alert('Generate a video first'); return; }
    const blob = await (await fetch(videoUrl)).blob();

    const metadata = {
      snippet: { title, description: desc },
      status: { privacyStatus: 'private' }
    };

    const form = new FormData();
    form.append('part', 'snippet,status');
    form.append('snippet', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('video', blob);

    const res = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });
    if (!res.ok) {
      const t = await res.text();
      alert('YouTube upload failed: ' + t);
    } else {
      alert('Uploaded to YouTube (check your channel uploads).');
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input className="input w-56" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title"/>
      <input className="input w-72" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description"/>
      <button className="btn" onClick={authorize}><Upload size={16}/>Authorize YouTube</button>
      <button className="btn" onClick={upload} disabled={!videoUrl}><Upload size={16}/>Upload to YouTube</button>
    </div>
  );
}
