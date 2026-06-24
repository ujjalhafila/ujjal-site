"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import HeroCrack from "./HeroCrack";
import OverscrollEntry from "./OverscrollEntry";

const WildSide = dynamic(() => import("./WildSide"), { ssr: false });

export default function WildSideGate() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ cx: 50, cy: 50 });

  const enterFromCrack = useCallback((cx: number, cy: number) => {
    setPos({ cx, cy });
    setOpen(true);
  }, []);

  const enterFromTop = useCallback(() => {
    setPos({ cx: 50, cy: 0 });
    setOpen(true);
  }, []);

  return (
    <>
      <HeroCrack onEnter={enterFromCrack} />
      <OverscrollEntry onEnter={enterFromTop} />
      {open && (
        <WildSide
          cx={pos.cx}
          cy={pos.cy}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
