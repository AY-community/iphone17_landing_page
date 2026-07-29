"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TAPE_DISPLAY, SNAKE, ST_INIT_MS } from "@/constants";

gsap.registerPlugin(ScrollTrigger);

interface TapeSectionProps {
  /** Repeated tape string for the looping marquee phase */
  tapeContent: string;
}

export default function TapeSection({ tapeContent }: TapeSectionProps) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const bandRef   = useRef<HTMLDivElement>(null);
  const darkRef   = useRef<HTMLDivElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);
  const marqRef   = useRef<HTMLDivElement>(null);
  const textElRef = useRef<SVGTextElement>(null);
  const spanEls   = useRef<SVGTSpanElement[]>([]);
  const chars     = TAPE_DISPLAY.split("");

  useEffect(() => {
    const band   = bandRef.current!;
    const dark   = darkRef.current!;
    const marq   = marqRef.current!;
    const textEl = textElRef.current!;
    const spans  = spanEls.current;

    // Initial states
    band.style.clipPath = "inset(0 100% 0 0)";
    dark.style.opacity  = "0";
    marq.style.opacity  = "0";
    spans.forEach((s) => { s.style.opacity = "0"; });
    const tp = textEl.querySelector("textPath")!;
    tp.setAttribute("startOffset", "110%");

    const easeOut = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
    const norm    = (p: number, a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
    const P3S = 0.62, P3E = 1.00;

    if (svgRef.current) svgRef.current.style.opacity = "1";
    const stRef = { current: null as ScrollTrigger | null };

    const refreshId = setTimeout(() => {
      ScrollTrigger.refresh();
      stRef.current = ScrollTrigger.create({
        trigger: wrapRef.current!,
        start: "top top",
        end: "+=3200",
        pin: true,
        pinSpacing: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const p = self.progress;

          // Phase 1 — band sweeps in
          band.style.clipPath = `inset(0 ${(
            (1 - easeOut(norm(p, 0, 0.35))) * 100
          ).toFixed(2)}% 0 0)`;

          // Phase 2 — dark overlay fades in
          dark.style.opacity = String(easeOut(norm(p, 0.35, P3S)));

          if (p < P3S) {
            tp.setAttribute("startOffset", "110%");
            spans.forEach((s) => { s.style.opacity = "0"; });
            marq.style.opacity = "0";
          } else {
            const phaseP = norm(p, P3S, P3E);

            // Text path crawls in
            tp.setAttribute(
              "startOffset",
              `${(110 * (1 - easeOut(Math.min(phaseP * 1.6, 1)))).toFixed(2)}%`
            );

            // Individual chars reveal
            const total = spans.length;
            for (let i = 0; i < total; i++) {
              spans[i].style.opacity = String(
                Math.min(easeOut(norm(phaseP, i / total, (i + 1) / total)) * 1.8, 1)
              );
            }

            // Swap to marquee at end
            const swapT = norm(p, P3S + (P3E - P3S) * 0.94, P3E);
            marq.style.opacity = String(easeOut(swapT));
            textEl.style.opacity =
              swapT > 0.01 ? String(Math.max(0, 1 - swapT * 4)) : "1";
          }
        },
      });
    }, ST_INIT_MS);

    return () => {
      clearTimeout(refreshId);
      stRef.current?.kill();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "rgb(0,0,0)",
        overflow: "hidden",
      }}
    >
      {/* ── Band sweep layer ── */}
      <div
        ref={bandRef}
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "inset(0 100% 0 0)",
          willChange: "clip-path",
          pointerEvents: "none",
        }}
      >
        <svg
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
        >
          <defs>
            <path id="tp-band" d={SNAKE} />
          </defs>
          <use href="#tp-band" fill="none" stroke="#FF6B35" strokeWidth="340" />
          <use href="#tp-band" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="340" />
          <use
            href="#tp-band"
            fill="none"
            stroke="rgba(0,0,0,0.10)"
            strokeWidth="265"
            strokeDasharray="2200"
            strokeDashoffset="-700"
          />
        </svg>
      </div>

      {/* ── Dark overlay ── */}
      <div
        ref={darkRef}
        style={{ position: "absolute", inset: 0, opacity: 0, willChange: "opacity", pointerEvents: "none" }}
      >
        <svg
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
        >
          <defs>
            <path id="tp-dark" d={SNAKE} />
          </defs>
          <use href="#tp-dark" fill="none" stroke="rgb(0,0,0)" strokeWidth="272" />
        </svg>
      </div>

      {/* ── Text path ── */}
      <svg
        ref={svgRef}
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
          opacity: 1,
        }}
      >
        <defs>
          <path id="tp-text" d={SNAKE} />
        </defs>
        <text
          ref={textElRef}
          fontFamily="'Orbitron', monospace"
          fontSize="210"
          fontWeight="900"
          fill="rgba(255,255,255,0.92)"
          dominantBaseline="middle"
        >
          <textPath href="#tp-text" startOffset="110%">
            {chars.map((ch, i) => (
              <tspan
                key={i}
                ref={(el) => { if (el) spanEls.current[i] = el; }}
                style={{ opacity: 0 }}
              >
                {ch === " " ? "\u00A0" : ch}
              </tspan>
            ))}
          </textPath>
        </text>
      </svg>

      {/* ── Marquee (final phase) ── */}
      <div
        ref={marqRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          willChange: "opacity",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
        >
          <defs>
            <path id="tp-marq" d={SNAKE} />
          </defs>
          <text
            fontFamily="'Orbitron', monospace"
            fontSize="210"
            fontWeight="900"
            fill="rgba(255,255,255,0.92)"
            dominantBaseline="middle"
          >
            <textPath href="#tp-marq" startOffset="0%">
              <animate
                attributeName="startOffset"
                from="0%"
                to="-100%"
                dur="42s"
                repeatCount="indefinite"
              />
              {tapeContent}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}
