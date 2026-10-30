"use client";

// Tiny signal so intro animations wait for the preloader curtain to lift.
let loaded = false;
const listeners = new Set<() => void>();

export function markLoaded() {
  if (loaded) return;
  loaded = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

export function onLoaded(fn: () => void) {
  if (loaded) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
