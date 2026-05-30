import { useRef, useCallback } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import AnimatedPolyline from './AnimatedPolyline';

const MAP_STYLE = {
  version: 8,
  sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#7ab8d9' } }],
};

const guessMarkerLayer = (correct) => ({
  id: 'guess-marker',
  type: 'circle',
  source: 'guess-marker',
  paint: {
    'circle-radius': 9,
    'circle-color': correct ? '#4CAF50' : '#f44336',
    'circle-stroke-color': '#fff',
    'circle-stroke-width': 2,
  },
});

const targetMarkerLayer = () => ({
  id: 'target-marker',
  type: 'circle',
  source: 'target-marker',
  paint: {
    'circle-radius': 9,
    'circle-color': '#4CAF50',
    'circle-stroke-color': '#fff',
    'circle-stroke-width': 2,
  },
});

const landLayer = (satellite) => ({
  id: 'countries-fill',
  type: 'fill',
  source: 'countries',
  paint: {
    'fill-color': '#e8d5b0',
    'fill-opacity': satellite ? 0 : 1,
    'fill-opacity-transition': { duration: 400, delay: 0 },
  },
});

const borderLayer = (borders) => ({
  id: 'countries-border',
  type: 'line',
  source: 'countries',
  paint: {
    'line-color': '#a07840',
    'line-width': borders ? 1 : 0,
  },
});

const highlightLayer = (targetName) => ({
  id: 'countries-highlight',
  type: 'fill',
  source: 'countries',
  filter: ['==', ['get', 'name'], targetName || ''],
  paint: {
    'fill-color': '#7ec87a',
    'fill-opacity': 0.8,
  },
});

export default function GameMap({ geoData, target, result, showHighlight, showResult, onMapClick, hardMode, satellite }) {
  const mapRef = useRef(null);
  const liveScoreRef = useRef(null);

  const handleClick = useCallback((e) => { 
    if (!e.features || e.features.length === 0) {
      
      let lng = e.lngLat.lng; 
      lng = ((lng + 180) % 360 + 360) % 360 - 180; 
      onMapClick([e.lngLat.lat, lng], null);
      return;
    }
    const feature = e.features[0];
    let lng = e.lngLat.lng;
    lng = ((lng + 180) % 360 + 360) % 360 - 180;
    onMapClick([e.lngLat.lat, lng], feature.properties['ISO3166-1-Alpha-3']);
  }, [onMapClick]);

    const handleMouseEnter = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = 'pointer';
  }, []);

    const handleMouseLeave = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = '';
  }, []);


  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 0, latitude: 20, zoom: 2 }} 
        minZoom={2}
        maxZoom={8}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ height: '100%', width: '100%' }}
        interactiveLayerIds={['countries-fill']}
        onClick={handleClick}
        mapStyle={MAP_STYLE}
      >
        <Source
          id="esri-topo"
          type="raster"
          tiles={['https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}']}
          tileSize={256}
          maxzoom={8}
        >
          <Layer
            id="esri-topo-layer"
            type="raster"
            paint={{
              'raster-opacity': satellite ? 1 : 0,
              'raster-opacity-transition': { duration: 400, delay: 0 },
            }}
          />
        </Source>

        {geoData && (
          <Source id="countries" type="geojson" data={geoData}>
            <Layer {...landLayer(satellite)} />
            <Layer {...borderLayer(!hardMode)} />
            <Layer {...highlightLayer(showHighlight && target ? target.name : '')} />
          </Source>
        )}

        <Source id="lakes" type="geojson" data="/lakes.geojson">
          <Layer
            id="lakes-fill"
            type="fill"
            paint={{
              'fill-color': '#7ab8d9',
              'fill-opacity': satellite ? 0 : 1,
              'fill-opacity-transition': { duration: 400, delay: 0 },
            }}
          />
        </Source>

        {result && !result.correct && target && (
          <AnimatedPolyline
            positions={[result.latlng, target.centroid]}
            pathOptions={{ color: '#ff9800', weight: 2.5 }}
            distKm={result.distKm}
            liveScoreRef={liveScoreRef}
          />
        )}

        {result && (
          <Source id="guess-marker" type="geojson" data={{
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [result.latlng[1], result.latlng[0]] } }]
          }}>
            <Layer {...guessMarkerLayer(result.correct)} />
          </Source>
        )}

        {showHighlight && result && !result.correct && target && (
          <Source id="target-marker" type="geojson" data={{
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [target.centroid[1], target.centroid[0]] } }]
          }}>
            <Layer {...targetMarkerLayer()} />
          </Source>
        )}
      </Map>

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