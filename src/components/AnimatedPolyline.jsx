import { useEffect, useRef, useState } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';

export const ANIM_DURATION = 1400;

function interpolate(start, end, t) {
  return [
    start[0] + (end[0] - start[0]) * t,
    start[1] + (end[1] - start[1]) * t,
  ];
}

function buildLineGeoJSON(start, end, t) {
  const points = [];
  const steps = Math.max(2, Math.round(t * 50));
  for (let i = 0; i <= steps; i++) {
    points.push(interpolate(start, end, (i / steps) * t));
  }
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: points },
    }],
  };
}

export default function AnimatedPolyline({ positions, pathOptions, distKm, liveScoreRef }) {
  const [lineData, setLineData] = useState(null);
  const rafRef = useRef(null);

  const [start, end] = positions;
  // antimeridian fix
  let endLng = end[1];
  const lngDiff = endLng - start[1];
  if (lngDiff > 180) endLng -= 360;
  if (lngDiff < -180) endLng += 360;

  const startCoord = [start[1], start[0]]; // MapLibre uses [lng, lat]
  const endCoord = [endLng, end[0]];

  useEffect(() => {
    const startTime = performance.now();

    function tick(now) {
      const t = Math.min((now - startTime) / ANIM_DURATION, 1);
      setLineData(buildLineGeoJSON(startCoord, endCoord, t));

      if (liveScoreRef?.current) {
        const live = Math.round(2500 * Math.exp(-(distKm * t) / 1500));
        liveScoreRef.current.textContent = live;
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!lineData) return null;

  return (
    <Source id="animated-line" type="geojson" data={lineData}>
      <Layer
        id="animated-line-layer"
        type="line"
        paint={{
          'line-color': pathOptions?.color || '#ff9800',
          'line-width': pathOptions?.weight || 2.5,
        }}
      />
    </Source>
  );
}