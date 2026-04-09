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

    // Find every server-rendered placeholder and wire up click handlers
    const placeholders = container.querySelectorAll<HTMLElement>(".media-placeholder");
    const handlers: Array<{ el: HTMLElement; fn: () => void }> = [];

    placeholders.forEach(el => {
      const src = el.dataset.src || "";
      const alt = el.dataset.alt || "";
      const type = (el.dataset.mediaType as "image" | "video" | "figma") || "image";

      const fn = () => setModal({ src, alt, type });
      el.addEventListener("click", fn);
      el.addEventListener("keydown", (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") fn(); });
      handlers.push({ el, fn });
    });

    return () => handlers.forEach(({ el, fn }) => el.removeEventListener("click", fn));
  }, [html]);

  return (
    <>
      <div ref={ref} className="prose-ujjal" dangerouslySetInnerHTML={{ __html: html }} />
      {modal && <MediaModal src={modal.src} type={modal.type} alt={modal.alt} onClose={() => setModal(null)} />}
    </>
  );
}
