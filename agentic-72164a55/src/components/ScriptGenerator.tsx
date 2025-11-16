"use client";
import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

function generateHookAndScript(topic: string): string {
  const hooks = [
    `Kya aapne suna? ${topic} ab trend me hai!`,
    `${topic} ne internet hila diya ? 15 sec me bataata hoon!`,
    `${topic} par sab baat kar rahe hain ? quick breakdown!`,
  ];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];

  const points = [
    `1) Sabse pehle: ${topic} kyu viral ho raha hai?`,
    `2) Market view: is trend ka fayda kinhe?`,
    `3) Action: aap abhi kya kar sakte ho?`,
  ];

  const cta = `Aur aise hi fast reels ke liye follow karo. Comment me batao: ${topic} par aapka take?`;

  return [hook, '', ...points, '', cta].join('\n');
}

export default function ScriptGenerator({ topic, onScript }: { topic: string | null, onScript: (s: string)=>void }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!topic) return;
    const s = generateHookAndScript(topic);
    setValue(s);
    onScript(s);
  }, [topic]);

  return (
    <div>
      <textarea value={value} onChange={e=>{setValue(e.target.value); onScript(e.target.value);}} className="input h-56 font-mono" placeholder="Select a topic to auto-generate a script..." />
      <div className="flex justify-end mt-2">
        <button className="btn" onClick={()=>{ if(topic){ const s = generateHookAndScript(topic); setValue(s); onScript(s);} }}>
          <Sparkles size={16} /> Regenerate
        </button>
      </div>
    </div>
  );
}
