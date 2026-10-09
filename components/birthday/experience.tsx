"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Heart, Headphones, Volume2, VolumeX, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { letters, photos, chapterNames } from "@/lib/birthday/content";
import { useSoundtrack } from "@/lib/birthday/use-soundtrack";
import { HoldButton } from "./hold-button";
import { heartPoints } from "@/lib/birthday/constellation";
import { MemoryGame, WishScene, StarsScene } from "./games";

const order = [5,0,2,1,3,4,6];
const specks = Array.from({length:24},(_,i)=>({left:`${(i*37+11)%100}%`,top:`${(i*23+7)%100}%`,delay:`${i*.27}s`,size:i%4===0?3:2}));
function Atmosphere({finale = false}:{finale?:boolean}) {
  return <div className={`atmosphere ${finale?"celebrating":""}`} aria-hidden="true"><div className="ambient-light"/>{specks.map((s,i)=><i key={i} style={{left:s.left,top:s.top,width:s.size,height:s.size,"--delay":s.delay,"--drift":`${i%2?1:-1}0px`} as CSSProperties}/>)}<div className="grain"/></div>;
}

function Opening({onStart, startSound, ready}: {onStart:()=>void;startSound:()=>void;ready:boolean}) {
  return <div className="scene-inner opening-scene">
    <div className="opening-copy"><span className="eyebrow">SESUATU KECIL, KHUSUS BUAT KAMU</span><h1>piaw<span className="opening-dots">...</span></h1><p>aku ada sesuatu<br/>buat kamu.</p><div className="intro-rule"/><span className="small-note">nggak perlu buru-buru, yaa.</span></div>
    <div className="opening-interaction">
      <div className="orbital">
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
        <div className="intro-photo intro-photo-left"><img src={photos[0].src} alt="Foto aku dan Piaw" width="720" height="1280" draggable={false}/><span>aku</span></div>
        <div className="intro-photo intro-photo-right"><img src={photos[5].src} alt="Foto aku dan Piaw" width="720" height="1280" draggable={false}/><span>kamu</span></div>
        <span className="orbital-spark one">✦</span><span className="orbital-spark two">✧</span>
        <div className="heart-trigger"><HoldButton disabled={!ready} label="Tahan hati untuk membuka kejutan" onStart={startSound} onComplete={onStart}><Heart size={60} strokeWidth={.7}/></HoldButton></div>
      </div>
      <p className="gesture-hint"><span className="tiny-pulse"/>{ready ? "tahan hati ini sebentar" : "sebentar, yaa..."}</p>
      <button className="text-button intro-fallback" disabled={!ready} onClick={()=>{startSound();onStart();}}>atau ketuk untuk buka</button>
    </div>
    <div className="headphone-note"><Headphones size={15}/><span>lebih enak pakai suara</span></div>
  </div>;
}

function Reveal({onNext}:{onNext:()=>void}) {
  return <div className="scene-inner centered reveal-scene">
    <span className="eyebrow">22 OKTOBER 2026</span>
    <div className="reveal-heading"><span className="reveal-number" aria-hidden="true">18</span><p className="birthday-small">Happy Birthday</p><h1>Piawww<span>♡</span></h1></div>
    <div className="reveal-photo"><img src={photos[5].src} alt="Aku dan Piaw" width="720" height="1280"/><span className="photo-tape"/><span className="reveal-photo-note">orang kesayanganku.</span></div>
    <p className="reveal-message">selamatt ulangg tahunnn yaaa<br/>sayangggggkuuu cintaaakuuu</p>
    <button className="primary-button" onClick={onNext}>sini, ikut aku</button>
  </div>;
}

