"use client";

import { BUBBLE_DATA } from "@/constants";

/* ─── Individual bubble ─────────────────────────────────────────────────────── */
function FooterBubbles() {
  return (
    <>
      {BUBBLE_DATA.map((b) => (
        <span
          key={b.id}
          className="gooey-bubble"
          style={
            {
              "--dim":    `${b.dim}rem`,
              "--uplift": `${b.uplift}rem`,
              "--pos-x":  `${b.posX}%`,
              "--dur":    `${b.dur}s`,
              "--delay":  `${b.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────────── */
export default function GooeyFooter() {
  return (
    <>
      {/* SVG gooey filter — zero visual footprint */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          <filter id="footer-gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      {/* Outer wrapper */}
      <div style={{ position: "relative", width: "100%" }}>
        {/* Gooey merge zone — sits above the footer in the black gap */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "-10%",
            width: "120%",
            height: "6rem",
            background: "#FF6B35",
            transform: "translateY(-99%)",
            filter: "url(#footer-gooey)",
            overflow: "visible",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <FooterBubbles />
        </div>

        {/* ── Main footer ── */}
        <footer className="site-footer">
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: "'Orbitron', monospace",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Apple · 2025
          </p>

          <h2
            style={{
              margin: "0 0 16px",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "clamp(28px,4.5vw,60px)",
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 1.0,
            }}
          >
            <span style={{ color: "#fff" }}>Think different.</span>
            <br />
            <span style={{ color: "rgba(255,255,255,0.7)" }}>Build the future.</span>
          </h2>

          <p
            style={{
              margin: "0 0 24px",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "clamp(12px,0.9vw,15px)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.7,
              maxWidth: "440px",
            }}
          >
            Every tool. Every platform. Every possibility — starting at $999.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href="#"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FF6B35",
                textDecoration: "none",
                background: "#fff",
                borderRadius: "999px",
                padding: "11px 26px",
              }}
            >
              Shop now
            </a>
            <a
              href="#"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "#fff",
                textDecoration: "none",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "999px",
                padding: "11px 26px",
              }}
            >
              Explore →
            </a>
          </div>

          {/* Legal links */}
          <div
            style={{
              display: "flex",
              gap: "28px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "18px",
            }}
          >
            {['Privacy', 'Terms', 'Accessibility', 'Legal', 'Sitemap'].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                }}
              >
                {link}
              </a>
            ))}
          </div>

          <p
            style={{
              margin: 0,
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "11px",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.06em",
            }}
          >
            Copyright © 2025 Apple Inc. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
