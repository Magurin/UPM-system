import React, { useState } from "react";
import { ProfileDrawer } from "./components/ProfileDrawer";
import { DronesDrawer } from "./components/DronesDrawer";
import { FlightRequestsDrawer } from "./components/FlightRequestsDrawer";
import { MapContainer } from "./components/MapContainer";
import ZonesLayer from "./components/ZonesLayer";
import TrackLayer from "./components/TrackLayer";
import CoordinatesControl from "./components/CoordinatesControl";
import { Sidebar } from "./components/Sidebar";
import "./index.css";

export function App() {
  const [showProfile,        setShowProfile]        = useState(false);
  const [showDrones,         setShowDrones]         = useState(false);
  const [showFlightRequests, setShowFlightRequests] = useState(false);

  // ─── Открытия ──────────────────────────────────────────────────
  const openProfile = () => {
    setShowDrones(false);
    setShowFlightRequests(false);
    setShowProfile(true);
  };

  const openDrones = () => {
    setShowProfile(false);
    setShowFlightRequests(false);
    setShowDrones(true);
  };

  const openFlightRequests = () => {
    setShowProfile(false);
    setShowDrones(false);
    setShowFlightRequests(true);
  };

  // ─── Закрытия ──────────────────────────────────────────────────
  const closeProfile        = () => setShowProfile(false);
  const closeDrones         = () => setShowDrones(false);
  const closeFlightRequests = () => setShowFlightRequests(false);

  return (
    <div className="app">
      <Sidebar
        onProfileClick={openProfile}
        onDronesClick={openDrones}
        onFlightRequestsClick={openFlightRequests} // ← новый пункт меню
      />

      <div className="app__content">
        <MapContainer>
          <ZonesLayer />
          <TrackLayer />
          <CoordinatesControl />
        </MapContainer>
      </div>

      <ProfileDrawer
        isOpen={showProfile}
        onClose={closeProfile}
      />

      <DronesDrawer
        isOpen={showDrones}
        onClose={closeDrones}
      />

      <FlightRequestsDrawer         
        isOpen={showFlightRequests}
        onClose={closeFlightRequests}
      />
    </div>
  );
}