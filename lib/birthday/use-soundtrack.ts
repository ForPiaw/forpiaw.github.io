"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSoundtrack(scene: number) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const context = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const desired = useRef(.42);
  const mutedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const fade = useCallback((target: number, seconds = 1.4) => {
    const a = audio.current;
    if (!a) return;
    if (gain.current && context.current) {
      const p = gain.current.gain, now = context.current.currentTime;
      p.cancelScheduledValues(now);
      p.setValueAtTime(p.value, now);
      p.linearRampToValueAtTime(target, now + seconds);
    } else {
      // HTML media volume is the fallback when Web Audio is unavailable.
      try { a.volume = target; } catch { /* Some iOS versions fix element volume. */ }
    }
  }, []);

  const start = useCallback(() => {
    if (!audio.current) {
      const a = new Audio("/audio/wonderwall.mp3");
      a.loop = true;
      a.preload = "none";
      a.onplay = () => { setPlaying(true); setUnavailable(false); };
      a.onpause = () => setPlaying(false);
      a.onerror = () => { setUnavailable(true); setPlaying(false); };
      audio.current = a;
      try {
        const AudioCtor = window.AudioContext || (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
        if (AudioCtor) {
          const ctx = new AudioCtor();
          const g = ctx.createGain();
          g.gain.value = 0;
          ctx.createMediaElementSource(a).connect(g);
          g.connect(ctx.destination);
          context.current = ctx; gain.current = g;
        }
      } catch { /* The experience also works with a regular audio element. */ }
    }
    if (context.current?.state === "suspended") void context.current.resume().catch(() => {});
    const a = audio.current;
    a.muted = mutedRef.current;
    void a.play().then(() => fade(mutedRef.current ? 0 : desired.current, 1.8)).catch(() => {setPlaying(false); setUnavailable(true);});
  }, [fade]);

  const toggle = useCallback(() => {
    if (!audio.current || audio.current.paused || unavailable) {
      mutedRef.current = false; setMuted(false); start(); return;
    }
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    audio.current.muted = mutedRef.current;
    fade(mutedRef.current ? 0 : desired.current, .4);
  }, [fade, start, unavailable]);

  useEffect(() => {
    desired.current = scene === 6 || scene === 7 ? .19 : scene === 8 ? .55 : scene === 5 ? .28 : .42;
    fade(mutedRef.current ? 0 : desired.current);
  }, [scene, fade]);
  useEffect(() => () => {
    audio.current?.pause();
    if (context.current) void context.current.close().catch(() => {});
  }, []);
  return {start, toggle, playing: playing && !muted, muted, unavailable};
}
