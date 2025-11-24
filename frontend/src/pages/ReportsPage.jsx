import { useState } from "react";
import { fetchRegionCounts, fetchTrends } from "../api";

function ReportsPage() {
    const [region, setRegion] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [groupBy, setGroupBy] = useState("month");

    const [regionData, setRegionData] = useState(null);
    const [trendsData, setTrendsData] = useState(null);

    const [loadingRegion, setLoadingRegion] = useState(false);
    const [loadingTrends, setLoadingTrends] = useState(false);
    const [error, setError] = useState("");

    async function handleLoadRegions() {
        setError("");
        setLoadingRegion(true);
        try {
            const data = await fetchRegionCounts({
                region: region || undefined,
                from: fromDate || undefined,
                to: toDate || undefined,
            });
            setRegionData(data);
        } catch (e) {
            setError(e.message || "Failed to load region counts");
        } finally {
            setLoadingRegion(false);
        }
    }

    async function handleLoadTrends() {
        setError("");
        setLoadingTrends(true);
        try {
            const data = await fetchTrends({
                groupBy,
                region: region || undefined,
                from: fromDate || undefined,
                to: toDate || undefined,
            });
            setTrendsData(data);
        } catch (e) {
            setError(e.message || "Failed to load trends");
        } finally {
            setLoadingTrends(false);
        }
    }

    const normaliseRegionRows = () => {
        if (!regionData) return [];
        if (Array.isArray(regionData)) return regionData;

        return Object.entries(regionData).map(([name, value]) => ({
            region: name,
            count: value,
        }));
    };

    const normaliseTrendRows = () => {
        if (!trendsData) return [];
        if (Array.isArray(trendsData)) return trendsData;

        return Object.entries(trendsData).map(([period, value]) => ({
            period,
            count: value,
        }));
    };

    const regionRows = normaliseRegionRows();
    const trendRows = normaliseTrendRows();
    const totalSightings = regionRows.reduce(
        (sum, r) => sum + (Number(r.count) || 0),
        0
    );

    return (
        <div className="content reports-page">
            <header className="page-header">
                <div>
                    <h2>Insights & Reports</h2>
                    <p>Explore tick activity by region and over time.</p>
                </div>

                <div className="group-toggle">
                    <span className="group-toggle-label">Trend granularity</span>
                    <div className="group-toggle-pills">
                        <button
                            className={
                                groupBy === "week" ? "pill pill-active" : "pill"
                            }
                            onClick={() => setGroupBy("week")}
                        >
                            Weekly
                        </button>
                        <button
                            className={
                                groupBy === "month" ? "pill pill-active" : "pill"
                            }
                            onClick={() => setGroupBy("month")}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
            </header>

            <section className="filters-card">
                <div className="filters-row">
                    <label>
                        Region
                        <input
                            type="text"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            placeholder="e.g. Scotland"
                        />
                    </label>

                    <label>
                        From
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </label>

                    <label>
                        To
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </label>

                    <div className="filters-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setRegion("");
                                setFromDate("");
                                setToDate("");
                            }}
                        >
                            Clear
                        </button>

                        <button
                            className="btn-primary"
                            onClick={() => {
                                handleLoadRegions();
                                handleLoadTrends();
                            }}
                            disabled={loadingRegion || loadingTrends}
                        >
                            {loadingRegion || loadingTrends ? "Loading…" : "Run report"}
                        </button>
                    </div>
                </div>
                {error && <p className="status-error">{error}</p>}
            </section>

            <section className="reports-grid">
                <article className="reports-card">
                    <h3>Regions overview</h3>
                    <p className="card-subtitle">
                        Distribution of recorded tick sightings by region.
                    </p>

                    {loadingRegion && <p className="loading-text">Loading…</p>}

                    {!loadingRegion && regionRows.length === 0 && (
                        <p className="muted">No data yet. Run a report to see results.</p>
                    )}

                    {regionRows.length > 0 && (
                        <>
                            <div className="kpi-row">
                                <div className="kpi">
                                    <span className="kpi-label">Total sightings</span>
                                    <span className="kpi-value">{totalSightings}</span>
                                </div>
                                <div className="kpi">
                                    <span className="kpi-label">Regions covered</span>
                                    <span className="kpi-value">{regionRows.length}</span>
                                </div>
                            </div>

                            <ul className="region-list">
                                {regionRows.map((r, idx) => (
                                    <li key={idx} className="region-row">
                                        <span className="region-name">
                                            {r.region || r.name || "Unknown"}
                                        </span>
                                        <span className="region-count">
                                            {r.count ?? r.total ?? 0}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </article>

                <article className="reports-card">
                    <h3>Trends over time</h3>
                    <p className="card-subtitle">
                        See how tick sightings change across {groupBy === "week" ? "weeks" : "months"}.
                    </p>

                    {loadingTrends && <p className="loading-text">Loading…</p>}

                    {!loadingTrends && trendRows.length === 0 && (
                        <p className="muted">No trend data yet. Run a report.</p>
                    )}

                    {trendRows.length > 0 && (
                        <div className="trend-list">
                            {trendRows.map((row, idx) => (
                                <div key={idx} className="trend-row">
                                    <div className="trend-period">
                                        <span className="trend-period-label">
                                            {row.period || row.bucket || "Period"}
                                        </span>
                                    </div>
                                    <div className="trend-bar-wrapper">
                                        <div
                                            className="trend-bar"
                                            style={{
                                                "--bar-width":
                                                    (Number(row.count || row.total || 0) || 0) + 10 + "px",
                                            }}
                                        />
                                    </div>
                                    <span className="trend-count">
                                        {row.count ?? row.total ?? 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            </section>
        </div>
    );
}

export default ReportsPage;
