"use client";
import { useState } from 'react';
import TrendPicker from '@/components/TrendPicker';
import ScriptGenerator from '@/components/ScriptGenerator';
import dynamic from 'next/dynamic';
import YouTubeUploader from '@/components/YouTubeUploader';

const VideoStudio = dynamic(() => import('@/components/VideoStudio'), { ssr: false });

export default function Page() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [script, setScript] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  return (
    <main className="grid gap-6 md:grid-cols-5">
      <section className="card p-4 md:col-span-2">
        <h2 className="text-lg font-semibold mb-3">Trends</h2>
        <TrendPicker onPick={setSelectedTopic} />
      </section>

      <section className="card p-4 md:col-span-3">
        <h2 className="text-lg font-semibold mb-3">Script</h2>
        <ScriptGenerator topic={selectedTopic} onScript={setScript} />
      </section>

      <section className="card p-4 md:col-span-5">
        <h2 className="text-lg font-semibold mb-3">Reel Generator</h2>
        <VideoStudio script={script} onRendered={setVideoUrl} />
      </section>

      <section className="card p-4 md:col-span-5">
        <h2 className="text-lg font-semibold mb-3">Publish</h2>
        <div className="flex items-center gap-3 flex-wrap">
          {videoUrl && (
            <a className="btn" href={videoUrl} download="reel.mp4">Download MP4</a>
          )}
          <YouTubeUploader videoUrl={videoUrl} defaultTitle={selectedTopic || 'Trending Reel'} />
        </div>
      </section>
    </main>
  );
}
