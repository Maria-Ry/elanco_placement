import { useState } from "react";
import { predictSpecies } from "../api";
import { CITY_COORDS } from "../constants/coords";

const LOCATIONS = Object.keys(CITY_COORDS).map((key) => {
    return key.charAt(0).toUpperCase() + key.slice(1);
});

const SEASONS = ["winter", "spring", "summer", "autumn"];

function InsightsPage() {
    const [location, setLocation] = useState(LOCATIONS[0] || "");
    const [season, setSeason] = useState("summer");
    const [year, setYear] = useState(2024);
    const [month, setMonth] = useState(7);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await predictSpecies({ location, season, year, month });
            setResult(data);
        } catch (err) {
            setError(err.message || "Failed to fetch insights");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="insights-page">
            <h1>AI / ML Insights</h1>
            <p className="text-muted">
                Select a location, season and date to see which tick species the model expects.
            </p>

            <form onSubmit={handleSubmit} className="form">
                <div className="form-header">
                    Model is trained on historical tick sightings (real + synthetic) for UK cities.
                </div>

                <div className="form-grid">
                    <div className="form-main">
                        <div className="form-row">
                            <label>
                                Location
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                >
                                    {LOCATIONS.map((loc) => (
                                        <option key={loc} value={loc}>
                                            {loc}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Season
                                <select
                                    value={season}
                                    onChange={(e) => setSeason(e.target.value)}
                                >
                                    {SEASONS.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="form-row">
                            <label>
                                Year
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    min="2010"
                                    max="2100"
                                />
                            </label>

                            <label>
                                Month
                                <input
                                    type="number"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    min="1"
                                    max="12"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="form-side">
                        <p className="side-title">What you&apos;ll see</p>
                        <p className="map-field-hint">
                            The model returns the most likely tick species for the chosen city and
                            time of year, along with confidence percentages. This can be used to
                            highlight species risk on the map or Learn page.
                        </p>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Predicting…" : "Get prediction"}
                    </button>
                </div>
            </form>

            {error && <p className="status-error">{error}</p>}

            {result && (
                <div className="insights-result">
                    <h2>
                        Prediction for {result.location} in {result.season} {result.year}
                    </h2>

                    {result.predictions && result.predictions.length > 0 ? (
                        <ul>
                            {result.predictions.map((p) => (
                                <li key={p.species}>
                                    <strong>{p.species}</strong>{" "}
                                    <span>{(p.probability * 100).toFixed(1)}%</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No predictions returned.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default InsightsPage;
