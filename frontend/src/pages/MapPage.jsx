import { useEffect, useState } from "react";
import { fetchSightings } from "../api";
import RiskMap from "../components/RiskMap";

function MapPage() {
    const [sightings, setSightings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchSightings();
                setSightings(data);
            } catch (err) {
                setError(err.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <p>Loading sightings…</p>;
    if (error) return <p className="status-error">{error}</p>;

    return (
        <div className="content map-page">
            <header className="page-header">
                <h2>Tick Sightings Overview</h2>
                <p>View reported tick sightings across different regions.</p>
            </header>

            <p>
                Zoomed out: circles show regional risk. Zoom in to see individual reports where
                a map location was provided.
            </p>

            <RiskMap sightings={sightings} />

            <h3 className="list-title">Recent Sightings</h3>
            <ul className="sighting-list">
                {sightings.map((s, idx) => (
                    <li key={idx} className="sighting-card">
                        <strong>{s.species}</strong>
                        <div className="notes">{s.notes || "No notes"}</div>

                        <div className="meta">
                            {s.region && <span>Region: {s.region} • </span>}
                            <span>{s.date}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MapPage;
