import { useEffect, useRef } from 'react';
import { Polyline } from 'react-leaflet';

export const ANIM_DURATION = 1400;

export default function AnimatedPolyline({ positions, pathOptions, distKm, liveScoreRef }) {
  const layerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    // Wait one frame so Leaflet has rendered the SVG path
    rafRef.current = requestAnimationFrame(() => {
      const el = layer.getElement();
      if (!el) return;

      const totalLength = el.getTotalLength();
      el.style.strokeDasharray = totalLength;
      el.style.strokeDashoffset = totalLength;

      const start = performance.now();

      function tick(now) {
        const t = Math.min((now - start) / ANIM_DURATION, 1);
        el.style.strokeDashoffset = totalLength * (1 - t);

        // Live score: 2500 → actual distScore as line extends toward country
        if (liveScoreRef?.current) {
          const live = Math.round(2500 * Math.exp(-(distKm * t) / 1500));
          liveScoreRef.current.textContent = live;
        }

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <Polyline ref={layerRef} positions={positions} pathOptions={pathOptions} />;
}
