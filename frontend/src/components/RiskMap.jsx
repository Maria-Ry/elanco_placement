import { useMemo, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    CircleMarker,
    useMapEvents,
} from "react-leaflet";

function getSeverityColor(severity) {
    switch (severity) {
        case "high":
            return "#ef4444";
        case "medium":
            return "#fec322ff";
        case "low":
            return "#22c55e";
        default:
            return "#6b7280";
    }
}

// Fallback centre per region name
function regionToCenter(region) {
    if (!region) return null;

    const name = region.toLowerCase().trim();

    const lookup = {
        "london":      [51.509865, -0.118092],
        "birmingham":  [52.489471, -1.898575],
        "glasgow":     [55.860916, -4.251433],
        "manchester":  [53.483959, -2.244644],
        "liverpool":   [53.400002, -2.983333],
        "leeds":       [53.801277, -1.548567],
        "sheffield":   [53.383331, -1.466667],
        "edinburgh":   [55.953251, -3.188267],
        "bristol":     [51.454514, -2.587910],
        "cardiff":     [51.481583, -3.179090],
        "nottingham":  [52.950001, -1.150000],
        "leicester":   [52.633331, -1.133333],
        "southampton": [50.909698, -1.404351],
        "newcastle":   [54.966667, -1.600000],
    };

    if (lookup[name]) return lookup[name];

    return null;
}

// Track zoom level
function ZoomWatcher({ onZoomChange }) {
    const map = useMapEvents({
        zoomend: () => {
            onZoomChange(map.getZoom());
        },
    });
    return null;
}

export default function RiskMap({ sightings }) {
    const [zoom, setZoom] = useState(6);
    const zoomThreshold = 8;

    // Individual markers only when we have actual coordinates
    const sightingsWithCoords = useMemo(
        () =>
            sightings.filter(
                (s) =>
                    s.lat != null &&
                    s.lon != null &&
                    !Number.isNaN(Number(s.lat)) &&
                    !Number.isNaN(Number(s.lon))
            ),
        [sightings]
    );

    // Region clusters for zoomed-out view
    const regionClusters = useMemo(() => {
        const byRegion = new Map();

        for (const s of sightings) {
            const key = s.region || "Unknown region";

            if (!byRegion.has(key)) {
                byRegion.set(key, {
                    region: key,
                    lat: null,
                    lon: null,
                    count: 0,
                    severities: [],
                });
            }

            const entry = byRegion.get(key);
            entry.count += 1;
            if (s.severity) entry.severities.push(s.severity);

            // If any sighting in this region has coords, use them as cluster centre
            if (
                entry.lat == null &&
                s.lat != null &&
                s.lon != null &&
                !Number.isNaN(Number(s.lat)) &&
                !Number.isNaN(Number(s.lon))
            ) {
                entry.lat = Number(s.lat);
                entry.lon = Number(s.lon);
            }
        }

        const result = [];

        for (const entry of byRegion.values()) {
            let lat = entry.lat;
            let lon = entry.lon;

            if (lat == null || lon == null) {
                const fallback = regionToCenter(entry.region);
                if (!fallback) continue;
                [lat, lon] = fallback;
            }

            const hasHigh = entry.severities.includes("high");
            const hasMedium = entry.severities.includes("medium");

            let dominantSeverity = "low";
            if (hasHigh) dominantSeverity = "high";
            else if (hasMedium) dominantSeverity = "medium";

            result.push({
                ...entry,
                lat,
                lon,
                dominantSeverity,
            });
        }

        return result;
    }, [sightings]);

    const showClusters = zoom < zoomThreshold;

    return (
        <MapContainer className="map-container"
            center={[54.5, -3.0]}
            zoom={6}
            style={{ height: "500px", width: "100%" }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ZoomWatcher onZoomChange={setZoom} />

            {showClusters
                ? regionClusters.map((cluster) => {
                    const color = getSeverityColor(cluster.dominantSeverity);
                    const radius = Math.min(10 + cluster.count * 2, 40);

                    return (
                        <CircleMarker
                            key={cluster.region}
                            center={[cluster.lat, cluster.lon]}
                            radius={radius}
                            pathOptions={{
                                color,
                                fillColor: color,
                                fillOpacity: 0.3,
                            }}
                        />
                    );
                })
                : sightingsWithCoords.map((s) => (
                    <Marker
                        key={s.id}
                        position={[Number(s.lat), Number(s.lon)]}
                    />
                ))}
        </MapContainer>
    );
}
