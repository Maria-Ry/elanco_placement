import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";

function ClickHandler({ onSelect }) {
    useMapEvents({
        click(e) {
            onSelect(e.latlng);
        },
    });
    return null;
}

export default function LocationPickerMap({ value, onChange }) {
    const defaultCenter = [54.5, -3.0];
    const [internalPosition, setInternalPosition] = useState(null);

    useEffect(() => {
        if (value && value.lat != null && value.lon != null) {
            setInternalPosition([value.lat, value.lon]);
        } else {
            setInternalPosition(null);
        }
    }, [value]);

    const handleSelect = (latlng) => {
        const pos = [latlng.lat, latlng.lng];
        setInternalPosition(pos);
        onChange({ lat: latlng.lat, lon: latlng.lng });
    };

    const handleClear = () => {
        setInternalPosition(null);
        onChange(null);
    };

    return (
        <div className="location-picker">
            <div className="location-picker-header">
                <div className="location-picker-meta">
                    {internalPosition && (
                        <span className="location-coords">
                            {internalPosition[0].toFixed(4)}, {internalPosition[1].toFixed(4)}
                        </span>
                    )}
                    {internalPosition && (
                        <button
                            type="button"
                            className="location-picker-clear"
                            onClick={handleClear}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="location-picker-map">
                <MapContainer className="map-container"
                    center={internalPosition || defaultCenter}
                    zoom={6}
                    style={{ height: "260px", width: "100%" }}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickHandler onSelect={handleSelect} />
                    {internalPosition && <Marker position={internalPosition} />}
                </MapContainer>
            </div>
        </div>
    );
}
