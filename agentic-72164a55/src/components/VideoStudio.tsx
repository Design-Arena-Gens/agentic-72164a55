"use client";
import { useCallback, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { Loader2 } from 'lucide-react';

const ffmpeg = new FFmpeg();

function linesFromScript(script: string): string[] {
  return script
    .split(/\n+/)
    .map(s => s.trim())
    .filter(Boolean)
    .flatMap(line => {
      if (line.length <= 50) return [line];
      const words = line.split(' ');
      const out: string[] = [];
      let cur = '';
      for (const w of words) {
        if ((cur + ' ' + w).trim().length > 50) { out.push(cur.trim()); cur = w; }
        else { cur = (cur + ' ' + w).trim(); }
      }
      if (cur) out.push(cur);
      return out;
    });
}

export default function VideoStudio({ script, onRendered }: { script: string, onRendered: (url: string)=>void }) {
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  const render = useCallback(async () => {
    if (!script) return;
    setWorking(true);
    setProgress(0);

    const lines = linesFromScript(script).slice(0, 12);
    const durationPer = 1.5; // seconds per caption
    const width = 1080, height = 1920;

    // Generate simple PNG slides via SVG
    const slides: { name: string, data: Uint8Array }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i];
      const bgUrl = `https://source.unsplash.com/1080x1920/?trend,news,${encodeURIComponent(text.split(' ')[0])}`;
      const svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n`+
      `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${width}\" height=\"${height}\">`+
      `<defs>`+
      `<linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">`+
      `<stop offset=\"0%\" stop-color=\"#000000\" stop-opacity=\"0.5\"/>`+
      `<stop offset=\"100%\" stop-color=\"#000000\" stop-opacity=\"0.6\"/>`+
      `</linearGradient>`+
      `</defs>`+
      `<image href=\"${bgUrl}\" x=\"0\" y=\"0\" width=\"${width}\" height=\"${height}\" preserveAspectRatio=\"xMidYMid slice\"/>`+
      `<rect x=\"0\" y=\"0\" width=\"${width}\" height=\"${height}\" fill=\"url(#g)\"/>`+
      `<foreignObject x=\"80\" y=\"1400\" width=\"${width-160}\" height=\"420\">`+
      `<div xmlns=\"http://www.w3.org/1999/xhtml\" style=\"font-size:64px;line-height:1.2;font-weight:800;color:white;font-family:system-ui, -apple-system, Segoe UI, Roboto;\">`+
      `${text.replace(/&/g,'&amp;').replace(/</g,'&lt;')}`+
      `</div>`+
      `</foreignObject>`+
      `</svg>`;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const pngData = new Uint8Array(await (await fetch(`https://raster.vercel.app/api/raster?width=${width}&height=${height}`, {
        method: 'POST',
        body: blob,
      })).arrayBuffer());
      slides.push({ name: `slide_${i}.png`, data: pngData });
    }

    if (!ffmpeg.loaded) {
      const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${base}/ffmpeg-core.worker.js`, 'text/javascript'),
      });
    }

    for (const s of slides) {
      await ffmpeg.writeFile(s.name, s.data);
    }

    // Create concat file
    const list = slides.map((s, i) => `file '${s.name}'\nduration ${durationPer}`).join('\n');
    await ffmpeg.writeFile('list.txt', new TextEncoder().encode(list + '\n'));

    ffmpeg.on('progress', ({ progress }) => setProgress(Math.min(1, progress ?? 0)));

    // Create video from images
    await ffmpeg.exec([
      '-f','concat','-safe','0','-i','list.txt',
      '-r','30',
      '-s',`${width}x${height}`,
      '-c:v','libx264','-pix_fmt','yuv420p','-movflags','faststart',
      'out.mp4'
    ]);

    const data = (await ffmpeg.readFile('out.mp4')) as Uint8Array;
    const ab = data.buffer as ArrayBuffer;
    const slice = ab.slice(data.byteOffset, data.byteOffset + data.byteLength);
    const url = URL.createObjectURL(new Blob([slice], { type: 'video/mp4' }));
    setPreview(url);
    onRendered(url);
    setWorking(false);
  }, [script]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <button className="btn" onClick={render} disabled={!script || working}>
          {working && <Loader2 className="animate-spin" size={16}/>} Generate Reel
        </button>
        {working && <span className="text-sm text-white/60">Rendering... {(progress*100).toFixed(0)}%</span>}
      </div>
      {preview && (
        <video src={preview} controls className="w-full max-w-sm rounded-lg border border-white/10"/>
      )}
      {!script && <p className="text-white/60 text-sm">Write or generate a script first.</p>}
    </div>
  );
}
