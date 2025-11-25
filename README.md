# TickTracker UK - Elanco Placement Task (Backend + Frontend)

This repo contains a small **full-stack MVP** for a UK tick-sighting tracker, built for the Elanco placement technical exercise.

It implements:

- A **Python / Flask backend** that ingests tick sightings, stores them in a local database, exposes **search/filter endpoints**, and provides **aggregate reporting** (per region, over time), aligned with the backend brief.  
- A **React + Vite frontend** with an **interactive map**, a **reports/insights view**, aligned where possible with the frontend brief.

---

## 1. Repository Structure

```text
elanco_placement/
├─ backend/          # Flask, DB models, services, Alembic migrations, hydration scripts
├─ frontend/         # Vite + React single-page app
├─ data/             # Raw data and Jupyter notebooks
└─ README.md         # This file
```

---

## 2. Backend - TickTracker API (Flask)

### 2.1. Tech Stack

* **Language:** Python 3
* **Framework:** Flask
* **ORM:** SQLAlchemy
* **Migrations:** Alembic
* **DB:** SQLite (file-based, easy to run locally)

---

### 2.2. Architecture & Data Flow (Backend Task Alignment)

The backend is structured around a simple service-layer pattern:

* `backend/models/` - SQLAlchemy models  
  * e.g. `Sighting` with fields like `id`, `date`, `region`, `lat`, `lon`, `species`, `source`, and optional `notes`.

* `backend/services/` - business logic  
  * `sightings_service.py` - listing, filtering and creating new sightings.  
  * `reports_service.py` - aggregations over sightings for regions and time periods.  

* `backend/controllers/` - Flask blueprints  
  * `sightings` blueprint: CRUD/search over sighting records.  
  * `reports` blueprint: aggregate reporting endpoints.  
  * `insights` blueprint: ML/insights endpoints (hook for optional AI/ML extension).

* `backend/core/` - DB session, config, app wiring.  
* `backend/migrations/` - Alembic migrations for creating and evolving the `sightings` table.
* `backend/scripts/` - one-off scripts (e.g. hydrating the DB from the provided dataset).

**Data handling & ingestion**

* The app starts from a **raw dataset** hydrated into SQLite.
* During ingestion, the service normalises date/time formats
* `lat`, `lon`, `notes`, `source` columns added.

---

### 2.3. HTTP API Overview

Base URL (if differs, change in frontend/api.js):

* `http://127.0.0.1:5000` (default Flask port)

All endpoints are prefixed with `/api`.

---

#### 2.3.1. Sightings

Routes are defined in the `sightings` blueprint.

Base: `/api/sightings`

##### `GET /api/sightings`

List tick sightings with optional filters.

**Query parameters**

| Name       | Type   | Description                            | Required | Default        |
| ---------- | ------ | -------------------------------------- | -------- | -------------- |
| `region`   | string | Filter by region name                  | No       | All regions    |
| `from`     | string | Start date (YYYY-MM-DD, inclusive)     | No       | No lower bound |
| `to`       | string | End date (YYYY-MM-DD, inclusive)       | No       | No upper bound |

**Example**

```http
GET /api/sightings?region=London&from=2024-06-01&to=2024-07-01
```

Returns a JSON array of sightings, ordered by most recent first.

---

##### `POST /api/sightings`

Create a **new user-reported sighting** (used by the “Report a sighting” form on the frontend).

**Body (JSON)**

| Field       | Type   | Description                        | Required | Default     |
| ----------- | ------ | ---------------------------------- | -------- | ----------- |
| `date`      | string | Date of sighting (DD/MM/YYY)       | Yes      | -           |
| `lat`       | number | Latitude                           | No       | `null`      |
| `lon`       | number | Longitude                          | No       | `null`      |
| `region`    | string | Human-readable region / city name  | Yes      | -           |
| `species`   | string | Species or free-text label         | No       | `"unknown"` |
| `source`    | string | e.g. `"user"`, `"imported"`        | No       | `"user"`    |
| `notes`     | string | Free-text notes                    | No       | `null`      |

**Example**

```http
POST /api/sightings
Content-Type: application/json

{
  "date": "10/07/2024",
  "lat": 51.509865,
  "lon": -0.118092,
  "region": "London",
  "species": "Ixodes ricinus",
  "source": "user",
  "notes": "Found on dog after park walk"
}
```

**Validation & error handling**

* If required fields are missing or have invalid formats (e.g. bad date), a custom `ValidationError` is raised and a **400 Bad Request** with a helpful message is returned.
* DB failures are caught and returned as **500 Internal Server Error** with a generic error payload.

---

#### 2.3.2. Reports

Routes are defined in the `reports` blueprint.

Base: `/api/reports`

---

##### `GET /api/reports/regions`

Aggregate **counts per region** and (optionally) filter by date range and specific region.

**Query parameters**

| Name     | Type   | Description                           | Required | Default        |
| -------- | ------ | ------------------------------------- | -------- | -------------- |
| `region` | string | Filter aggregation to a single region | No       | All regions    |
| `from`   | string | Start date (YYYY-MM-DD, inclusive)    | No       | No lower bound |
| `to`     | string | End date (YYYY-MM-DD, inclusive)      | No       | No upper bound |

**Example**

```http
GET /api/reports/regions?from=2024-06-01&to=2024-07-01
```

Returns data shaped for the frontend map, e.g.

```json
[
  { "region": "London", "total": 42, "high": 10, "medium": 2, "low": 30 },
  { "region": "Manchester", "total": 13, "high": 5, "medium": 5, "low": 3 }
]
```

---

