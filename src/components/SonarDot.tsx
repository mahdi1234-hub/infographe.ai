export default function SonarDot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex h-2.5 w-2.5 items-center justify-center text-[color:var(--accent)] ${className}`}
    >
      <span className="relative z-10 block h-2.5 w-2.5 rounded-full bg-[color:var(--accent)]" />
      <span className="sonar-ring" />
    </span>
  );
}
