import { VideoPlaceholder } from "@/presentation/components/VideoPlaceholder";

// copy: docs/superpowers/specs/2026-08-06-landing-page-design.md § 5. Testimonios
export function Testimonials() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-eyebrow">Personas que ya pasaron por este proceso</p>
      <div className="flex flex-col gap-4">
        <VideoPlaceholder />
        <VideoPlaceholder />
        <VideoPlaceholder />
      </div>
    </div>
  );
}
