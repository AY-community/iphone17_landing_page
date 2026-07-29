"use client";

import { useState } from "react";
import { DEV_PLACEHOLDERS } from "@/constants";

type DevItem = (typeof DEV_PLACEHOLDERS)[number];

export default function DevCard({ item }: { item: DevItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="dev-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Photo */}
      <img src={item.img} alt={item.name} />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)",
          transition: "opacity 0.35s ease",
          opacity: hovered ? 1 : 0.5,
          pointerEvents: "none",
        }}
      />

      {/* Role badge */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          fontFamily: "'Orbitron', monospace",
          fontSize: "7px",
          fontWeight: 700,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,107,53,0.9)",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          padding: "4px 8px",
          borderRadius: "6px",
          border: "1px solid rgba(255,107,53,0.25)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(-8px)",
          transition: "all 0.32s cubic-bezier(0.22,1,0.36,1) 0.04s",
          pointerEvents: "none",
        }}
      >
        {item.role}
      </div>

      {/* Name + underline */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "14px 16px",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(14px)",
          transition: "all 0.38s cubic-bezier(0.22,1,0.36,1)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "14px",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            marginTop: "5px",
            width: hovered ? "32px" : "0px",
            height: "2px",
            background: "#FF6B35",
            borderRadius: "2px",
            transition: "width 0.4s cubic-bezier(0.22,1,0.36,1) 0.1s",
          }}
        />
      </div>
    </div>
  );
}
