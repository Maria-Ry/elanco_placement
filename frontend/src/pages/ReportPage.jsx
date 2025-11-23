import { useState } from "react";
import { createSighting } from "../api";

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

    return (
        <div>
            <h2>Report a Sighting</h2>

            {error && <p className="status-error">{error}</p>}
            {success && <p className="status-success">{success}</p>}


            <form className="report-form" onSubmit={handleSubmit}>
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

                <label>
                    Latitude
                    <input
                        name="lat"
                        value={form.lat}
                        onChange={handleChange}
                        placeholder="51.5074"
                    />
                </label>

                <label>
                    Longitude
                    <input
                        name="lon"
                        value={form.lon}
                        onChange={handleChange}
                        placeholder="0.1278"
                    />
                </label>

                <label>
                    Notes
                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Describe where you found the tick..."
                        rows={3}
                    />
                </label>

                <button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
}

export default ReportPage;
