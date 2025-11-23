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
    throw new Error(data.error || "Failed to create sighting");
  }

  return res.json();
}
