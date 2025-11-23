import { useEffect, useState } from "react";
import { fetchSightings } from "../api";

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
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Recent Sightings (list view for now)</h2>
      <p>Later this becomes the interactive UK map.</p>

      {sightings.length === 0 && <p>No sightings yet.</p>}

      <ul className="sighting-list">
        {sightings.map((s) => (
          <li key={s.id} className="sighting-card">
            <div>
              <strong>{s.species}</strong> ({s.severity || "unknown"})
            </div>
            <div>
              {s.region || "Unknown region"} — {s.date}
            </div>
            {s.notes && <div className="notes">{s.notes}</div>}
            <div className="meta">
              Source: {s.source} | ID: {s.id}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MapPage;