##### `GET /api/reports/timeline`

Returns **trend data over time** (e.g. weekly or monthly buckets) for a region or the whole UK.

**Query parameters**

| Name       | Type   | Description                           | Required | Default        |
| ---------- | ------ | ------------------------------------- | -------- | -------------- |
| `region`   | string | Filter to a single region             | No       | All regions    |
| `group_by` | string | `"week"` or `"month"`                 | No       | `"month"`      |
| `from`     | string | Start date (YYYY-MM-DD, inclusive)    | No       | No lower bound |
| `to`       | string | End date (YYYY-MM-DD, inclusive)      | No       | No upper bound |

Used by the frontend to show seasonal trends.

---

### 2.4. How the Backend Meets the Brief

From the **backend task**:

* **Data handling**
  * Imports raw data, normalises dates and region labels, and drops duplicates.
  * Uses SQLite + SQLAlchemy to handle realistic-scale datasets efficiently.

* **Search & filtering**
  * `GET /api/sightings` supports filters on **time range** and **region**.

* **Reporting**
  * `GET /api/reports/regions` → **number of sightings per region** with severity breakdown.
  * `GET /api/reports/timeline` → **trends over time** (weekly/monthly).

* **Error handling**
  * `utils/errors.py`. 
  * DB errors wrapped and returned with clean JSON error messages.

* **AI/ML (extension - hook ready)**
  * The backend is structured so you can plug a model (e.g. RandomForest) behind a `/api/insights/predict` endpoint, taking `(location, season, year, month)` and returning species/severity probabilities.  
  * The frontend has an **Insights page** wired for this (see below).

---

### 2.5. Running the Backend Locally

From project root:

```bash

# 1. Create and activate a virtualenv (recommended)
python -m venv .venv
source .venv/bin/activate          # On Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Apply DB migrations
alembic -c backend/alembic.ini upgrade head

# 4. Hydrate DB with data from the provided dataset
python -m backend.scripts.hydration_from_excel

# 4.1 OPTIONAL Hydrate DB with synthetic data
python -m backend.scripts.hydration_synthetic

# 5. Run the Flask app
python -m backend.app
```

Flask will start at `http://127.0.0.1:5000` by default.

---

## 3. Frontend - TickSight UI (React + Vite)

### 3.1. Tech Stack

* **Build tool:** Vite  
* **Framework:** React  
* **Routing / pages:** simple React router (SPA)  
* **Map:** `react-leaflet` + OpenStreetMap tiles for UK map visualisation  
* **Styling:** vanilla CSS with a dark theme and custom layout

---

### 3.2. Pages & Features (Frontend)

#### 3.2.1. Interactive Map Visualisation

* **`MapPage.jsx` + `RiskMap` component**
  * Uses **React Leaflet** to show a UK-centred map.
  * Fetches raw sightings from **`GET /api/sightings`**.
  * Shows **markers / circles** with:
    * colour based on **severity** (`low/medium/high`),
    * size based on **activity**.

This corresponds to the “interactive map” part of the frontend brief.

---

#### 3.2.2. Sighting Reports

A simple **Reports / Learn** area that uses the reporting endpoints:

* Aggregated **regions data** via `GET /api/reports/regions` for “which areas are riskier”.
* Aggregated **trends data** via `GET /api/reports/trends` for “how risk changes over time”.

These endpoints can be rendered as:

* tables of counts per region, and  
* simple line/bar charts showing seasonal or monthly trends.

---

#### 3.2.3. Report a Sighting - Form Page

A dedicated **“Report a sighting”** page with a form that collects:

* date,  
* region / location (with optional map click to set `lat` / `lon`),  
* species,  
* optional severity, image URL and notes.

The form:

* validates required fields client-side,
* shows **error / success** messages,
* on success, **POSTs** to `POST /api/sightings` and confirms to the user.

---

#### 3.2.4. Insights

* An **Insights page** allows the user to choose:
  * location (e.g. London, Glasgow),
  * season,
  * year and month.

* The page is wired to call a backend endpoint (e.g. `/api/insights/predict`) where a model lives, and then render the “most likely species” / risk result in the UI.

This provides the hook for the **AI/ML extension** mentioned in the backend task.

---

### 3.3. Running the Frontend Locally

From project root:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
```

By default, Vite serves the app on `http://localhost:5173`.

The frontend expects the backend API to be available at something like:

```js
// frontend/src/api.js
export const BASE_URL = "http://127.0.0.1:5000";
```

Make sure this matches the port where your Flask app is running.

---

## 4. Notes, Trade-offs & Future Improvements

* **Data ingestion**
  * For the purpose of the task, data is pulled from the provided file once.
  * In a production system this would be scheduled, monitored, and idempotent.

* **Validation & schema**
  * The MVP uses pragmatic validation and a single `Sighting` model.
  * With more time, the next steps would be:
    * a separate `Region` table with standardised codes,
    * a normalised `Species` lookup table,
    * stricter DB-level constraints and possibly JSON schema validation on requests.

* **Performance**
  * SQLite is perfectly adequate for the scope of this technical task.
  * For a production, I’d move to Postgres or similar.

* **Security & robustness**
  * For brevity, authentication/authorisation and rate-limiting are not implemented.
  * In a real system I’d add auth (e.g. JWT), input throttling, and better logging/observability.

* **ML Insights**
  * Currently designed as a plug-in layer.
  * Given more time, the ML side could include:
    * a suitable model for date -> location prediction,
    * proper train/validation split, cross-validation and calibration,
    * confidence intervals or risk bands exposed in the `/api/insights/predict` response.

---

