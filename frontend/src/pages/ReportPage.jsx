import { useState } from "react";
import { createSighting } from "../api";
import LocationPickerMap from "../components/LocationPickerMap";

function ReportPage() {
    const [form, setForm] = useState({
        species: "",
        region: "",
        lat: "",
        lon: "",
        date: "",
        notes: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    function handleLocationChange(coords) {
        if (!coords) {
            setForm((f) => ({
                ...f,
                lat: "",
                lon: "",
            }));
            return;
        }

        const { lat, lon } = coords;

        setForm((f) => ({
            ...f,
            lat: lat.toFixed(5),
            lon: lon.toFixed(5),
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.species || !form.date) {
            setError("Species and date are required.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...form,
                lat: form.lat ? parseFloat(form.lat) : null,
                lon: form.lon ? parseFloat(form.lon) : null,
            };

            await createSighting(payload);
            setSuccess("Sighting reported successfully!");

            setForm({
                species: "",
                region: "",
                lat: "",
                lon: "",
                date: "",
                notes: "",
            });
        } catch (err) {
            setError(err.message || "Failed to submit");
        } finally {
            setSubmitting(false);
        }
    }

    const mapValue =
        form.lat && form.lon
            ? { lat: parseFloat(form.lat), lon: parseFloat(form.lon) }
            : null;

    return (
        <div className="report-page">
            <header className="page-header">
                <h2>Report a Sighting</h2>
                <p>Help track tick activity by logging where and when you saw them.</p>
            </header>

            {error && <p className="status-error">{error}</p>}
            {success && <p className="status-success">{success}</p>}

            <form className="form" onSubmit={handleSubmit}>
                <div className="form-header">
                    <span>Fields marked * are required.</span>
                </div>

                <div className="form-grid">
                    <div className="form-main">
                        <label>
                            Species *
                            <input
                                name="species"
                                value={form.species}
                                onChange={handleChange}
                                placeholder="e.g. Ixodes ricinus"
                                required
                            />
                        </label>

                        <div className="form-row">
                            <label>
                                Date *
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Region / City
                                <input
                                    name="region"
                                    value={form.region}
                                    onChange={handleChange}
                                    placeholder="e.g. London"
                                />
                            </label>
                        </div>

                        <label>
                            Notes
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Behaviour, environment, weather, host animal, etc."
                            />
                        </label>
                    </div>

                    <div className="form-side">
                        <h3 className="side-title">Location on map (optional)</h3>
                        <p className="map-field-hint">
                            Click on the map to drop a pin. If you’re not sure, a rough area is still useful.
                        </p>

                        <LocationPickerMap value={mapValue} onChange={handleLocationChange} />

                        <div className="coords-preview">
                            <small>
                                Selected:{" "}
                                {form.lat && form.lon ? `${form.lat}, ${form.lon}` : "None"}
                            </small>
                        </div>
                    </div>

                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit sighting"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ReportPage;
