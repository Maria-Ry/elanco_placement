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
        <div>
            <h2>Tick Sightings Overview</h2>
            <p>
                Zoomed out: circles show regional risk. Zoom in to see individual reports where
                a map location was provided.
            </p>

            <RiskMap sightings={sightings} />
        </div>
    );
}

export default MapPage;
