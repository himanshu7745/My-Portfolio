"use client";

import { useRef, type ReactNode } from "react";
import { useDraggable } from "@/lib/useDraggable";

type Props = {
  id: string;
  className?: string;
  label: string;
  children: ReactNode;
  /** Show the little grab bar at the top. */
  grab?: boolean;
};

/** A draggable desktop card. The robot can also perch on top of it. */
export default function Widget({ id, className = "", label, children, grab = true }: Props) {
  const ref = useRef<HTMLElement>(null);
  useDraggable(ref);
  return (
    <section ref={ref} id={id} className={`widget ${className}`} aria-label={label} data-perch>
      {grab && <div className="grab" aria-hidden="true" />}
      {children}
    </section>
  );
}
