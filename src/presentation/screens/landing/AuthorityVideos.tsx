"use client";

import { useEffect, useRef, useState } from "react";
import { AUTHORITY_VIDEOS, AGENT_INFO, type AuthorityVideo } from "@/presentation/constants";

interface ReelProps extends AuthorityVideo {
  index: number;
}

/**
 * "Reel" con marco tipo dispositivo móvil, overlay de gradiente para
 * legibilidad del chip de nombre, y control de play/pause propio (en vez
 * de los controles nativos del navegador, inconsistentes entre
 * plataformas y visualmente pobres sobre un fondo oscuro editorial).
 *
 * El <video> se monta recién cuando la tarjeta entra en el viewport
 * (mismo patrón de IntersectionObserver que LandingSection) — evita gastar
 * los ~3-8MB de cada clip en una conexión móvil si el usuario nunca llega
 * a hacer scroll hasta acá. Mientras tanto se ve el poster real (frame
 * del propio video), no una caja vacía.
 */
function Reel({ src, poster, index }: ReelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-label={playing ? "Pausar video" : "Reproducir video"}
      className="relative w-full aspect-[9/16] rounded-[28px] overflow-hidden border shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      style={{ borderColor: "var(--border-ondark)", background: "var(--bg-trust-elevated)" }}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
      {shouldLoad && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(11,22,40,0.15) 0%, rgba(11,22,40,0) 30%, rgba(11,22,40,0.75) 100%)" }}
      />
      <div className="absolute left-3 bottom-3 right-3 flex items-center justify-between">
        <div>
          <p className="type-label" style={{ color: "var(--text-ondark)" }}>
            {AGENT_INFO.name}
          </p>
          <p className="type-caption" style={{ color: "var(--text-ondark-secondary)" }}>
            Video {index + 1} · Agente Certificado
          </p>
        </div>
        {!playing && (
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
              <path d="M4 2.5v11l9-5.5-9-5.5z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// copy: spec de rediseño v1.0 § 2.7 Contenido de autoridad — videos de Luis
// (NO son testimonios). Formato vertical, autoplay muted, control propio.
export function AuthorityVideos() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow" style={{ color: "var(--text-ondark-muted)" }}>
        Conoce a tu Agente Certificado
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-[300px] sm:max-w-[560px] mx-auto">
        {AUTHORITY_VIDEOS.map((video, i) => (
          <Reel key={video.src} {...video} index={i} />
        ))}
      </div>
    </div>
  );
}
