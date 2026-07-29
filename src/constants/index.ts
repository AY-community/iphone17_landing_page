import React from "react";

// ─── Frame / scroll config ───────────────────────────────────────────────────
export const FRAME_COUNT = 340;
export const SCROLL_PX   = 7000;
export const CONCURRENCY = 4;
export const CANVAS_DONE = 0.75;
export const ST_INIT_MS  = 80;

export const getFrameSrc = (i: number) =>
  `/frames/frame${String(i + 1).padStart(4, "0")}.jpg`;

// ─── Navigation ──────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: "Store",  href: "https://www.apple.com/store" },
  { label: "Mac",    href: "https://www.apple.com/mac" },
  { label: "iPhone", href: "https://www.apple.com/iphone" },
  { label: "Watch",  href: "https://www.apple.com/watch" },
] as const;

export const linkStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.85)",
  fontSize: "15px",
  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  fontWeight: 400,
  textDecoration: "none",
  letterSpacing: "0.02em",
};

// ─── UI tokens ───────────────────────────────────────────────────────────────
export const SQUARE_SHADOW =
  "0 0 20px 4px rgba(255,255,255,.2),0 0 60px 12px rgba(255,255,255,.08)";

// ─── Tape / ring content ─────────────────────────────────────────────────────
export const TAPE_WORDS   = "TITANIUM · A19 PRO · PROCAMERA · 3NM SILICON · SPATIAL AUDIO · CERAMIC SHIELD · INTELLIGENCE · ALWAYS-ON · ";
export const TAPE_DISPLAY = "TITANIUM · A19 PRO · PROCAMERA · 3NM SILICON · ALWAYS ON · ";

// SVG snake path shared by TapeSection layers
export const SNAKE = "M-200,300 C180,120 400,480 720,300 C1040,120 1260,480 1640,300";

// ─── Ring ─────────────────────────────────────────────────────────���──────────
export const RING_R    = 270;
export const RING_CX   = 350;
export const RING_CY   = 350;
export const RING_TEXT = "TITANIUM · A19 PRO · 3NM · 5× ZOOM · ";

// ─── Product colours ─────────────────────────────────────────────────────────
export const IPHONE_COLORS = [
  { name: "Desert Orange",  hex: "#FF6B35", glow: "rgba(255,107,53,0.55)",  image: "/orange.png" },
  { name: "White Titanium", hex: "#F2F0EB", glow: "rgba(242,240,235,0.35)", image: "/white.png"  },
  { name: "Deep Navy",      hex: "#1A2744", glow: "rgba(26,39,68,0.55)",    image: "/navy.png"   },
] as const;

// ─── Developer cards ─────────────────────────────────────────────────────────
export const DEV_PLACEHOLDERS = [
  { id: 1, name: "Sarah Chen",    role: "Core ML",           img: "https://i.pravatar.cc/400?img=47" },
  { id: 2, name: "Marcus Rivera", role: "ARKit 6",           img: "https://i.pravatar.cc/400?img=11" },
  { id: 3, name: "Zoe Nakamura",  role: "Metal 3 GPU",       img: "https://i.pravatar.cc/400?img=9"  },
  { id: 4, name: "Liam O'Brien",  role: "Spatial Computing", img: "https://i.pravatar.cc/400?img=15" },
  { id: 5, name: "Priya Sharma",  role: "HealthKit",         img: "https://i.pravatar.cc/400?img=38" },
  { id: 6, name: "Kai Tanaka",    role: "StoreKit 2",        img: "https://i.pravatar.cc/400?img=53" },
  { id: 7, name: "Elena Vasquez", role: "Swift Concurrency",  img: "https://i.pravatar.cc/400?img=25" },
  { id: 8, name: "Noah Williams", role: "CloudKit Sync",     img: "https://i.pravatar.cc/400?img=60" },
] as const;

// ─── Footer bubbles (pre-computed to avoid re-render churn) ──────────────────
export const BUBBLE_DATA = Array.from({ length: 28 }, (_, i) => ({
  id:     i,
  dim:    (3 + Math.random() * 6).toFixed(2),
  uplift: (10 + Math.random() * 15).toFixed(2),
  posX:   (Math.random() * 100).toFixed(2),
  dur:    (3 + Math.random() * 3).toFixed(2),
  delay:  (-1 * (Math.random() * 10)).toFixed(2),
}));
