import { Routes, Route, Link } from "react-router-dom";
import MapPage from "./pages/MapPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import InsightsPage from "./pages/InsightsPage.jsx";

function App() {
    return (
        <div className="app">
            <header className="topbar">
                <div className="topbar-inner">
                    <h1>Tick Tracker</h1>
                    <nav>
                        <Link to="/">Map</Link>
                        <Link to="/report">Report a Sighting</Link>
                        <Link to="/reports">Reports</Link>
                        <Link to="/insights">AI / ML Insights</Link>
                    </nav>
                </div>
            </header>

            <main className="content">
                <Routes>
                    <Route path="/" element={<MapPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/report" element={<ReportPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/insights" element={<InsightsPage />} />
                    <Route path="*" element={<MapPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
