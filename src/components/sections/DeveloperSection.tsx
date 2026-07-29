"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { DEV_PLACEHOLDERS, ST_INIT_MS } from "@/constants";
import DevCard from "@/components/DevCard";

gsap.registerPlugin(ScrollTrigger);

const CARD_H     = 220;
const CARD_GAP   = 12;
const COLS       = 2;
const VISIBLE_H  = 548;
const MAX_PX_PER_MS = 0.32;

interface DeveloperSectionProps {
  isInView: boolean;
}

export default function DeveloperSection({ isInView }: DeveloperSectionProps) {
  const wrapRef       = useRef<HTMLDivElement>(null);
  const garageDoorRef = useRef<HTMLDivElement>(null);
  const leftPanelRef  = useRef<HTMLDivElement>(null);
  const eyebrowRef    = useRef<HTMLParagraphElement>(null);
  const headingRef    = useRef<HTMLHeadingElement>(null);
  const descRef       = useRef<HTMLParagraphElement>(null);
  const ctaRef        = useRef<HTMLDivElement>(null);
  const cardsWrapRef  = useRef<HTMLDivElement>(null);
  const whiteExitRef  = useRef<HTMLDivElement>(null);
  const lastScrollRef = useRef({ p: 0, t: 0, scrolled: 0 });

  useEffect(() => {
    if (!isInView) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const garageDoor = garageDoorRef.current!;
    const leftPanel  = leftPanelRef.current!;
    const eyebrow    = eyebrowRef.current!;
    const heading    = headingRef.current!;
    const desc       = descRef.current!;
    const cta        = ctaRef.current!;
    const cardsWrap  = cardsWrapRef.current!;

    garageDoor.style.transform = "translateY(-100%)";
    leftPanel.style.opacity    = "0";
    leftPanel.style.transform  = "translateX(-40px)";
    leftPanel.style.filter     = "blur(10px)";
    eyebrow.style.opacity      = "0";
    heading.style.opacity      = "0";
    desc.style.opacity         = "0";
    cta.style.opacity          = "0";
    cardsWrap.style.opacity    = "0";

    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    const ease3 = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
    const ease4 = (t: number) => 1 - Math.pow(1 - clamp(t), 4);
    const norm  = (p: number, s: number, e: number) => clamp((p - s) / (e - s));

    const DOOR_IN_END = 0.12, LEFT_IN_END = 0.26;
    const CARDS_START = 0.22, CARDS_END   = 1.00;

    const totalRows  = Math.ceil(DEV_PLACEHOLDERS.length / COLS);
    const totalGridH = totalRows * CARD_H + (totalRows - 1) * CARD_GAP + 52;
    const maxScroll  = Math.max(0, totalGridH - VISIBLE_H);

    const refreshId = setTimeout(() => {
      ScrollTrigger.refresh();
      ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "+=6000",
        pin: true,
        pinSpacing: true,
        scrub: 1.4,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const p   = self.progress;
          const now = performance.now();

          // ── Garage door ────────────────────────────────────────────────
          const doorT    = ease4(norm(p, 0, DOOR_IN_END));
          const doorOutT = ease4(norm(p, 0.88, 0.98));
          garageDoor.style.transform =
            p >= 0.88
              ? `translateY(${-doorOutT * 100}%)`
              : `translateY(${-100 + doorT * 100}%)`;

          // ── Fade content before garage closes ──────────────────────────
          if (p >= 0.78 && p < 0.88) {
            const fadeOut = ease4(norm(p, 0.78, 0.88));
            leftPanel.style.opacity   = String(1 - fadeOut);
            leftPanel.style.transform = `translateX(${ -fadeOut * 40 }px)`;
            leftPanel.style.filter    = `blur(${(fadeOut * 10).toFixed(1)}px)`;
            cardsWrap.style.opacity   = String(1 - fadeOut);
            cardsWrap.style.transform = `translateY(-${lastScrollRef.current.scrolled}px) translateX(${fadeOut * 40}px)`;
          } else if (p >= 0.88) {
            leftPanel.style.opacity = "0";
            cardsWrap.style.opacity = "0";
          }

          // ── Left panel stagger ─────────────────────────────────────────
          if (p < DOOR_IN_END * 0.6) {
            leftPanel.style.opacity   = "0";
            leftPanel.style.transform = "translateX(-40px)";
            leftPanel.style.filter    = "blur(10px)";
            eyebrow.style.opacity = "0"; eyebrow.style.transform = "translateY(16px)";
            heading.style.opacity = "0"; heading.style.transform = "translateY(32px)";
            desc.style.opacity    = "0"; desc.style.transform    = "translateY(20px)";
            cta.style.opacity     = "0"; cta.style.transform     = "translateY(16px)";
          } else {
            const lT = ease3(norm(p, DOOR_IN_END * 0.6, LEFT_IN_END));
            leftPanel.style.opacity   = String(lT);
            leftPanel.style.transform = `translateX(${(1 - lT) * -40}px)`;
            leftPanel.style.filter    = `blur(${((1 - lT) * 10).toFixed(1)}px)`;

            const eyeT = ease3(norm(p, DOOR_IN_END * 0.7,  LEFT_IN_END * 0.6));
            eyebrow.style.opacity   = String(eyeT);
            eyebrow.style.transform = `translateY(${(1 - eyeT) * 16}px)`;

            const hdT = ease3(norm(p, DOOR_IN_END * 0.8,  LEFT_IN_END * 0.75));
            heading.style.opacity   = String(hdT);
            heading.style.transform = `translateY(${(1 - hdT) * 32}px)`;

            const dT = ease3(norm(p, DOOR_IN_END * 0.9,  LEFT_IN_END * 0.9));
            desc.style.opacity   = String(dT);
            desc.style.transform = `translateY(${(1 - dT) * 20}px)`;

            const ctT = ease3(norm(p, LEFT_IN_END * 0.85, LEFT_IN_END));
            cta.style.opacity   = String(ctT);
            cta.style.transform = `translateY(${(1 - ctT) * 16}px)`;
          }

          // ── Cards scroll ───────────────────────────────────────────────
          if (p >= CARDS_START) {
            cardsWrap.style.opacity = "1";
            const target   = ease3(norm(p, CARDS_START, CARDS_END)) * maxScroll;
            const dt       = Math.max(now - lastScrollRef.current.t, 1);
            const maxDelta = MAX_PX_PER_MS * dt;
            const prev     = lastScrollRef.current.scrolled;
            const diff     = target - prev;
            const capped   = Math.abs(diff) > maxDelta ? prev + Math.sign(diff) * maxDelta : target;
            lastScrollRef.current = { p, t: now, scrolled: capped };
            cardsWrap.style.transform = `translateY(${-capped}px)`;
          } else {
            lastScrollRef.current = { p: 0, t: now, scrolled: 0 };
            cardsWrap.style.opacity   = "0";
            cardsWrap.style.transform = "translateY(0px)";
          }

          // ── White exit overlay ─────────────────────────────────────────
          if (whiteExitRef.current) {
            whiteExitRef.current.style.opacity = String(ease4(norm(p, 0.92, 1.00)));
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
  }, [isInView]);

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
      {/* White exit overlay */}
      <div
        ref={whiteExitRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          pointerEvents: "none",
          opacity: 0,
          willChange: "opacity",
          background: "#000000",
        }}
      />

      {/* Garage door */}
      <div
        ref={garageDoorRef}
        style={{
          position: "absolute",
          inset: 0,
          transform: "translateY(-100%)",
          willChange: "transform",
          zIndex: 2,
          background:
            "linear-gradient(170deg, #FF6B35 0%, #e8521c 55%, #c43d0f 100%)",
          backgroundImage:
            "linear-gradient(170deg, #FF6B35 0%, #e8521c 55%, #c43d0f 100%), repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(0,0,0,0.06) 38px, rgba(0,0,0,0.06) 40px)",
          backgroundBlendMode: "multiply",
        }}
      />

      {/* Two-column layout */}
      <div className="dev-grid">

        {/* ── LEFT PANEL ── */}
        <div
          ref={leftPanelRef}
          style={{
            display: "flex",
            flexDirection: "column",
            opacity: 0,
            transform: "translateX(-40px)",
            filter: "blur(10px)",
            willChange: "opacity, transform, filter",
          }}
        >
          <p
            ref={eyebrowRef}
            style={{
              margin: "0 0 14px",
              fontFamily: "'Orbitron', monospace",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#FF6B35",
              opacity: 0,
              transform: "translateY(16px)",
            }}
          >
            For Developers
          </p>

          <h2
            ref={headingRef}
            style={{
              margin: "0 0 20px",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "clamp(32px,4.2vw,64px)",
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 0.96,
              color: "#fff",
              opacity: 0,
              transform: "translateY(32px)",
            }}
          >
            The most<br />powerful<br />
            <span style={{ color: "#FF6B35" }}>platform.</span>
          </h2>

          <p
            ref={descRef}
            style={{
              margin: "0 0 32px",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "clamp(13px,0.95vw,15px)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.75,
              maxWidth: "400px",
              letterSpacing: "0.01em",
              opacity: 0,
              transform: "translateY(20px)",
            }}
          >
            Access breakthrough APIs built directly into iPhone 17 Pro hardware.
            From on-device AI to spatial computing — every tool you need is here.
          </p>

          <div
            ref={ctaRef}
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              opacity: 0,
              transform: "translateY(16px)",
            }}
          >
            <a
              href="#"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#000",
                textDecoration: "none",
                background: "#fff",
                borderRadius: "999px",
                padding: "11px 24px",
              }}
            >
              Start building
            </a>
            <a
              href="#"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "#fff",
                textDecoration: "none",
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "999px",
                padding: "11px 24px",
              }}
            >
              View docs →
            </a>
          </div>
        </div>

        {/* ── CARDS ── */}
        <div style={{ position: "relative", height: `${VISIBLE_H}px`, overflow: "hidden" }}>
          <div
            ref={cardsWrapRef}
            className="dev-cards-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: `${CARD_GAP}px`,
              opacity: 0,
              willChange: "transform",
              paddingBottom: "52px",
            }}
          >
            {DEV_PLACEHOLDERS.map((item) => (
              <DevCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
