"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Progress } from "@/components/ui/progress";

type Props = {onComplete: () => void; onStart?: () => void; children: ReactNode; label: string; className?: string; duration?: number; disabled?: boolean};
export function HoldButton({onComplete, onStart, children, label, className = "", duration = 1100, disabled = false}: Props) {
  const [progress, setProgress] = useState(0);
  const frame = useRef(0), startTime = useRef(0), done = useRef(false), active = useRef(false);
  const completeRef = useRef(onComplete); completeRef.current = onComplete;
  const cancel = () => {active.current = false; cancelAnimationFrame(frame.current); if (!done.current) setProgress(0);};
  const begin = () => {
    if (done.current || active.current) return;
    onStart?.(); active.current = true; startTime.current = performance.now();
    const tick = (now: number) => {
      if (!active.current) return;
      const p = Math.min(1, (now - startTime.current) / duration); setProgress(p);
      if (p === 1) {done.current = true; active.current = false; completeRef.current();}
      else frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return <div className={`hold-wrap ${className}`} style={{"--hold": `${progress * 100}%`} as CSSProperties}>
    <button className={`hold-button ${progress > 0 ? "holding" : ""}`} aria-label={label} disabled={disabled}
      onContextMenu={e => e.preventDefault()}
      onPointerDown={e => {if (e.button !== 0) return; e.currentTarget.setPointerCapture(e.pointerId); begin();}}
      onPointerUp={cancel} onPointerCancel={cancel} onLostPointerCapture={cancel}
      onClick={e => {if (e.detail === 0 && !done.current) {onStart?.(); done.current = true; setProgress(1); completeRef.current();}}}>
      {children}
    </button>
    <Progress className="hold-progress" value={progress * 100} aria-label={label} />
  </div>;
}
