import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents, Pane } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.vectorgrid';
import AnimatedPolyline from './AnimatedPolyline';


if (L.DomEvent && !L.DomEvent.fakeStop) {
  L.DomEvent.fakeStop = () => true;
}

const LAND_STYLE = (borders) => ({
  fillColor: '#e8d5b0',
  fillOpacity: borders ? 0 : 1,
  color: '#a07840',
  weight: borders ? 1 : 0,
});

const HIGHLIGHT_STYLE = {
  fillColor: '#7ec87a',
  fillOpacity: 0.8,
  color: '#3a8a38',
  weight: 2,
};

function ClickCapture({ handlerRef }) {
  useMapEvents({
    click(e) {
      handlerRef.current([e.latlng.lat, e.latlng.lng], null);
    },
  });
  return null;
}

export default function GameMap({ geoData, target, result, showHighlight, showResult, onMapClick, hardMode }) {
  const mapRef = useRef(null);
  const handlerRef = useRef(onMapClick);
  const vectorGridRef = useRef(null);
  const liveScoreRef = useRef(null);
  const hardModeRef = useRef(hardMode);

  const layerKey = `${hardMode}-${showHighlight ? 'highlight' : result ? 'result' : 'playing'}`;

  useEffect(() => { hardModeRef.current = hardMode; }, [hardMode]);

  useEffect(() => {
    handlerRef.current = onMapClick;
  });

  useEffect(() => {
  if (!geoData || !mapRef.current) return;

  if (vectorGridRef.current) {
    vectorGridRef.current.remove();
    vectorGridRef.current = null;
  }

  const layer = L.vectorGrid.slicer(geoData, {
    rendererFactory: L.canvas.tile,
    vectorTileLayerStyles: {
      sliced: (properties) => {
        const isTarget = showHighlight && target && properties.name === target.name;
        return isTarget ? HIGHLIGHT_STYLE : {
          fillColor: '#e8d5b0',
          fillOpacity: 1,
          color: '#e8d5b0',
          weight: 0,
        };
      },
    },
    interactive: true,
    getFeatureId: (f) => f.properties['ISO3166-1-Alpha-3'],
  });

  layer.on('click', (e) => {
    handlerRef.current(
      [e.latlng.lat, e.latlng.lng],
      e.layer.properties['ISO3166-1-Alpha-3']
    );
  });

  layer.addTo(mapRef.current);
  vectorGridRef.current = layer;

  return () => {
    if (vectorGridRef.current) vectorGridRef.current.remove();
  };
}, [geoData, hardMode, showHighlight, target, layerKey]);

  useEffect(() => {
  if (!vectorGridRef.current || !geoData) return;

  geoData.features.forEach((f) => {
    const iso3 = f.properties['ISO3166-1-Alpha-3'];
    const isTarget = showHighlight && target && f.properties.name === target.name;
    vectorGridRef.current.setFeatureStyle( // updates style per country without recreating layer
      iso3,
      isTarget ? HIGHLIGHT_STYLE : LAND_STYLE(!hardMode)
    );
  });
}, [hardMode, showHighlight, target, geoData]);

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
        ref={mapRef}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}"
          //noWrap={false}
        />
        <ClickCapture handlerRef={handlerRef} />

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

        {showHighlight && result && !result.correct && target && (() => {
          let endLng = target.centroid[1];
          const lngDiff = endLng - result.latlng[1];
          if (lngDiff > 180) endLng -= 360;
          if (lngDiff < -180) endLng += 360;
          return (
            <CircleMarker
              center={[target.centroid[0], endLng]}
              radius={9}
              pathOptions={{ color: '#fff', weight: 2, fillColor: '#4CAF50', fillOpacity: 1 }}
            />
          );
        })()}
      </MapContainer>

      {result && !result.correct && !showResult && (
        <div style={{
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
        }}>
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