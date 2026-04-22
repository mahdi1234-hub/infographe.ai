"use client";

import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { RecapScene, RecapStoryboard } from "@/lib/parseMessage";

export const RECAP_FPS = 30;
export const DEFAULT_SCENE_MS = 3200;

export function sceneDurationFrames(scene: RecapScene): number {
  const ms = typeof scene.durationMs === "number" && scene.durationMs > 400
    ? scene.durationMs
    : DEFAULT_SCENE_MS;
  return Math.max(20, Math.round((ms / 1000) * RECAP_FPS));
}

export function totalRecapFrames(storyboard: RecapStoryboard): number {
  const total = storyboard.scenes.reduce(
    (sum, s) => sum + sceneDurationFrames(s),
    0,
  );
  return Math.max(30, total);
}

function Scene({
  scene,
  index,
  total,
  title,
}: {
  scene: RecapScene;
  index: number;
  total: number;
  title?: string;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateRight: "clamp" },
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const lift = interpolate(frame, [0, 18], [18, 0], {
    extrapolateRight: "clamp",
  });

  const progress = interpolate(
    frame,
    [0, durationInFrames],
    [0, 1],
    { extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(900px circle at 20% 0%, rgba(196,140,86,0.18), transparent 55%), #F2EFEA",
        padding: 64,
        fontFamily: "'Plus Jakarta Sans', 'Geist Sans', system-ui, sans-serif",
        color: "#2C2824",
      }}
    >
      {/* Top rail: title + progress */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "'Geist Sans', system-ui, sans-serif",
          fontSize: 18,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(44,40,36,0.55)",
          opacity,
        }}
      >
        <span>
          ( recap{title ? ` · ${title}` : ""} )
        </span>
        <span>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Center: caption + body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          transform: `translateY(${lift}px)`,
          opacity,
        }}
      >
        <h2
          style={{
            fontSize: 84,
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            margin: 0,
            maxWidth: "22ch",
          }}
        >
          {scene.caption}
        </h2>
        {scene.body ? (
          <p
            style={{
              fontFamily: "'Geist Sans', system-ui, sans-serif",
              fontSize: 30,
              lineHeight: 1.4,
              maxWidth: "38ch",
              margin: 0,
              color: "rgba(44,40,36,0.75)",
            }}
          >
            {scene.body}
          </p>
        ) : null}
      </div>

      {/* Bottom: caption pill (live subtitle) + progress bar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          opacity,
        }}
      >
        <div
          style={{
            alignSelf: "flex-start",
            background: "rgba(44,40,36,0.9)",
            color: "#F2EFEA",
            padding: "14px 22px",
            borderRadius: 999,
            fontFamily: "'Geist Sans', system-ui, sans-serif",
            fontSize: 22,
            letterSpacing: "-0.005em",
            maxWidth: "72ch",
            boxShadow: "0 18px 40px -24px rgba(44,40,36,0.5)",
          }}
        >
          {scene.caption}
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 999,
            background: "rgba(44,40,36,0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: "#C48C56",
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function Recap({ storyboard }: { storyboard: RecapStoryboard }) {
  const scenes = storyboard.scenes.filter(
    (s) => typeof s.caption === "string" && s.caption.trim(),
  );
  if (scenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          background: "#F2EFEA",
          color: "rgba(44,40,36,0.6)",
          fontFamily: "'Geist Sans', system-ui, sans-serif",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
      >
        Preparing recap…
      </AbsoluteFill>
    );
  }

  const offsets: number[] = [];
  scenes.reduce((acc, s) => {
    offsets.push(acc);
    return acc + sceneDurationFrames(s);
  }, 0);

  return (
    <AbsoluteFill style={{ background: "#F2EFEA" }}>
      {scenes.map((scene, i) => (
        <Sequence
          key={i}
          from={offsets[i]}
          durationInFrames={sceneDurationFrames(scene)}
          layout="none"
        >
          <Scene
            scene={scene}
            index={i}
            total={scenes.length}
            title={storyboard.title}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
