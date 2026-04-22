"use client";

/**
 * Fully open-source procedural mood music for recap videos.
 *
 * No audio files, no external API. Everything is synthesized in the browser
 * with Tone.js (MIT) from chord progressions, pads and arpeggios we author
 * by hand.
 *
 * Call `startMoodMusic(mood)` when the Remotion Player starts playing and
 * `stopMoodMusic()` when it pauses / ends / unmounts. The module maintains
 * a single active session so calling `start` while already playing swaps
 * the preset gracefully (fade-out old, fade-in new).
 */

import * as Tone from "tone";

export type MoodName =
  | "calm"
  | "cinematic"
  | "corporate"
  | "upbeat"
  | "dramatic";

export const MOOD_NAMES: MoodName[] = [
  "calm",
  "cinematic",
  "corporate",
  "upbeat",
  "dramatic",
];

export function normalizeMood(input: string | undefined | null): MoodName {
  const v = (input || "").toLowerCase().trim();
  if ((MOOD_NAMES as string[]).includes(v)) return v as MoodName;
  // Small alias map for LLM drift.
  if (v.includes("ambien") || v.includes("chill") || v.includes("relax"))
    return "calm";
  if (v.includes("epic") || v.includes("film") || v.includes("trailer"))
    return "cinematic";
  if (v.includes("business") || v.includes("office") || v.includes("pitch"))
    return "corporate";
  if (v.includes("energ") || v.includes("fast") || v.includes("fun"))
    return "upbeat";
  if (v.includes("intens") || v.includes("tense") || v.includes("dark"))
    return "dramatic";
  return "cinematic";
}

type Preset = {
  bpm: number;
  /** Four chords (one bar each), voiced as note arrays. */
  chords: string[][];
  /** Arpeggio pattern (subdivisions of one bar), each step picks a chord index. */
  arpStep: string; // e.g. "8n"
  /** Bass note offset from the root (in semitones), per bar. */
  bassOctave: number;
  /** Per-synth volumes in dB. */
  mix: { pad: number; arp: number; bass: number; master: number };
  /** Short lead riff played once per chord cycle. */
  leadRiff?: { notes: string[]; step: string };
};

const PRESETS: Record<MoodName, Preset> = {
  calm: {
    bpm: 72,
    chords: [
      ["C4", "E4", "G4", "B4"],
      ["A3", "C4", "E4", "G4"],
      ["F3", "A3", "C4", "E4"],
      ["G3", "B3", "D4", "F4"],
    ],
    arpStep: "4n",
    bassOctave: 2,
    mix: { pad: -10, arp: -16, bass: -12, master: -6 },
  },
  cinematic: {
    bpm: 84,
    chords: [
      ["D3", "F3", "A3", "D4"],
      ["Bb2", "D3", "F3", "Bb3"],
      ["F3", "A3", "C4", "F4"],
      ["C3", "E3", "G3", "C4"],
    ],
    arpStep: "8n",
    bassOctave: 2,
    mix: { pad: -8, arp: -14, bass: -10, master: -5 },
    leadRiff: {
      notes: ["A4", "D5", "F5", "A5", "G5", "F5", "D5", "A4"],
      step: "8n",
    },
  },
  corporate: {
    bpm: 96,
    chords: [
      ["C4", "E4", "G4"],
      ["G3", "B3", "D4"],
      ["A3", "C4", "E4"],
      ["F3", "A3", "C4"],
    ],
    arpStep: "8n",
    bassOctave: 2,
    mix: { pad: -14, arp: -12, bass: -10, master: -6 },
  },
  upbeat: {
    bpm: 118,
    chords: [
      ["E4", "G#4", "B4"],
      ["C#4", "E4", "G#4"],
      ["A3", "C#4", "E4"],
      ["B3", "D#4", "F#4"],
    ],
    arpStep: "16n",
    bassOctave: 2,
    mix: { pad: -14, arp: -10, bass: -8, master: -5 },
    leadRiff: {
      notes: ["E5", "G#5", "B5", "G#5", "E5", "B4", "G#4", "E4"],
      step: "16n",
    },
  },
  dramatic: {
    bpm: 68,
    chords: [
      ["C3", "Eb3", "G3"],
      ["Ab2", "C3", "Eb3"],
      ["F2", "Ab2", "C3"],
      ["G2", "B2", "D3"],
    ],
    arpStep: "8n",
    bassOctave: 1,
    mix: { pad: -7, arp: -16, bass: -8, master: -5 },
    leadRiff: {
      notes: ["C5", "Eb5", "G5", "C6", "Bb5", "G5", "Eb5", "C5"],
      step: "4n",
    },
  },
};

type Session = {
  mood: MoodName;
  master: Tone.Gain;
  pad: Tone.PolySynth;
  arp: Tone.Synth;
  bass: Tone.Synth;
  lead?: Tone.Synth;
  parts: Tone.Part[];
  loop: Tone.Loop;
};

let session: Session | null = null;

