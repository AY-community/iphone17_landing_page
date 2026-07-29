"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { IPHONE_COLORS, RING_R, RING_CX, RING_CY, RING_TEXT, ST_INIT_MS } from "@/constants";

gsap.registerPlugin(ScrollTrigger);

type ColorEntry = (typeof IPHONE_COLORS)[number];

interface ProductSectionProps {
  currentColor:           ColorEntry;
  activeColor:            number;
  setActiveColor:         (i: number) => void;
  isProductSectionInView: boolean;
}

const SPEC_TEXT =
  "Forged from aerospace-grade titanium. Sculpted to just 5.1\u202fmm \u2014 the thinnest Pro ever made. " +
  "Powered by the A19\u202fPro chip on 3\u202fnm silicon, delivering a generational leap in performance. " +
  "A 5\u00d7 optical zoom camera system and 4K120 ProRes video. " +
  "Ceramic Shield front. Always-On Super Retina XDR display at 6.9\u2033. " +
  "Up to 33 hours of video. USB\u202f4. Wi-Fi\u202f7. Intelligence built in \u2014 on-device, private, yours.";

export default function ProductSection({
  currentColor,
  activeColor,
  setActiveColor,
  isProductSectionInView,
}: ProductSectionProps) {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const textPanelRef = useRef<HTMLDivElement>(null);
  const imgPanelRef  = useRef<HTMLDivElement>(null);
  const eyebrowRef   = useRef<HTMLParagraphElement>(null);
  const titleRef     = useRef<HTMLHeadingElement>(null);
  const descRef      = useRef<HTMLParagraphElement>(null);
  const swatchRowRef = useRef<HTMLDivElement>(null);
  const ctaRowRef    = useRef<HTMLDivElement>(null);
  const ringWrapRef  = useRef<HTMLDivElement>(null);
  const pulseRef     = useRef<HTMLDivElement>(null);
  const bgGlowRef    = useRef<HTMLDivElement>(null);
  const darkExitRef  = useRef<HTMLDivElement>(null);

  const [displayColor, setDisplayColor]       = useState(activeColor);
  const [prevColor, setPrevColor]             = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth colour-swap with exit/enter animations
  useEffect(() => {
    if (activeColor === displayColor || isTransitioning) return;
    setPrevColor(displayColor);
    setIsTransitioning(true);
    if (transTimerRef.current) clearTimeout(transTimerRef.current);
    transTimerRef.current = setTimeout(() => {
      setDisplayColor(activeColor);
      setPrevColor(null);
      setIsTransitioning(false);
    }, 720);
  }, [activeColor, displayColor, isTransitioning]);

  useEffect(() => {
    if (!isProductSectionInView) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const textPanel = textPanelRef.current!;
    const imgPanel  = imgPanelRef.current!;
    const eyebrow   = eyebrowRef.current!;
    const title     = titleRef.current!;
    const desc      = descRef.current!;
    const swatchRow = swatchRowRef.current!;
    const ctaRow    = ctaRowRef.current!;
    const ringWrap  = ringWrapRef.current;
    const pulse     = pulseRef.current;
    const bgGlow    = bgGlowRef.current;
    const darkExit  = darkExitRef.current;

    // Reinforce hidden state (JSX already sets these)
    gsap.set(textPanel, { opacity: 0, y: 72, filter: "blur(10px)" });
    gsap.set(imgPanel,  { opacity: 0, scale: 1.14, filter: "blur(22px)" });
    gsap.set(eyebrow,   { opacity: 0, y: 18 });
    gsap.set(title,     { opacity: 0, y: 40 });
    gsap.set(desc,      { opacity: 0 });
    gsap.set(swatchRow, { opacity: 0, y: 20 });
    gsap.set(ctaRow,    { opacity: 0, y: 20 });

    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    const ease4 = (t: number) => 1 - Math.pow(1 - clamp(t), 4);
    const ease3 = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
    const T_CONTENT_END = 0.85, T_HOLD_END = 0.92;
    let lastCharCount = 0;

    const refreshId = setTimeout(() => {
      ScrollTrigger.refresh();
      ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "+=5500",
        pin: true,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const p = self.progress;

          // ── Phase 1: image + ring fade in ──────────────────────────────
          if (p <= 0.08) {
            const t = p / 0.08;
            const eImg = ease3(t);
            imgPanel.style.transform = `scale(${1.14 - eImg * 0.14})`;
            imgPanel.style.opacity   = String(clamp(eImg * 1.3));
            imgPanel.style.filter    = `blur(${((1 - eImg) * 22).toFixed(1)}px)`;
            textPanel.style.opacity  = "0";
            if (ringWrap) {
              ringWrap.style.opacity   = String(clamp(eImg * 1.2));
              ringWrap.style.transform = `translate(-50%,-50%) scale(${0.80 + eImg * 0.20})`;
              ringWrap.style.filter    = `blur(${((1 - eImg) * 16).toFixed(1)}px)`;
            }
            if (pulse) {
              const pe = ease3(clamp(t * 1.5));
              pulse.style.opacity   = String(pe * 0.85);
              pulse.style.transform = `translate(-50%,-50%) scale(${0.5 + pe * 0.5})`;
            }
            if (bgGlow) bgGlow.style.opacity = String(ease3(t));
          }

          // ── Phase 2: hold + text reveal ────────────────────────────────
          if (p > 0.08 && p < T_HOLD_END) {
            imgPanel.style.transform = "scale(1)";
            imgPanel.style.opacity   = "1";
            imgPanel.style.filter    = "blur(0px)";
            if (ringWrap) {
              ringWrap.style.opacity   = "1";
              ringWrap.style.transform = "translate(-50%,-50%) scale(1)";
              ringWrap.style.filter    = "blur(0px)";
            }
            if (pulse)  { pulse.style.opacity = "0.85"; pulse.style.transform = "translate(-50%,-50%) scale(1)"; }
            if (bgGlow) bgGlow.style.opacity = "1";

            const txtP = clamp((p - 0.08) / 0.12);
            const eT   = ease3(txtP);
            textPanel.style.opacity   = String(eT);
            textPanel.style.transform = `translateY(${(1 - eT) * 72}px)`;
            textPanel.style.filter    = `blur(${((1 - eT) * 10).toFixed(1)}px)`;

            const cP   = clamp((p - 0.08) / (T_CONTENT_END - 0.08));
            const eyeT = ease3(clamp(cP / 0.22));
            eyebrow.style.opacity   = String(eyeT);
            eyebrow.style.transform = `translateY(${(1 - eyeT) * 18}px)`;

            const ttT = ease3(clamp((cP - 0.22) / 0.28));
            title.style.opacity   = String(ttT);
            title.style.transform = `translateY(${(1 - ttT) * 40}px)`;

            const pType = clamp((cP - 0.50) / 0.28);
            if (pType > 0) {
              desc.style.opacity = "1";
              const charCount = Math.floor(pType * SPEC_TEXT.length);
              if (charCount !== lastCharCount) {
                lastCharCount = charCount;
                const showing = SPEC_TEXT.slice(0, charCount);
                desc.textContent = charCount < SPEC_TEXT.length ? showing + "\u2587" : showing;
              }
            } else {
              desc.style.opacity = "0";
              if (lastCharCount !== 0) { desc.textContent = ""; lastCharCount = 0; }
            }

            const swT = ease3(clamp((cP - 0.78) / 0.10));
            swatchRow.style.opacity   = String(swT);
            swatchRow.style.transform = `translateY(${(1 - swT) * 20}px)`;

            const ctT = ease3(clamp((cP - 0.85) / 0.10));
            ctaRow.style.opacity   = String(ctT);
            ctaRow.style.transform = `translateY(${(1 - ctT) * 20}px)`;

            if (darkExit) darkExit.style.opacity = "0";
          }

          // ── Phase 3: exit ──────────────────────────────────────────────
          if (p >= T_HOLD_END) {
            const pOut = ease4(clamp((p - T_HOLD_END) / (1 - T_HOLD_END)));
            textPanel.style.transform = `translateY(${-pOut * 48}px)`;
            textPanel.style.opacity   = String(clamp(1 - pOut * 1.5));
            textPanel.style.filter    = `blur(${(pOut * 10).toFixed(1)}px)`;
            imgPanel.style.transform  = `scale(${1 - pOut * 0.10})`;
            imgPanel.style.opacity    = String(clamp(1 - pOut * 1.4));
            imgPanel.style.filter     = `blur(${(pOut * 18).toFixed(1)}px)`;
            if (darkExit) darkExit.style.opacity = String(ease4(clamp((p - T_HOLD_END) / (1 - T_HOLD_END))));
          } else {
            if (darkExit) darkExit.style.opacity = "0";
          }
        },
      });
    }, ST_INIT_MS);

    return () => {
      clearTimeout(refreshId);
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === wrap)
        .forEach((st) => st.kill());
    };
  }, [isProductSectionInView]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "rgb(6,4,2)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background glow */}
      <div
        ref={bgGlowRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(ellipse 70% 55% at 65% 50%, ${currentColor.glow} 0%, transparent 68%)`,
          transition: "background 0.8s ease, opacity 0.6s ease",
          opacity: 0,
          willChange: "opacity",
        }}
      />

      {/* Dark exit overlay */}
      <div
        ref={darkExitRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          pointerEvents: "none",
          opacity: 0,
          willChange: "opacity",
          background: "rgb(0,0,0)",
        }}
      />

      {/* Two-column grid */}
      <div className="product-grid">

        {/* ── TEXT PANEL ── */}
        <div
          ref={textPanelRef}
          style={{
            display: "flex",
            flexDirection: "column",
            opacity: 0,
            transform: "translateY(72px)",
            filter: "blur(10px)",
            willChange: "opacity, transform, filter",
          }}
        >
          <p
            ref={eyebrowRef}
            style={{
              margin: "0 0 12px",
              fontFamily: "'Orbitron', monospace",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#FF6B35",
              opacity: 0,
              transform: "translateY(18px)",
              willChange: "opacity, transform",
            }}
          >
            New · 2025
          </p>

          <h2
            ref={titleRef}
            style={{
              margin: "0 0 22px",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "clamp(30px,3.8vw,60px)",
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 0.94,
              color: "#fff",
              opacity: 0,
              transform: "translateY(40px)",
              willChange: "opacity, transform",
            }}
          >
            iPhone 17 Pro.
            <br />
            <span
              style={{
                color: currentColor.hex,
                transition: "color 0.65s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              {currentColor.name}.
            </span>
          </h2>

          <p
            ref={descRef}
            style={{
              margin: "0 0 28px",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "clamp(13px,0.95vw,15px)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.58)",
              lineHeight: 1.7,
              maxWidth: "460px",
              minHeight: "6.5em",
              letterSpacing: "0.01em",
              opacity: 0,
              willChange: "opacity",
            }}
          />

          {/* Colour swatches */}
          <div
            ref={swatchRowRef}
            style={{
              marginBottom: "18px",
              opacity: 0,
              transform: "translateY(20px)",
              willChange: "opacity, transform",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)",
              }}
            >
              Finish — <span>{currentColor.name}</span>
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              {IPHONE_COLORS.map((c, i) => (
                <button
                  key={i}
                  className="color-swatch"
                  onClick={() => setActiveColor(i)}
                  aria-label={c.name}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: c.hex,
                    border: activeColor === i ? `2.5px solid ${c.hex}` : "2.5px solid transparent",
                    outline: activeColor === i ? "2px solid rgba(255,255,255,0.6)" : "2px solid rgba(255,255,255,0.12)",
                    outlineOffset: "2px",
                    cursor: "pointer",
                    padding: 0,
                    transform: activeColor === i ? "scale(1.22)" : "scale(1)",
                    boxShadow: activeColor === i ? `0 0 16px 4px ${c.glow}` : "none",
                    transition: "transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease, outline 0.2s ease",
                  }}
                />
              ))}
            </div>
          </div>

          {/* CTA row */}
          <div
            ref={ctaRowRef}
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              opacity: 0,
              transform: "translateY(20px)",
              willChange: "opacity, transform",
            }}
          >
            <a
              href="#"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#000",
                textDecoration: "none",
                background: "#fff",
                borderRadius: "999px",
                padding: "13px 28px",
              }}
            >
              Buy from $999
            </a>
            <a
              href="#"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "15px",
                fontWeight: 500,
                color: "#fff",
                textDecoration: "none",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: "999px",
                padding: "13px 28px",
              }}
            >
              Learn more →
            </a>
          </div>
        </div>

        {/* ── IMAGE PANEL ── */}
        <div
          ref={imgPanelRef}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "clamp(320px,46vh,560px)",
            opacity: 0,
            transform: "scale(1.14)",
            filter: "blur(22px)",
            willChange: "opacity, transform, filter",
            overflow: "hidden",
          }}
        >
          {/* Orbit ring */}
          <div
            ref={ringWrapRef}
            style={{
              position: "absolute",
              width: "clamp(320px,46vh,540px)",
              height: "clamp(320px,46vh,540px)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%) scale(0.80)",
              opacity: 0,
              filter: "blur(16px)",
              willChange: "opacity, transform, filter",
            }}
          >
            <svg
              viewBox="0 0 700 700"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}
            >
              <defs>
                <path
                  id="ring-text-path"
                  d={`M ${RING_CX},${RING_CY - RING_R} a ${RING_R},${RING_R} 0 1,1 -0.01,0`}
                />
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor={currentColor.hex} stopOpacity="1" />
                  <stop offset="45%"  stopColor={currentColor.hex} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={currentColor.hex} stopOpacity="0.88" />
                </linearGradient>
                <filter id="ring-glow">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <circle
                cx={RING_CX} cy={RING_CY} r={RING_R}
                fill="none" stroke="url(#ring-grad)" strokeWidth="110"
                filter="url(#ring-glow)"
                style={{ transition: "stroke 0.7s ease" }}
              />
              <circle cx={RING_CX} cy={RING_CY} r={RING_R - 55} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
              <circle cx={RING_CX} cy={RING_CY} r={RING_R + 55} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

              <g
                style={{
                  animation: "orbit-ring 18s linear infinite",
                  transformOrigin: `${RING_CX}px ${RING_CY}px`,
                } as React.CSSProperties}
              >
                <text
                  fontFamily="'Orbitron',monospace"
                  fontSize="46"
                  fontWeight="900"
                  letterSpacing="2"
                  fill="rgba(255,255,255,0.92)"
                  dominantBaseline="middle"
                  textAnchor="start"
                >
                  <textPath href="#ring-text-path" startOffset="0%">
                    {Array(4).fill(RING_TEXT).join("")}
                  </textPath>
                </text>
              </g>

              <text x={RING_CX} y={RING_CY - 40} textAnchor="middle" fontFamily="'Orbitron',monospace" fontSize="12" fontWeight="700" letterSpacing="5" fill="rgba(255,255,255,0.28)">APPLE</text>
              <text x={RING_CX} y={RING_CY - 4}  textAnchor="middle" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif" fontSize="36" fontWeight="800" letterSpacing="-1" fill="#fff">A19 Pro</text>
              <text
                x={RING_CX} y={RING_CY + 30} textAnchor="middle"
                fontFamily="'Orbitron',monospace" fontSize="10" fontWeight="600" letterSpacing="3.5"
                fill={currentColor.hex}
                style={{ transition: "fill 0.65s cubic-bezier(0.4,0,0.2,1)" }}
              >
                3NM SILICON
              </text>
            </svg>
          </div>

          {/* Pulse glow */}
          <div
            ref={pulseRef}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%) scale(0.5)",
              opacity: 0,
              width: "clamp(140px,18vh,200px)",
              height: "clamp(140px,18vh,200px)",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${currentColor.hex}40 0%, transparent 70%)`,
              animation: "pulse-glow 3.5s ease-in-out infinite",
              transition: "background 0.65s cubic-bezier(0.4,0,0.2,1)",
              pointerEvents: "none",
              willChange: "opacity, transform",
            }}
          />

          {/* Phone image */}
          <div
            style={{
              position: "relative",
              width: "clamp(140px,18vh,220px)",
              aspectRatio: "9/19.5",
              zIndex: 10,
            }}
          >
            {isTransitioning && prevColor !== null && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  animation: "phone-exit-right 0.7s cubic-bezier(0.4,0,0.2,1) forwards",
                }}
              >
                <img
                  src={IPHONE_COLORS[prevColor].image}
                  alt={IPHONE_COLORS[prevColor].name}
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", userSelect: "none" }}
                />
              </div>
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                animation: isTransitioning
                  ? "phone-enter-left 0.7s cubic-bezier(0.4,0,0.2,1) forwards"
                  : "float-phone-straight 5s ease-in-out infinite",
              }}
            >
              <img
                src={IPHONE_COLORS[isTransitioning ? activeColor : displayColor].image}
                alt={IPHONE_COLORS[isTransitioning ? activeColor : displayColor].name}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", userSelect: "none" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
