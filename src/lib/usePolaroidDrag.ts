"use client";

import { useEffect, type RefObject } from "react";

/**
 * Drag the polaroids around their table (desktop, fine pointer only). Each `[data-pol]` card keeps
 * its own offset in --dx / --dy (the CSS adds its tilt), comes to the top when picked up and can't
 * leave the table. Used by "Who it's for" and "Why we do this". Phones: nothing, the row scrolls.
 * After a real drag the card gets data-dragged="1", so a click handler can tell a drag from a tap.
 */
export function usePolaroidDrag(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const table = ref.current;
    if (!table || !window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches) return;
    const cards = Array.from(table.querySelectorAll<HTMLElement>("[data-pol]"));
    let z = 10;
    const offs = cards.map(() => ({ x: 0, y: 0 }));
    const cleanups = cards.map((card, i) => {
      let sx = 0, sy = 0, ox = 0, oy = 0, drag = false;
      const down = (e: PointerEvent) => {
        if ((e.target as Element).closest("a, button")) return; // links inside a card still work
        drag = true;
        card.dataset.dragged = "";
        card.setPointerCapture(e.pointerId);
        sx = e.clientX;
        sy = e.clientY;
        ox = offs[i].x;
        oy = offs[i].y;
        card.style.zIndex = String(++z);
        card.classList.add("is-grabbed");
      };
      const move = (e: PointerEvent) => {
        if (!drag) return;
        if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 5) card.dataset.dragged = "1";
        const tr = table.getBoundingClientRect();
        const cr = card.getBoundingClientRect();
        // keep the card on the table
        const dx = ox + e.clientX - sx - offs[i].x;
        const dy = oy + e.clientY - sy - offs[i].y;
        offs[i].x += Math.min(Math.max(dx, tr.left - cr.left - 20), tr.right - cr.right + 20);
        offs[i].y += Math.min(Math.max(dy, tr.top - cr.top - 20), tr.bottom - cr.bottom + 20);
        card.style.setProperty("--dx", `${offs[i].x}px`);
        card.style.setProperty("--dy", `${offs[i].y}px`);
      };
      const up = () => {
        drag = false;
        card.classList.remove("is-grabbed");
      };
      card.addEventListener("pointerdown", down);
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerup", up);
      card.addEventListener("pointercancel", up);
      return () => {
        card.removeEventListener("pointerdown", down);
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerup", up);
        card.removeEventListener("pointercancel", up);
      };
    });
    table.classList.add("is-live");
    return () => {
      cleanups.forEach((c) => c());
      table.classList.remove("is-live");
    };
  }, [ref]);
}
