import { useEffect, useRef } from 'react';
import { MapContainer, GeoJSON, CircleMarker, useMapEvents, Pane } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import AnimatedPolyline from './AnimatedPolyline';

const LAND = (borders) => ({
  fillColor: '#c8a96e', fillOpacity: 1,
  color: borders ? '#a07840' : '#c8a96e',
  weight: 1, smoothFactor: 0,
});
const HIGHLIGHT = { fillColor: '#7ec87a', fillOpacity: 0.8, color: '#3a8a38', weight: 2 };

function ClickCapture({ handlerRef, countryClickedRef }) {
  useMapEvents({
    click(e) {
      if (countryClickedRef.current) {
        countryClickedRef.current = false;
        return;
      }
      handlerRef.current([e.latlng.lat, e.latlng.lng], null);
    },
  });
  return null;
}

export default function GameMap({ geoData, target, result, showHighlight, showResult, onMapClick, hardMode }) {
  const handlerRef = useRef(onMapClick);
  const countryClickedRef = useRef(false);
  const liveScoreRef = useRef(null);

  useEffect(() => {
    handlerRef.current = onMapClick;
  });

  function getStyle(feature) {
    if (showHighlight && result && target && feature.properties.name === target.name) {
      return HIGHLIGHT;
    }
    return LAND(!hardMode);
  }

  function onEachFeature(feature, layer) {
    layer.on('click', e => {
      countryClickedRef.current = true;
      handlerRef.current([e.latlng.lat, e.latlng.lng], feature.properties['ISO3166-1-Alpha-3']);
    });
  }

  return (
    <>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={8}
        attributionControl={false}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
        worldCopyJump
      >
        <Pane name="countries" style={{ zIndex: 300 }}>
          {geoData && (
            <GeoJSON
              key={`${hardMode}-${showHighlight ? 'highlight' : result ? 'result' : 'playing'}`}
              data={geoData}
              style={getStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </Pane>
        <ClickCapture handlerRef={handlerRef} countryClickedRef={countryClickedRef} />

        {result && (
          <CircleMarker
            center={result.latlng}
            radius={9}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: result.correct ? '#4CAF50' : '#f44336',
              fillOpacity: 1,
            }}
          />
        )}

        {result && !result.correct && target && (
          <AnimatedPolyline
            positions={[result.latlng, target.centroid]}
            pathOptions={{ color: '#ff9800', weight: 2.5 }}
            distKm={result.distKm}
            liveScoreRef={liveScoreRef}
          />
        )}

        {showHighlight && result && !result.correct && target && (
          <CircleMarker
            center={target.centroid}
            radius={9}
            pathOptions={{ color: '#fff', weight: 2, fillColor: '#4CAF50', fillOpacity: 1 }}
          />
        )}
      </MapContainer>

      {/* Live accuracy score — shown while line animates, before result card */}
      {result && !result.correct && !showResult && (
        <div
          style={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'rgba(20,20,40,0.92)',
            backdropFilter: 'blur(8px)',
            padding: '16px 40px',
            borderRadius: 12,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 12, color: '#888', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Accuracy
          </div>
          <div style={{ fontSize: 40, fontWeight: 'bold', color: '#ff9800', fontVariantNumeric: 'tabular-nums' }} ref={liveScoreRef}>
            2500
          </div>
        </div>
      )}
    </>
  );
}