function Memories({onNext, gallery = false}:{onNext:()=>void;gallery?:boolean}) {
  const [index,setIndex] = useState(0), [offset,setOffset] = useState(0);
  const start = useRef<{x:number;y:number}|null>(null);
  const shift = (delta:number)=>{setIndex(v=>(v+delta+order.length)%order.length);setOffset(0);};
  const seen = useRef(new Set([0]));seen.current.add(index);
  return <div className="scene-inner centered memories-scene">
    <span className="eyebrow">OUR MEMORIES</span><h1 className="scene-title">aku <em>+ kamu.</em></h1>
    <div className="photo-stack" onPointerDown={e=>{if(e.button!==0)return;start.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={e=>{if(start.current)setOffset(Math.max(-110,Math.min(110,e.clientX-start.current.x)));}}
      onPointerUp={e=>{if(start.current){const dx=e.clientX-start.current.x,dy=e.clientY-start.current.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))shift(dx<0?1:-1);else setOffset(0);}start.current=null;}}
      onPointerCancel={()=>{setOffset(0);start.current=null;}}>
      {[-1,1,0].map(pos=>{const current=(index+pos+order.length)%order.length;const photo=photos[order[current]];return <div key={`${pos}-${current}`} className={`photo-paper photo-position-${pos===-1?"left":pos===1?"right":"center"}`} style={pos===0?{"--drag":`${offset}px`,"--tilt":`${offset/18}deg`} as CSSProperties:undefined} aria-hidden={pos!==0}>
        <img src={photo.src} alt={pos===0?photo.alt:""} width="720" height="1280" draggable={false}/><div className="photo-label"><span>aku + kamu</span><small>{String(current+1).padStart(2,"0")}</small></div>
      </div>;})}
    </div>
    <div className="photo-navigation"><button className="icon-button" aria-label="Foto sebelumnya" onClick={()=>shift(-1)}><ChevronLeft size={19}/></button><div className="photo-indicators" aria-label={`Foto ${index+1} dari 7`}>{order.map((_,i)=><button key={i} className={index===i?"active":""} onClick={()=>{setIndex(i);setOffset(0);}} aria-label={`Lihat foto ${i+1}`} aria-current={index===i?"true":undefined}/>)}</div><button className="icon-button" aria-label="Foto selanjutnya" onClick={()=>shift(1)}><ChevronRight size={19}/></button></div>
    <p className="gesture-hint">geser fotonya, pelan-pelan aja.</p>
    <button className="primary-button" onClick={onNext}>{gallery?"balik ke sini lagi":seen.current.size===7?"udah senyum? main dulu yuk":"lanjut, yuk"}</button>
  </div>;
}

