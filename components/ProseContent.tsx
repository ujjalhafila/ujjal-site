"use client";
import { useEffect, useRef, useState } from "react";
import MediaModal from "./MediaModal";

type ModalState = { src: string; type: "image" | "video" | "figma"; alt: string } | null;

export default function ProseContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Single delegated listener — survives modal open/close cycles without re-wiring
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest(".media-placeholder") as HTMLElement | null;
      if (!target) return;
      const src = target.dataset.src || "";
      const alt = target.dataset.alt || "";
      const type = (target.dataset.mediaType as "image" | "video" | "figma") || "image";
      if (src) setModal({ src, alt, type });
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Enter" && e.key !== " ") return;
      const target = (e.target as HTMLElement).closest(".media-placeholder") as HTMLElement | null;
      if (!target) return;
      e.preventDefault();
      const src = target.dataset.src || "";
      const alt = target.dataset.alt || "";
      const type = (target.dataset.mediaType as "image" | "video" | "figma") || "image";
      if (src) setModal({ src, alt, type });
    }

    container.addEventListener("click", handleClick);
    container.addEventListener("keydown", handleKey);
    return () => {
      container.removeEventListener("click", handleClick);
      container.removeEventListener("keydown", handleKey);
    };
  }, []); // Empty deps — attach once on mount, never re-wire

  return (
    <>
      <div ref={ref} className="prose-ujjal" dangerouslySetInnerHTML={{ __html: html }} />
      {modal && (
        <MediaModal
          key={`${modal.src}-${Date.now()}`}
          src={modal.src}
          type={modal.type}
          alt={modal.alt}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
