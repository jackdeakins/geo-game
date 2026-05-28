import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Map() {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2.6}
      minZoom={2}
      zoomSnap={0.1}
      zoomDelta={0.1}
      maxBounds={[[-90, -Infinity], [90, Infinity]]}
      //maxBoundsViscosity={1.0}
      //worldCopyJump={false}

      style={{ height: "100%", width: "100%"}}
    >
      <TileLayer 
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      //noWrap={false}
      />
    </MapContainer>
  );
}

export default Map;