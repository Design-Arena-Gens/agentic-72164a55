"use client";
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function TrendPicker({ onPick }: { onPick: (s: string)=>void }) {
  const [trends, setTrends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/trends');
      const data = await res.json();
      setTrends(data.topics || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/70">Auto-sourced via Google News RSS</span>
        <button className="btn" disabled={loading} onClick={load}><RefreshCw size={16}/>Refresh</button>
      </div>
      <div className="grid gap-2">
        {trends.map((t, i) => (
          <button key={i} className="text-left p-3 rounded-md bg-white/5 hover:bg-white/10" onClick={()=>onPick(t)}>
            {t}
          </button>
        ))}
        {!trends.length && !loading && <p className="text-white/60 text-sm">No trends found right now.</p>}
      </div>
    </div>
  );
}