function LetterScene({onNext}:{onNext:()=>void}) {
  const [page,setPage]=useState(0);
  const paper=useRef<HTMLDivElement>(null);
  const turn=(next:number)=>{setPage(next);window.scrollTo({top:0,behavior:"instant"});paper.current?.focus({preventScroll:true});};
  return <div className="scene-inner letter-scene">
    <div className="letter-heading"><span className="eyebrow">DARI AKU, BUAT KAMU</span><h1>sayanggg<em>kuuu,</em></h1><span className="letter-count">{String(page+1).padStart(2,"0")} / 03</span></div>
    <div className="letter-paper" ref={paper} tabIndex={-1} key={page}>
      <span className="paper-mark" aria-hidden="true">♡</span>
      {letters[page].split(/\n|(?<=\.)\s+/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}
      <div className="letter-sign"><Heart size={21} strokeWidth={1}/><span>aku.</span></div>
    </div>
    <div className="letter-navigation">{page>0?<button className="text-button" onClick={()=>turn(page-1)}>sebelumnya</button>:<span className="small-note">baca pelan-pelan, yaa.</span>}<button className="primary-button" onClick={()=>page<2?turn(page+1):onNext()}>{page<2?"masih ada lagi":"udahh 🤍"}</button></div>
  </div>;
}

function AlmostEnd({onNext}:{onNext:()=>void}) {
  return <div className="scene-inner centered almost-scene"><Heart className="end-heart" size={36} strokeWidth={.7}/><span className="eyebrow">ITU DULU...</span><h1>sayanggg<em>kuuu.</em></h1><p>semogaaa adeweee bisaa<br/>sampaii selamanyaaa</p><div className="almost-pause"/><button className="last-surprise" onClick={onNext}><span>eh, tunggu.</span><span>masih ada satu lagi ♡</span></button></div>;
}

function Finale({replay,memories,fullLetters}:{replay:()=>void;memories:()=>void;fullLetters:()=>void}) {
  return <div className="scene-inner centered finale-scene"><span className="eyebrow">SELURUH SEMESTAKUUU</span>
    <div className="finale-universe"><div className="universe-glow"/><div className="universe-orbit o1"/><div className="universe-orbit o2"/>
      {photos.map((p,i)=><div className={`universe-photo up-${i}`} key={i} style={{"--i":i} as CSSProperties}><img src={p.src} alt={p.alt} width="720" height="1280"/><span>♡</span></div>)}
      {heartPoints.map((point,i)=>{const x=50+(point.x-50)*1.05;const y=point.y;return <span className="final-star" key={i} style={{left:`${x}%`,top:`${y}%`,"--i":i} as CSSProperties} aria-hidden="true">✦</span>;})}
      <div className="universe-center"><Heart strokeWidth={.4} size={80}/><span>18</span></div>
    </div>
    <div className="finale-copy"><p className="birthday-small">Happy Birthday</p><h1>Piawww <span>♡</span></h1><span className="finale-date">22 · 10</span><p className="finale-message">tetepp milihh untukkk salinggg memahamuu,<br/>salinggg memperbaikiii,<br/>gekk tetepp berjuangg barengg barengg.</p></div>
    <div className="finale-actions"><button className="primary-button" onClick={memories}>Our Memories</button><button className="secondary-button" onClick={replay}><RotateCcw size={15}/>Replay</button></div><button className="text-button" onClick={fullLetters}>baca semua suratku</button>
  </div>;
}

export default function BirthdayExperience() {
  const [scene,setScene]=useState(0), [transitioning,setTransitioning]=useState(false), [fullLetters,setFullLetters]=useState(false), [gallery,setGallery]=useState(false);
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  const sound=useSoundtrack(scene);
  const transitionTimer=useRef<ReturnType<typeof setTimeout>|null>(null), endTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const sceneRef=useRef(0), busy=useRef(false), main=useRef<HTMLElement>(null);
  const navigate=useCallback((next:number)=>{
    if(busy.current || next<0 || next>8)return;
    busy.current=true;setTransitioning(true);
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    transitionTimer.current=setTimeout(()=>{sceneRef.current=next;setScene(next);window.scrollTo({top:0,behavior:"instant"});main.current?.focus({preventScroll:true});endTimer.current=setTimeout(()=>{setTransitioning(false);busy.current=false;},reduced?20:380);},reduced?10:320);
  },[]);
  useEffect(()=>()=>{if(transitionTimer.current)clearTimeout(transitionTimer.current);if(endTimer.current)clearTimeout(endTimer.current);},[]);
  useEffect(()=>{
    if(scene<2)return;
    // Preload the remaining tiny images only after the opening has been enjoyed.
    photos.forEach(p=>{const img=new Image();img.src=p.src;});
  },[scene]);
  useEffect(()=>{
    const context=(document as unknown as {modelContext?:{registerTool:(tool:Record<string,unknown>,options:{signal:AbortSignal})=>unknown}}).modelContext;
    if(!context?.registerTool)return;
    const life=new AbortController();
    try {
      void Promise.resolve(context.registerTool({name:"get_birthday_progress",description:"Read the current chapter of Piaw's birthday experience.",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({chapter:sceneRef.current,title:chapterNames[sceneRef.current]})},{signal:life.signal})).catch(()=>{});
      void Promise.resolve(context.registerTool({name:"navigate_birthday_chapter",description:"Navigate to a birthday chapter, using the same transition as the visible controls. Does not play audio or complete games.",inputSchema:{type:"object",properties:{chapter:{type:"integer",minimum:0,maximum:8}},required:["chapter"],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input:unknown)=>{const chapter=(input as {chapter?:number})?.chapter;if(!Number.isInteger(chapter)||chapter!<0||chapter!>8)throw Error("chapter must be an integer from 0 to 8");if(busy.current)throw Error("A chapter transition is already in progress");navigate(chapter!);await new Promise(resolve=>setTimeout(resolve,750));return {chapter:sceneRef.current,title:chapterNames[sceneRef.current]};}},{signal:life.signal})).catch(()=>{});
    } catch { /* Optional browser integration; visible controls are always available. */ }
    return ()=>life.abort();
  },[navigate]);
  const next=()=>navigate(scene+1);
  const theme=scene===1?"light-purple":scene===6?"paper-theme":"night-theme";
  return <div className={`birthday-app ${theme} scene-${scene}`}>
    <Atmosphere finale={scene===8}/>
    <header className="journey-header"><div className="identity"><span className="monogram">p.</span><span className="identity-caption">UNTUK PIAW<span>22.10.2026</span></span></div><div className="header-actions">{scene>0&&<button className="back-control" onClick={()=>navigate(scene-1)} aria-label="Bagian sebelumnya"><ChevronLeft size={18}/></button>}<button className={`sound-control ${sound.playing?"sound-playing":""}`} onClick={sound.toggle} disabled={!ready} aria-label={sound.playing?"Matikan musik":"Nyalakan musik"} aria-pressed={sound.playing}><span className="sound-bars" aria-hidden="true">{[0,1,2,3].map(i=><i key={i}/>)}</span>{sound.playing?<Volume2 size={15}/>:<VolumeX size={15}/>}<span className="sound-label">{sound.playing?"sound on":"sound off"}</span></button></div></header>
    <main className="stage" ref={main} tabIndex={-1} aria-label={`Bagian ${scene+1}: ${chapterNames[scene]}`}><div className="scene-content" key={`${scene}-${gallery}`}>
      {scene===0&&<Opening onStart={()=>navigate(1)} startSound={sound.start} ready={ready}/>}
      {scene===1&&<Reveal onNext={next}/>}
      {scene===2&&<Memories gallery={gallery} onNext={()=>{if(gallery){setGallery(false);navigate(8);}else next();}}/>}
      {scene===3&&<MemoryGame onNext={next}/>}
      {scene===4&&<WishScene onNext={next} startSound={sound.start}/>}
      {scene===5&&<StarsScene onNext={next}/>}
      {scene===6&&<LetterScene onNext={next}/>}
      {scene===7&&<AlmostEnd onNext={next}/>}
      {scene===8&&<Finale replay={()=>{setGallery(false);navigate(0);}} memories={()=>{setGallery(true);navigate(2);}} fullLetters={()=>setFullLetters(true)}/>}
    </div></main>
    <footer className="journey-footer"><span className="chapter-caption">{chapterNames[scene]}</span><div className="chapter-track" aria-label={`Bagian ${scene+1} dari 9`}>{chapterNames.map((_,i)=><i key={i} className={i<=scene?"passed":""}/>)}</div><span className="chapter-number">{String(scene+1).padStart(2,"0")} <span>/ 09</span></span><Progress className="sr-only" value={(scene+1)/9*100} aria-label="Perjalanan ulang tahun"/></footer>
    <div className={`scene-transition ${transitioning?"active":""}`} aria-hidden="true"><Heart size={48} strokeWidth={.6}/></div>
    {sound.unavailable&&<div className="audio-retry" role="status">musik belum mulai. <button onClick={sound.start}>coba nyalain</button></div>}
    <Dialog open={fullLetters} onOpenChange={setFullLetters}><DialogContent className="all-letters" showCloseButton={false}><div className="letters-dialog-header"><div><DialogTitle>semua yang mau aku bilang.</DialogTitle><DialogDescription>buat kamu, piaw 🤍</DialogDescription></div><DialogClose className="icon-button" aria-label="Tutup surat"><X size={20}/></DialogClose></div><div className="all-letters-scroll">{letters.map((letter,i)=><article key={i}><span className="eyebrow">0{i+1}</span>{letter.split(/\n|(?<=\.)\s+/).filter(Boolean).map((p,j)=><p key={j}>{p}</p>)}</article>)}<span className="letter-sign">aku. ♡</span></div></DialogContent></Dialog>
  </div>;
}
