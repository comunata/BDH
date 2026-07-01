import { cn } from "@/lib/utils";

export type AiAssistantKind = "concierge" | "roomFinder" | "hotelManager" | "localGuide" | "upsell";

/**
 * No real AI-robot photography exists among the 50 delivered hotel images,
 * so each assistant gets a distinct CSS-gradient badge + inline SVG glyph
 * instead of an external placeholder image. Kept intentionally lightweight
 * (no new dependency, no network image) and reused everywhere a given
 * assistant appears so its visual identity stays consistent.
 */
const config: Record<AiAssistantKind, { gradient: string; icon: React.ReactNode; label: string }> = {
  concierge: {
    gradient: "from-champagne to-amber-600",
    label: "AI Concierge",
    icon: (
      <path d="M4 4h16v12H7l-3 3V4z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  roomFinder: {
    gradient: "from-emerald to-teal-700",
    label: "AI Room Finder",
    icon: (
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  hotelManager: {
    gradient: "from-slate-400 to-slate-700",
    label: "AI Hotel Manager",
    icon: (
      <path
        d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M4 21h16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  localGuide: {
    gradient: "from-sky-400 to-indigo-600",
    label: "AI Local Guide",
    icon: (
      <>
        <circle cx="12" cy="10" r="3" />
        <path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Z" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  upsell: {
    gradient: "from-rose-400 to-fuchsia-700",
    label: "AI Upsell",
    icon: (
      <path
        d="M4 17 10 11l4 4 6-7M14 6h6v6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
};

export function AiAvatar({ kind, size = 40, className }: { kind: AiAssistantKind; size?: number; className?: string }) {
  const { gradient, icon, label } = config[kind];
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-midnight", gradient, className)}
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        {icon}
      </svg>
    </div>
  );
}
