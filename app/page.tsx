"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./globals.css";

import {
  FRAME_COUNT,
  SCROLL_PX,
  CONCURRENCY,
  CANVAS_DONE,
  ST_INIT_MS,
  getFrameSrc,
  NAV_ITEMS,
  linkStyle,
  SQUARE_SHADOW,
  TAPE_WORDS,
  IPHONE_COLORS,
} from "@/constants";
import { RS, LoadState } from "@/types";

import TapeSection       from "@/components/sections/TapeSection";
import ProductSection    from "@/components/sections/ProductSection";
import DeveloperSection  from "@/components/sections/DeveloperSection";
import GooeyFooter       from "@/components/sections/GooeyFooter";

gsap.registerPlugin(ScrollTrigger);

// ─── Char-split helper ────────────────────────────────────────────────────────
function splitLine(text: string, extraStyle?: React.CSSProperties) {
  return text.split("").map((ch, i) => (
    <span
      key={i}
      data-ch
      style={{
        display: "inline-block",
        opacity: 0,
        transform: "translateY(14px)",
        ...(extraStyle ?? {}),
      }}
    >
      {ch === " " ? "\u00A0" : ch}
    </span>
  ));
}
// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  // Canvas / scroll refs
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const sectionRef     = useRef<HTMLDivElement>(null);
  const wrapperRef     = useRef<HTMLDivElement>(null);
  const phoneHeadRef   = useRef<HTMLDivElement>(null);
  const bottomTextRef  = useRef<HTMLDivElement>(null);
  const headerRef      = useRef<HTMLElement>(null);
  const bottomLeftRef  = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);
  const phoneCharsRef  = useRef<HTMLElement[]>([]);
  const bottomCharsRef = useRef<HTMLElement[]>([]);
  const rect1Ref       = useRef<HTMLDivElement>(null);
  const rect2Ref       = useRef<HTMLDivElement>(null);
  const bgRef          = useRef<HTMLDivElement>(null);
  const centerTextRef  = useRef<HTMLDivElement>(null);
  const leftWordRef    = useRef<HTMLDivElement>(null);
  const rightWordRef   = useRef<HTMLDivElement>(null);
  const glowRef        = useRef<HTMLDivElement>(null);

  // Section visibility refs
  const productSectionWrapperRef = useRef<HTMLDivElement>(null);
  const devSectionWrapperRef     = useRef<HTMLDivElement>(null);

  // Frame data
  const frames      = useRef<(ImageBitmap | null)[]>(Array(FRAME_COUNT).fill(null));
  const rs          = useRef<RS>({ rw: 0, rh: 0, ox: 0, oy: 0, idx: -1 });
  const progressRef = useRef(0);
  const rafId       = useRef(0);
  const scrolledRef = useRef(false);

  const [state, setState]             = useState<LoadState>("idle");
  const [shown, setShown]             = useState(false);
  const [activeColor, setActiveColor] = useState(0);
  const [isProductSectionInView, setIsProductSectionInView] = useState(false);
  const [isDevSectionInView, setIsDevSectionInView]         = useState(false);
  const [sectionsReady, setSectionsReady] = useState(false);

  // ── Intersection observers for lazy section init ──────────────────────────
  useEffect(() => {
    if (!sectionsReady) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsProductSectionInView(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (productSectionWrapperRef.current) observer.observe(productSectionWrapperRef.current);
    return () => observer.disconnect();
  }, [sectionsReady]);

  useEffect(() => {
    if (!sectionsReady) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsDevSectionInView(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (devSectionWrapperRef.current) observer.observe(devSectionWrapperRef.current);
    return () => observer.disconnect();
  }, [sectionsReady]);

  // ── Show hero text once ready ─────────────────────────────────────────────
  useEffect(() => {
    if (state === "ready") {
      const t = setTimeout(() => setShown(true), 80);
      return () => clearTimeout(t);
    }
  }, [state]);

  // ── Frame loading ─────────────────────────────────────────────────────────
  useEffect(() => {
    let loaded = 0;
    let experienceStarted = false;
    const startExperience = () => {
      if (experienceStarted) return;
      experienceStarted = true;
      setState("complete");
    };

    // Do not block the launch sequence on every animation frame. The hero can
    // render as soon as its first frame is available; the rest load in the background.
    const loadOne = async (i: number) => {
      try {
        const blob = await (await fetch(getFrameSrc(i))).blob();
        frames.current[i] = await createImageBitmap(blob);
        if (i === 0) startExperience();
      } catch {}
      ++loaded;
    };
    const queue = Array.from({ length: FRAME_COUNT }, (_, i) => i);
    let active = 0;
    const pump = () => {
      while (active < CONCURRENCY && queue.length) {
        active++;
        loadOne(queue.shift()!).then(() => { active--; pump(); });
      }
    };
    pump();

    // A slow or interrupted image request must never leave visitors on the loader.
    const loaderTimeout = setTimeout(startExperience, 6000);
    return () => clearTimeout(loaderTimeout);
  }, []);

  // ── Loading-screen state machine ──────────────────────────────────────────
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (state === "complete") t = setTimeout(() => setState("expand"), 580);
    if (state === "expand")   t = setTimeout(() => setState("hollow"), 500);
    if (state === "hollow")   t = setTimeout(() => setState("ready"),  600);
    return () => clearTimeout(t);
  }, [state]);

  // ── Canvas recalc ─────────────────────────────────────────────────────────
  const recalc = () => {
    const canvas = canvasRef.current;
    const ref    = frames.current.find(Boolean) as ImageBitmap | undefined;
    if (!canvas || !ref) return;
    const sw = window.innerWidth, sh = window.innerHeight;
    canvas.width  = sw;
    canvas.height = sh;
    const s = Math.max(sw / ref.width, sh / ref.height);
    rs.current = {
      rw: ref.width  * s,
      rh: ref.height * s,
      ox: (sw - ref.width  * s) / 2,
      oy: (sh - ref.height * s) / 2,
      idx: -1,
    };
  };

  // ── Main ScrollTrigger + RAF ──────────────────────────────────────────────
  useEffect(() => {
    if (state !== "hollow" && state !== "ready") return;

    const canvas  = canvasRef.current!;
    const section = sectionRef.current!;
    const ctx     = canvas.getContext("2d", { alpha: false })!;
    recalc();

    const onResize = () => recalc();
    window.addEventListener("resize", onResize, { passive: true });

    if (phoneHeadRef.current)
      phoneCharsRef.current  = Array.from(phoneHeadRef.current.querySelectorAll("[data-ch]")) as HTMLElement[];
    if (bottomTextRef.current)
      bottomCharsRef.current = Array.from(bottomTextRef.current.querySelectorAll("[data-ch]")) as HTMLElement[];

    // RAF — only redraws when frame index changes
    const render = () => {
      if (!document.hidden) {
        const p      = progressRef.current;
        const cp     = Math.min(p / CANVAS_DONE, 1.0);
        const target = Math.min(Math.floor(cp * (FRAME_COUNT - 1)), FRAME_COUNT - 1);
        const bm     = frames.current[target];
        if (bm && target !== rs.current.idx) {
          rs.current.idx = target;
          const { ox, oy, rw, rh } = rs.current;
          ctx.drawImage(bm, ox, oy, rw, rh);
        }
      }
      rafId.current = requestAnimationFrame(render);
    };
    rafId.current = requestAnimationFrame(render);

    // ── Progress landmarks (normalised 0-1) ────────────────────────────────
    const C = CANVAS_DONE, F = FRAME_COUNT - 1, sc = C / F;
    const frames_inStart      = 10  * sc, frames_inEnd      = 30  * sc;
    const frames_outStart     = 112 * sc, frames_outEnd     = 132 * sc;
    const frames_wInS         = 212 * sc, frames_wInE       = 232 * sc;
    const frames_wOutS        = 265 * sc, frames_wOutE      = 280 * sc;
    const frames_shrinkS      = C + 0.02, frames_shrinkE    = C + 0.05;
    const frames_textTopS     = C + 0.06, frames_textTopE   = C + 0.10;
    const frames_textTopOutS  = C + 0.11, frames_textTopOutE = C + 0.13;
    const frames_moveUpS      = C + 0.14, frames_moveUpE    = C + 0.17;
    const frames_btextS       = C + 0.17, frames_btextE     = C + 0.21;
    const frames_rectS        = C + 0.21, frames_rectE      = C + 0.235;
    const frames_bgS          = C + 0.235;

    const easeOut3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
    const norm     = (p: number, s: number, e: number) => Math.max(0, Math.min(1, (p - s) / (e - s)));

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${SCROLL_PX}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const p = self.progress;
        progressRef.current = p;

        // ── Header hide / show ─────────────────────────────────────────
        const nowScrolled = p > frames_inStart;
        if (nowScrolled !== scrolledRef.current) {
          scrolledRef.current = nowScrolled;
          if (headerRef.current) {
            headerRef.current.style.opacity       = nowScrolled ? "0" : "1";
            headerRef.current.style.transform     = nowScrolled ? "translateY(-24px)" : "translateY(0)";
            headerRef.current.style.pointerEvents = nowScrolled ? "none" : "auto";
          }
        }
        if (bottomLeftRef.current) {
          bottomLeftRef.current.style.opacity   = nowScrolled ? "0" : "1";
          bottomLeftRef.current.style.transform = nowScrolled ? "translate(60px,20px) scale(0.96)" : "translate(0,0) scale(1)";
        }
        if (bottomRightRef.current) {
          bottomRightRef.current.style.opacity   = nowScrolled ? "0" : "1";
          bottomRightRef.current.style.transform = nowScrolled ? "translate(-60px,16px)" : "translate(0,0)";
        }

        // ── Centre text ────────────────────────────────────────────────
        if (centerTextRef.current) {
          let o = 0, ty = 0, sc2 = 1, bl = 0;
          if (p < frames_inStart) {
            o = 0;
          } else if (p <= frames_inEnd) {
            const e = easeOut3(norm(p, frames_inStart, frames_inEnd));
            o = e; ty = (1 - e) * 40; sc2 = 0.88 + e * 0.12; bl = (1 - e) * 12;
          } else if (p < frames_outStart) {
            o = 1;
          } else if (p <= frames_outEnd) {
            const e = easeOut3(norm(p, frames_outStart, frames_outEnd));
            o = 1 - e; ty = -e * 50; sc2 = 1 + e * 0.08; bl = e * 14;
          }
          centerTextRef.current.style.opacity   = String(o);
          centerTextRef.current.style.transform = `translateY(${ty}px) scale(${sc2})`;
          centerTextRef.current.style.filter    = o > 0.01 ? `blur(${bl.toFixed(1)}px)` : "none";
        }

        // ── Side words ─────────────────────────────────────────────────
        const animWord = (el: HTMLDivElement | null, fromX: number) => {
          if (!el) return;
          let wo = 0, wx = fromX, wsc = 0.92, wbl = 10;
          if (p >= frames_wInS && p <= frames_wInE) {
            const e = easeOut3(norm(p, frames_wInS, frames_wInE));
            wo = e; wx = fromX * (1 - e); wsc = 0.92 + e * 0.08; wbl = (1 - e) * 10;
          } else if (p > frames_wInE && p < frames_wOutS) {
            wo = 1; wx = 0; wsc = 1; wbl = 0;
          } else if (p >= frames_wOutS && p <= frames_wOutE) {
            const e = easeOut3(norm(p, frames_wOutS, frames_wOutE));
            wo = 1 - e; wx = -fromX * e; wsc = 1 + e * 0.06; wbl = e * 10;
          }
          el.style.opacity   = String(wo);
          el.style.transform = `translateX(${wx}px) scale(${wsc})`;
          el.style.filter    = wbl > 0.1 ? `blur(${wbl.toFixed(1)}px)` : "none";
        };
        animWord(leftWordRef.current, -80);
        animWord(rightWordRef.current, 80);

        if (glowRef.current) {
          let go = 0;
          if (p >= frames_wInS && p <= frames_wInE) go = norm(p, frames_wInS, frames_wInE);
          else if (p > frames_wInE && p < frames_wOutS) go = 1;
          else if (p >= frames_wOutS && p <= frames_wOutE) go = 1 - norm(p, frames_wOutS, frames_wOutE);
          glowRef.current.style.opacity = String(go);
        }

        // ── Wrapper shrink / move ──────────────────────────────────────
        if (wrapperRef.current) {
          let sc2 = 1, br = 20, dy = 0;
          const margin = 28, finalScale = 0.56;
          const sh = window.innerHeight, maxDy = (sh * (1 - finalScale)) / 2 - margin;
          if (p >= frames_shrinkS && p < frames_moveUpS) {
            const e = easeOut3(norm(p, frames_shrinkS, frames_shrinkE));
            sc2 = 1 - e * 0.44; br = 20 + e * 28; dy = e * maxDy;
          } else if (p >= frames_moveUpS) {
            sc2 = finalScale; br = 48;
            const e = easeOut3(norm(p, frames_moveUpS, frames_moveUpE));
            dy = maxDy - e * 2 * maxDy;
          }
          wrapperRef.current.style.transform    = `translateY(${dy}px) scale(${sc2})`;
          wrapperRef.current.style.borderRadius = `${br}px`;
        }

        // ── Phone heading chars ────────────────────────────────────────
        if (phoneHeadRef.current) {
          let topO = 0;
          if (p >= frames_textTopS && p < frames_textTopOutS) topO = 1;
          else if (p >= frames_textTopOutS && p <= frames_textTopOutE)
            topO = 1 - easeOut3(norm(p, frames_textTopOutS, frames_textTopOutE));
          phoneHeadRef.current.style.opacity = String(topO);
        }
        const topChars = phoneCharsRef.current;
        if (topChars.length > 0) {
          if (p >= frames_textTopS && p < frames_textTopOutS) {
            const rp = norm(p, frames_textTopS, frames_textTopE), total = topChars.length;
            for (let i = 0; i < total; i++) {
              const e = 1 - Math.pow(1 - norm(rp, i / total, Math.min(1, (i + 2) / total)), 2);
              topChars[i].style.opacity   = String(e);
              topChars[i].style.transform = e < 0.99 ? `translateY(${(1 - e) * 14}px)` : "none";
            }
          } else if (p >= frames_textTopOutS) {
            topChars.forEach((c) => { c.style.opacity = "1"; c.style.transform = "none"; });
          } else {
            topChars.forEach((c) => { c.style.opacity = "0"; c.style.transform = "translateY(14px)"; });
          }
        }

        // ── Bottom text ────────────────────────────────────────────────
        if (bottomTextRef.current)
          bottomTextRef.current.style.opacity = p >= frames_btextS ? "1" : "0";
        const botChars = bottomCharsRef.current;
        if (botChars.length > 0) {
          if (p >= frames_btextS) {
            const rp = norm(p, frames_btextS, frames_btextE), total = botChars.length;
            for (let i = 0; i < total; i++) {
              const e = 1 - Math.pow(1 - norm(rp, i / total, Math.min(1, (i + 2) / total)), 2);
              botChars[i].style.opacity   = String(e);
              botChars[i].style.transform = e < 0.99 ? `translateY(${(1 - e) * 14}px)` : "none";
            }
          } else {
            botChars.forEach((c) => { c.style.opacity = "0"; c.style.transform = "translateY(14px)"; });
          }
        }

        // ── Section background colour ──────────────────────────────────
        if (bgRef.current) {
          const t = Math.max(0, Math.min(1, (p - frames_bgS) / (1 - frames_bgS)));
          bgRef.current.style.background = `rgb(${Math.round(28 * t)},${Math.round(9 * t)},0)`;
        }

        // ── Corner rects ───────────────────────────────────────────────
        if (p >= frames_rectS) {
          const e = easeOut3(norm(p, frames_rectS, frames_rectE));
          if (rect1Ref.current) {
            rect1Ref.current.style.opacity   = String(e);
            rect1Ref.current.style.transform = `translateX(${(1 - e) * -100}px) scale(${0.84 + e * 0.16})`;
          }
          if (rect2Ref.current) {
            rect2Ref.current.style.opacity   = String(e);
            rect2Ref.current.style.transform = `translateX(${(1 - e) * 100}px) scale(${0.84 + e * 0.16})`;
          }
        } else {
          if (rect1Ref.current) { rect1Ref.current.style.opacity = "0"; rect1Ref.current.style.transform = "translateX(-100px) scale(0.84)"; }
          if (rect2Ref.current) { rect2Ref.current.style.opacity = "0"; rect2Ref.current.style.transform = "translateX(100px) scale(0.84)"; }
        }
      },
    });

    const sectionsReadyId = setTimeout(() => { setSectionsReady(true); ScrollTrigger.refresh(); }, 500);
    const refreshId       = setTimeout(() => ScrollTrigger.refresh(), 50);

    return () => {
      clearTimeout(refreshId);
      clearTimeout(sectionsReadyId);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId.current);
      st.kill();
    };
  }, [state]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const tapeClass = [
    "loading-tape",
    state !== "idle"                                          ? "complete" : "",
    state === "expand" || state === "hollow"                  ? "expand"   : "",
    state === "hollow"                                        ? "hollow"   : "",
  ]
    .filter(Boolean)
    .join(" ");

  const tapeContent  = Array(8).fill(TAPE_WORDS).join("");
  const currentColor = IPHONE_COLORS[activeColor];

  return (
    <>
      {/* ── Header ── */}
      <header
        ref={headerRef}
        className="site-header"
        style={{
          opacity:       state === "ready" ? 1 : 0,
          transform:     "translateY(0)",
          pointerEvents: state === "ready" ? "auto" : "none",
        }}
      >
        <img src="/apple.png" alt="Apple" style={{ width: "32px", height: "32px", objectFit: "contain", opacity: 0.9 }} />

        <nav>
          {NAV_ITEMS.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#" style={linkStyle}>Contact</a>
      </header>

      {/* ── Hero canvas section ── */}
      {(state === "hollow" || state === "ready") && (
        <div style={{ margin: 0, padding: 0 }}>
          <div
            ref={(el) => {
              (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
              (bgRef     as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }}
            className="hero-section"
          >
            {/* Phone heading (appears mid-scroll) */}
            <div
              ref={phoneHeadRef}
              style={{
                position: "absolute", top: "4vh", left: 0, right: 0,
                display: "flex", flexDirection: "column", alignItems: "center",
                opacity: 0, pointerEvents: "none", textAlign: "center", zIndex: 20,
              }}
            >
              <div style={{ marginBottom: "8px", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                {splitLine("iPhone 17 Pro")}
              </div>
              <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "clamp(22px,3.2vw,46px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.08, color: "#fff" }}>
                {splitLine("Thin as a thought.")}
              </div>
              <div style={{ marginBottom: "14px", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "clamp(22px,3.2vw,46px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.08 }}>
                {splitLine("Fast as ")}{splitLine("tomorrow.", { color: "#FF6B35", textShadow: "0 0 28px rgba(255,107,53,.6)" })}
              </div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(8px,1vw,13px)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                {splitLine("A19 Pro · 3nm Silicon · Titanium")}
              </div>
              <div style={{ marginTop: "12px", width: "28px", height: "1px", background: "rgba(255,107,53,.5)" }} />
            </div>

            {/* Bottom text */}
            <div
              ref={bottomTextRef}
              style={{
                position: "absolute", bottom: "5vh", left: 0, right: 0,
                display: "flex", flexDirection: "column", alignItems: "center",
                opacity: 0, pointerEvents: "none", textAlign: "center", zIndex: 20,
              }}
            >
              <div style={{ marginBottom: "12px", width: "28px", height: "1px", background: "rgba(255,107,53,.5)" }} />
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(8px,1vw,13px)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                {splitLine("Available now · Starting from $999")}
              </div>
              <div style={{ marginTop: "10px", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "clamp(22px,3.2vw,46px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.08 }}>
                {splitLine("The future ", { color: "rgba(255,255,255,0.6)" })}
                {splitLine("is here.", { color: "#FF6B35", textShadow: "0 0 28px rgba(255,107,53,.6)" })}
              </div>
              <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "clamp(22px,3.2vw,46px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.08, color: "#fff" }}>
                {splitLine("Only on Apple.")}
              </div>
            </div>

            {/* Corner rects */}
            <div ref={rect1Ref} style={{ position: "absolute", bottom: "100px", left: "clamp(44px,9vw,130px)", opacity: 0, transform: "translateX(-100px) scale(0.84)", willChange: "opacity,transform", width: "clamp(120px,12vw,172px)", height: "clamp(120px,12vw,172px)", borderRadius: "18px", overflow: "hidden", boxShadow: SQUARE_SHADOW, zIndex: 30, transformOrigin: "bottom left" }}>
              <img src="/rec1.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none", userSelect: "none" }} />
            </div>
            <div ref={rect2Ref} style={{ position: "absolute", bottom: "100px", right: "clamp(44px,9vw,130px)", opacity: 0, transform: "translateX(100px) scale(0.84)", willChange: "opacity,transform", width: "clamp(120px,12vw,172px)", height: "clamp(120px,12vw,172px)", borderRadius: "18px", overflow: "hidden", boxShadow: SQUARE_SHADOW, zIndex: 30, transformOrigin: "bottom right" }}>
              <img src="/rec2.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none", userSelect: "none" }} />
            </div>

            {/* Canvas wrapper (shrinks / moves on scroll) */}
            <div
              ref={wrapperRef}
              style={{
                width: "100%", height: "100%",
                borderRadius: "20px", overflow: "hidden", flexShrink: 0,
                position: "relative", isolation: "isolate",
                willChange: "transform,border-radius",
                transformOrigin: "center center",
                boxShadow: "0 0 0 1px rgba(255,255,255,.25),0 0 20px 4px rgba(255,255,255,.2),0 0 60px 12px rgba(255,255,255,.08)",
              }}
            >
              <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

              {/* Centre text overlay */}
              <div
                ref={centerTextRef}
                style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  opacity: 0, pointerEvents: "none", textAlign: "center", padding: "0 40px",
                  willChange: "opacity,transform,filter",
                }}
              >
                <p style={{ margin: "0 0 16px", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "13px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,.45)" }}>Since 1976</p>
                <h2 style={{ margin: 0, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "clamp(48px,8vw,96px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff" }}>Apple never<br />disappoints.</h2>
                <p style={{ margin: "24px 0 0", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "18px", fontWeight: 400, lineHeight: 1.6, color: "rgba(255,255,255,.5)", maxWidth: "480px" }}>Every year, a new standard.<br />Every product, a new obsession.</p>
              </div>

              {/* Left / right words */}
              <div ref={leftWordRef} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "28%", display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: "2vw", paddingRight: "1vw", opacity: 0, pointerEvents: "none", willChange: "opacity,transform,filter" }}>
                <h2 style={{ margin: 0, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "clamp(56px,9vw,112px)", fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 0.9, color: "rgba(255,255,255,.7)", transform: "perspective(600px) rotateY(8deg) skewY(2deg)", transformOrigin: "left center" }}>Think<br />Different</h2>
              </div>
              <div ref={glowRef} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "2px", height: "60%", opacity: 0, pointerEvents: "none", boxShadow: "0 0 80px 60px rgba(255,255,255,.18),0 0 160px 100px rgba(255,255,255,.08)", borderRadius: "50%", willChange: "opacity" }} />
              <div ref={rightWordRef} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "28%", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "2vw", paddingLeft: "1vw", opacity: 0, pointerEvents: "none", willChange: "opacity,transform,filter", textAlign: "right" }}>
                <h2 style={{ margin: 0, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "clamp(56px,9vw,112px)", fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 0.9, color: "rgba(255,255,255,.7)", transform: "perspective(600px) rotateY(8deg) skewY(2deg)", transformOrigin: "left center" }}>Only<br />Apple</h2>
              </div>

              {/* Bottom-left hero card */}
              <div
                ref={bottomLeftRef}
                className="hero-bottom-left"
                style={{
                  position: "absolute", bottom: "40px", left: "40px",
                  opacity: shown ? 1 : 0,
                  transform: !shown ? "translate(60px,20px) scale(0.96)" : "translate(0,0) scale(1)",
                  transition: "opacity .5s ease, transform .5s cubic-bezier(.22,1,.36,1)",
                }}
              >
                <p style={{ margin: 0, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,.45)", letterSpacing: "0.12em", textTransform: "uppercase", opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(12px)", transition: "opacity .7s ease .2s, transform .7s cubic-bezier(.22,1,.36,1) .2s" }}>New</p>
                <h2 style={{ margin: "8px 0 0", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "clamp(32px,5vw,64px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.04em", lineHeight: 0.95, opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(20px)", transition: "opacity .8s ease .35s, transform .8s cubic-bezier(.22,1,.36,1) .35s" }}>iPhone 17 Pro</h2>
                <p style={{ margin: "16px 0 0", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "clamp(13px,1.1vw,16px)", fontWeight: 400, color: "rgba(255,255,255,.58)", maxWidth: "340px", lineHeight: 1.6, opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(16px)", transition: "opacity .8s ease .5s, transform .8s cubic-bezier(.22,1,.36,1) .5s" }}>The thinnest Pro ever made. A titanium build that feels lighter than air, powered by the all-new A19 Pro chip.</p>
                <div style={{ marginTop: "22px", display: "flex", gap: "12px", opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(12px)", transition: "opacity .7s ease .65s, transform .7s cubic-bezier(.22,1,.36,1) .65s" }}>
                  <a href="#" style={{ fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "14px", fontWeight: 500, color: "#fff", textDecoration: "none", background: "rgba(255,255,255,.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.2)", borderRadius: "999px", padding: "9px 20px" }}>Learn more →</a>
                  <a href="#" style={{ fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "14px", fontWeight: 500, color: "#000", textDecoration: "none", background: "#fff", borderRadius: "999px", padding: "9px 20px" }}>Buy</a>
                </div>
              </div>

              {/* Bottom-right contact card */}
              <div
                ref={bottomRightRef}
                className="hero-bottom-right"
                style={{
                  position: "absolute", bottom: "36px", right: "36px",
                  opacity: shown ? 1 : 0,
                  transform: !shown ? "translate(-60px,16px)" : "translate(0,0)",
                  transition: "opacity .5s ease, transform .5s cubic-bezier(.22,1,.36,1)",
                  background: "#fff", borderRadius: "16px", padding: "20px 24px", minWidth: "200px",
                }}
              >
                <p style={{ margin: 0, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Get in touch</p>
                <p style={{ margin: "8px 0 0", fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "15px", fontWeight: 500, color: "#000" }}>hello@apple.com</p>
                <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <span style={{ fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", fontSize: "13px", fontWeight: 500, color: "#000" }}>Contact us</span>
                  <span style={{ fontSize: "13px" }}>→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Section separators + lazy sections ── */}
      {sectionsReady && <div style={{ height: "100vh", background: "rgb(0,0,0)" }} aria-hidden="true" />}
      {sectionsReady && <TapeSection tapeContent={tapeContent} />}
      {sectionsReady && <div style={{ height: "100vh", background: "rgb(0,0,0)" }} aria-hidden="true" />}

      {sectionsReady && (
        <div ref={productSectionWrapperRef}>
          <ProductSection
            currentColor={currentColor}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
            isProductSectionInView={isProductSectionInView}
          />
        </div>
      )}

      {sectionsReady && <div style={{ height: "100vh", background: "rgb(0,0,0)" }} aria-hidden="true" />}

      {sectionsReady && (
        <div ref={devSectionWrapperRef}>
          <DeveloperSection isInView={isDevSectionInView} />
        </div>
      )}

      {sectionsReady && <div style={{ height: "60vh", background: "#000000" }} />}
      {sectionsReady && <GooeyFooter />}

      {/* ── Loading screen ── */}
      {state !== "ready" && (
        <div className={`loading-screen${state === "hollow" ? " hollow" : ""}`}>
          <div className={tapeClass}>
            <div className="loading-tape-fill" />
            <span className="loading-tape-label">Loading</span>
          </div>
        </div>
      )}
    </>
  );
}