function createSession(mood: MoodName): Session {
  const preset = PRESETS[mood];
  Tone.getTransport().bpm.value = preset.bpm;

  const master = new Tone.Gain(Tone.dbToGain(preset.mix.master)).toDestination();
  const reverb = new Tone.Reverb({ decay: 4, wet: 0.35 }).connect(master);

  // Warm pad for chords.
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 1.2, decay: 0.2, sustain: 0.8, release: 1.6 },
  });
  pad.volume.value = preset.mix.pad;
  pad.connect(reverb);

  // Bright arp.
  const arp = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.2, release: 0.6 },
  });
  arp.volume.value = preset.mix.arp;
  arp.connect(reverb);

  // Sub-ish bass.
  const bass = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.04, decay: 0.2, sustain: 0.7, release: 0.6 },
  });
  bass.volume.value = preset.mix.bass;
  const bassFilter = new Tone.Filter(500, "lowpass").connect(master);
  bass.connect(bassFilter);

  // Optional lead riff.
  let lead: Tone.Synth | undefined;
  if (preset.leadRiff) {
    lead = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.6 },
    });
    lead.volume.value = preset.mix.arp + 4;
    lead.connect(reverb);
  }

  const parts: Tone.Part[] = [];

  // Chord pad: each bar hits the full chord.
  const padEvents = preset.chords.map<[string, string[]]>((chord, i) => [
    `${i}:0:0`,
    chord,
  ]);
  const padPart = new Tone.Part<[string, string[]]>(
    (time, chord) => {
      pad.triggerAttackRelease(chord, "1n", time);
    },
    padEvents,
  );
  padPart.loop = true;
  padPart.loopEnd = "4m";
  padPart.start(0);
  parts.push(padPart);

  // Bass: root of the chord, low octave.
  const bassEvents = preset.chords.map<[string, string]>((chord, i) => {
    const root = chord[0];
    const note = root.slice(0, -1) + preset.bassOctave;
    return [`${i}:0:0`, note];
  });
  const bassPart = new Tone.Part<[string, string]>((time, note) => {
    bass.triggerAttackRelease(note, "2n", time);
  }, bassEvents);
  bassPart.loop = true;
  bassPart.loopEnd = "4m";
  bassPart.start(0);
  parts.push(bassPart);

  // Arp: cycle through chord tones across each bar.
  const arpEvents: [string, string][] = [];
  const stepsPerBar = preset.arpStep === "16n" ? 16 : preset.arpStep === "8n" ? 8 : 4;
  preset.chords.forEach((chord, bar) => {
    for (let i = 0; i < stepsPerBar; i++) {
      const note = chord[i % chord.length];
      arpEvents.push([
        `${bar}:${Math.floor(i / 4)}:${(i % 4) * (16 / stepsPerBar)}`,
        note,
      ]);
    }
  });
  const arpPart = new Tone.Part<[string, string]>((time, note) => {
    arp.triggerAttackRelease(note, preset.arpStep, time);
  }, arpEvents);
  arpPart.loop = true;
  arpPart.loopEnd = "4m";
  arpPart.start(0);
  parts.push(arpPart);

  // Lead riff once per cycle on bar 3.
  if (preset.leadRiff && lead) {
    const leadSynth = lead;
    const notes = preset.leadRiff.notes;
    const step = preset.leadRiff.step;
    const leadEvents: [string, string][] = notes.map((n, i) => {
      const sub = step === "4n" ? 4 : step === "8n" ? 8 : 16;
      const beats = 4;
      const idxPerBar = sub;
      const bar = 2 + Math.floor(i / idxPerBar);
      const within = i % idxPerBar;
      const beatsPerStep = beats / sub;
      const beat = Math.floor(within * beatsPerStep);
      const tick = Math.round((within * beatsPerStep - beat) * 4);
      return [`${bar}:${beat}:${tick}`, n];
    });
    const leadPart = new Tone.Part<[string, string]>((time, note) => {
      leadSynth.triggerAttackRelease(note, step, time);
    }, leadEvents);
    leadPart.loop = true;
    leadPart.loopEnd = "4m";
    leadPart.start(0);
    parts.push(leadPart);
  }

  // Dummy loop to keep the transport honest.
  const loop = new Tone.Loop(() => {}, "4m").start(0);

  return { mood, master, pad, arp, bass, lead, parts, loop };
}

function disposeSession(s: Session) {
  for (const p of s.parts) {
    p.stop(0);
    p.dispose();
  }
  s.loop.stop(0);
  s.loop.dispose();
  s.pad.dispose();
  s.arp.dispose();
  s.bass.dispose();
  s.lead?.dispose();
  s.master.dispose();
}

export async function startMoodMusic(mood: MoodName): Promise<void> {
  if (typeof window === "undefined") return;

  // The browser requires a user-gesture-initiated AudioContext resume.
  await Tone.start();

  if (session && session.mood === mood) {
    // Already playing this preset; just fade back up.
    session.master.gain.rampTo(Tone.dbToGain(PRESETS[mood].mix.master), 0.5);
    return;
  }

  if (session) {
    const old = session;
    old.master.gain.rampTo(0, 0.4);
    setTimeout(() => disposeSession(old), 500);
    session = null;
  }

  const next = createSession(mood);
  next.master.gain.value = 0;
  next.master.gain.rampTo(Tone.dbToGain(PRESETS[mood].mix.master), 0.6);
  session = next;

  const t = Tone.getTransport();
  t.position = 0;
  if (t.state !== "started") {
    t.start();
  }
}

export function stopMoodMusic(): void {
  if (typeof window === "undefined") return;
  if (!session) return;
  const s = session;
  session = null;
  s.master.gain.rampTo(0, 0.4);
  setTimeout(() => {
    disposeSession(s);
    const t = Tone.getTransport();
    if (t.state === "started") t.pause();
  }, 500);
}
