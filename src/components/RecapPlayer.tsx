"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import type { RecapStoryboard } from "@/lib/parseMessage";
import { Recap, RECAP_FPS, totalRecapFrames } from "./Recap";
import { normalizeMood, MOOD_NAMES, type MoodName } from "@/lib/moodMusic";

type Props = {
  storyboard: RecapStoryboard | null;
  isPartial?: boolean;
};

export default function RecapPlayer({ storyboard, isPartial }: Props) {
  const safeBoard = useMemo<RecapStoryboard | null>(() => {
    if (!storyboard) return null;
    const scenes = (storyboard.scenes ?? []).filter(
      (s) => s && typeof s.caption === "string" && s.caption.trim(),
    );
    if (scenes.length === 0) return null;
    return {
      title: storyboard.title,
      mood: storyboard.mood,
      scenes,
    };
  }, [storyboard]);

  const durationInFrames = useMemo(
    () => (safeBoard ? totalRecapFrames(safeBoard) : 30),
    [safeBoard],
  );

  const mood: MoodName = useMemo(
    () => normalizeMood(safeBoard?.mood),
    [safeBoard?.mood],
  );

  const playerRef = useRef<PlayerRef | null>(null);
  const [musicOn, setMusicOn] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [chosenMood, setChosenMood] = useState<MoodName>(mood);
  const [speed, setSpeed] = useState<number>(1);
  const prevMoodRef = useRef<MoodName>(mood);

  // Follow prop-driven mood changes (new storyboard streams in) without
  // losing the user's manual override within one storyboard. This is React's
  // "adjust state while rendering" pattern — safe and lint-clean.
  if (prevMoodRef.current !== mood) {
    prevMoodRef.current = mood;
    setChosenMood(mood);
  }

  // Subscribe to play/pause/ended and drive the music engine.
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;

    let cancelled = false;

    const start = async () => {
      if (!musicOn || cancelled) return;
      const mod = await import("@/lib/moodMusic");
      if (cancelled) return;
      await mod.startMoodMusic(chosenMood);
    };
    const stop = async () => {
      const mod = await import("@/lib/moodMusic");
      mod.stopMoodMusic();
    };

    const onPlay = () => {
      setPlaying(true);
      void start();
    };
    const onPause = () => {
      setPlaying(false);
      void stop();
    };
    const onEnded = () => {
      setPlaying(false);
      void stop();
    };

    p.addEventListener("play", onPlay);
    p.addEventListener("pause", onPause);
    p.addEventListener("ended", onEnded);

    return () => {
      cancelled = true;
      p.removeEventListener("play", onPlay);
      p.removeEventListener("pause", onPause);
      p.removeEventListener("ended", onEnded);
      void stop();
    };
  }, [chosenMood, musicOn]);

  // Also stop when toggling music off mid-playback.
  useEffect(() => {
    if (musicOn) return;
    void (async () => {
      const mod = await import("@/lib/moodMusic");
      mod.stopMoodMusic();
    })();
  }, [musicOn]);

  if (!safeBoard) {
    return (
      <div
        className="card-flashlight relative overflow-hidden rounded-[20px] border border-[color:var(--rule)] bg-white/60 p-6"
        style={{ aspectRatio: "16 / 9" }}
      >
        <div className="flex h-full items-center justify-center">
          <span
            className="text-shimmer text-[13px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {isPartial ? "Recording recap…" : "Recap pending"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="card-flashlight relative overflow-hidden rounded-[20px] border border-[color:var(--rule)] bg-white/70">
        <div
          className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-[color:var(--rule)] bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[color:var(--ink-faint)]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          <span
            aria-hidden
            className={`inline-block h-1.5 w-1.5 rounded-full bg-red-500 ${playing ? "animate-pulse" : ""}`}
          />
          recap · remotion · tone.js
        </div>
        <Player
          ref={playerRef}
          component={Recap}
          inputProps={{ storyboard: safeBoard }}
          durationInFrames={durationInFrames}
          fps={RECAP_FPS}
          compositionWidth={1280}
          compositionHeight={720}
          style={{ width: "100%", height: "auto", aspectRatio: "16 / 9" }}
          controls
          autoPlay={!isPartial}
          loop={false}
          clickToPlay
          playbackRate={speed}
          acknowledgeRemotionLicense
        />
      </div>

      {/* Music controls: mood picker + on/off, purely client-side, no network */}
      <div className="flex flex-wrap items-center gap-2 px-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-faint)]">
        <span style={{ fontFamily: "var(--font-geist-sans)" }}>music</span>
        <div className="flex flex-wrap gap-1">
          {MOOD_NAMES.map((m) => {
            const active = m === chosenMood;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setChosenMood(m)}
                className={`rounded-full border px-2.5 py-1 transition ${
                  active
                    ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--bg)]"
                    : "border-[color:var(--rule-strong)] bg-white/70 text-[color:var(--ink)] hover:bg-white"
                }`}
                style={{ fontFamily: "var(--font-geist-sans)" }}
                aria-pressed={active}
              >
                {m}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setMusicOn((v) => !v)}
          className="ml-2 rounded-full border border-[color:var(--rule-strong)] bg-white/70 px-2.5 py-1 text-[color:var(--ink)] transition hover:bg-white"
          style={{ fontFamily: "var(--font-geist-sans)" }}
          aria-pressed={!musicOn}
        >
          {musicOn ? "music on" : "music off"}
        </button>

        <span
          className="ml-4"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          speed
        </span>
        <div className="flex flex-wrap gap-1">
          {SPEEDS.map((s) => {
            const active = s === speed;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`rounded-full border px-2.5 py-1 transition ${
                  active
                    ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--bg)]"
                    : "border-[color:var(--rule-strong)] bg-white/70 text-[color:var(--ink)] hover:bg-white"
                }`}
                style={{ fontFamily: "var(--font-geist-sans)" }}
                aria-pressed={active}
              >
                {formatSpeed(s)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const SPEEDS = [0.5, 0.75, 1, 1.5, 2];

function formatSpeed(s: number): string {
  return Number.isInteger(s) ? `${s}×` : `${s}×`;
}
