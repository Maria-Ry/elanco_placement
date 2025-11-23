const API_BASE = "http://127.0.0.1:5000/api";

export async function fetchSightings() {
  const res = await fetch(`${API_BASE}/sightings`);
  if (!res.ok) {
    throw new Error("Failed to load sightings");
  }
  return res.json();
}

export async function createSighting(payload) {
  const res = await fetch(`${API_BASE}/sightings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.details || "Failed to create sighting");
  }

  return res.json();
}


export async function fetchRegionCounts({ region, from, to } = {}) {
  const params = new URLSearchParams();
  if (region) params.set("region", region);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const url = `${API_BASE}/reports/regions${params.toString() ? `?${params}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load region counts");
  }
  return res.json();
}

export async function fetchTrends({ groupBy = "month", region, from, to } = {}) {
  const params = new URLSearchParams();
  if (groupBy) params.set("group_by", groupBy);
  if (region) params.set("region", region);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const url = `${API_BASE}/reports/trends${params.toString() ? `?${params}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load trends");
  }
  return res.json();
}