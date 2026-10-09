"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, Heart, Star } from "lucide-react";
import { photos } from "@/lib/birthday/content";
import { HoldButton } from "./hold-button";
import { heartPoints as points } from "@/lib/birthday/constellation";

const pairs = [0, 2, 5, 2, 0, 5];
export function MemoryGame({onNext}: {onNext: () => void}) {
  const [open, setOpen] = useState<number[]>([]), [matched, setMatched] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const done = matched.length === 6;
  useEffect(() => () => {if (resetTimer.current) clearTimeout(resetTimer.current);}, []);
  const flip = (i: number) => {
    if (open.length === 2 || matched.includes(i) || open.includes(i)) return;
    const next = [...open, i];setOpen(next);
    if (next.length === 2) {
      setTries(v => v + 1);
      if (pairs[next[0]] === pairs[next[1]]) {
        setMatched(v => [...v, ...next]);setOpen([]);
      } else resetTimer.current = setTimeout(() => setOpen([]), 850);
    }
  };
  return <div className="scene-inner centered game-scene">
    <span className="eyebrow">MAIN SEBENTAR, YUK</span>
    <h1 className="scene-title">cari <em>kita.</em></h1>
    <p className="scene-description">coba temuin tiga pasang foto yang sama.</p>
    <div className="memory-grid" aria-label="Permainan pasangan foto">
      {pairs.map((photo, i) => <button key={i} className={`memory-tile ${open.includes(i) || matched.includes(i) ? "flipped" : ""} ${matched.includes(i) ? "matched" : ""}`}
        onClick={() => flip(i)} disabled={matched.includes(i)} aria-label={`Kartu ${i + 1}${matched.includes(i) ? ", sudah cocok" : open.includes(i) ? ", terbuka" : ", buka foto"}`} aria-pressed={open.includes(i) || matched.includes(i)}>
        <span className="tile-front"><Heart size={22} strokeWidth={1} /><span>{String(i + 1).padStart(2,"0")}</span></span>
        <span className="tile-back"><img src={photos[photo].src} alt={open.includes(i) || matched.includes(i) ? photos[photo].alt : ""} draggable={false} width="720" height="1280" />{matched.includes(i) && <span className="match-check"><Check size={14}/></span>}</span>
      </button>)}
    </div>
    <div className="game-status" aria-live="polite">{done ? "ketemuuu, semuanya 🤍" : `${matched.length / 2} / 3 pasang${tries > 0 ? ` · ${tries} kali coba` : ""}`}</div>
    {done ? <button className="primary-button" onClick={onNext}>aku ada kue buat kamu</button> : <button className="text-button" onClick={onNext}>Skip dulu</button>}
  </div>;
}

export function WishScene({onNext, startSound}: {onNext: () => void; startSound: () => void}) {
  const [out, setOut] = useState(false);
  return <div className={`scene-inner centered wish-scene ${out ? "wish-made" : ""}`}>
    <span className="eyebrow">22 OKTOBER · HARI KAMU</span>
    <h1 className="scene-title">Make a <em>wish.</em></h1>
    <p className="scene-description">{out ? "semogaaa didatanggkann olehhh hall hall baikkk 🤍" : "pikirin satu harapan. simpen dulu di hati, yaa."}</p>
    <div className="cake-stage">
      <div className="cake-halo" aria-hidden="true"/>
      <img className="cake-image" src="/cake.webp" width="800" height="800" alt="Kue ulang tahun ungu berbentuk hati" />
      <div className="candle-control">
        {!out ? <HoldButton className="candle-hold" duration={1200} onStart={startSound} onComplete={() => setOut(true)} label="Tahan lilin untuk memadamkannya">
          <span className="candles"><span className="candle"><span className="flame"/>1</span><span className="candle"><span className="flame"/>8</span></span>
        </HoldButton> : <div className="extinguished" aria-label="Lilin sudah padam"><span className="smoke"/><span className="candles"><span className="candle">1</span><span className="candle">8</span></span></div>}
      </div>
      {out && <div className="wish-sparkles" aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}>✦</i>)}</div>}
    </div>
    <div className="wish-actions" aria-live="polite">
      {out ? <button className="primary-button" onClick={onNext}>udahh, lanjut yaa</button> : <><p className="gesture-hint">tahan lilinnya buat padamin</p><button className="text-button" onClick={() => setOut(true)}>atau ketuk di sini</button><button className="skip-button" onClick={onNext}>Skip</button></>}
    </div>
  </div>;
}

export function StarsScene({onNext}: {onNext:()=>void}) {
  const [lit, setLit] = useState<number[]>([]);
  const done = lit.length === 18;
  const light = (i:number) => setLit(old => old.includes(i) ? old : [...old,i]);
  const board = useRef<HTMLDivElement>(null);
  const touching = useRef(false);
  const sweep = (x:number,y:number) => {
    const r = board.current?.getBoundingClientRect();if (!r) return;
    const hits=points.flatMap((p,i)=>Math.hypot(x-(r.left+p.x*r.width/100), y-(r.top+p.y*r.height/100)) < 27 ? [i] : []);
    if (hits.length) setLit(old => [...new Set([...old,...hits])]);
  };
  return <div className={`scene-inner centered stars-scene ${done ? "all-lit" : ""}`}>
    <span className="eyebrow">SATU LANGIT KECIL BUAT KAMU</span>
    <h1 className="scene-title">semesta<em>kkuuu.</em></h1>
    <p className="scene-description">{done ? "kamu. selalu kamu." : "nyalain 18 bintangnya, satu-satu atau usap aja."}</p>
    <div className="constellation" ref={board} onPointerDown={e=>{touching.current=true;sweep(e.clientX,e.clientY);}} onPointerMove={e=>{if(touching.current)sweep(e.clientX,e.clientY);}} onPointerUp={()=>touching.current=false} onPointerCancel={()=>touching.current=false} onPointerLeave={()=>touching.current=false}>
      <svg className="star-lines" viewBox="0 0 100 100" aria-hidden="true">{points.map((p,i)=>{const n=points[(i+1)%18];return <line key={i} x1={p.x} y1={p.y} x2={n.x} y2={n.y} className={lit.includes(i)&&lit.includes((i+1)%18)?"lit":""}/>;})}</svg>
      {points.map((p,i)=><button key={i} className={`star-target ${lit.includes(i)?"lit":""}`} style={{left:`${p.x}%`,top:`${p.y}%`,"--delay":`${i*.13}s`} as CSSProperties} onClick={()=>light(i)} aria-pressed={lit.includes(i)} aria-label={`Bintang ${i+1}${lit.includes(i)?", menyala":""}`}><Star size={17} strokeWidth={1}/></button>)}
      <div className="constellation-center" aria-live="polite">{done ? <Heart size={42} strokeWidth={.8}/> : <><span>{String(lit.length).padStart(2,"0")}</span><small>/ 18</small></>}</div>
    </div>
    {done ? <button className="primary-button" onClick={onNext}>ada yang pengen aku bilang</button> : <button className="text-button" onClick={onNext}>Skip dulu</button>}
  </div>;
}
