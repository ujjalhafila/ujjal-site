"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import HeroCrack from "./HeroCrack";

const WildSide = dynamic(() => import("./WildSide"), { ssr: false });

export default function WildSideGate() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ cx: 50, cy: 50 });

  return (
    <>
      <HeroCrack
        onEnter={(cx, cy) => {
          setPos({ cx, cy });
          setOpen(true);
        }}
      />
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
