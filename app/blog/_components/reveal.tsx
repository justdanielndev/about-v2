"use client";

import { useEffect, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Reveal({ children, className }: RevealProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShown(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const classes = [className, "cloneReveal", shown ? "cloneShown" : "cloneHidden"].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
