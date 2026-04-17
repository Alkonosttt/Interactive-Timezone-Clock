import { useState } from "react";
import WorldMap from "./components/worldmap";

export default function App() {
  const [selectedOffset, setSelectedOffset] = useState(0);


  // clicking a zone on the map
  const handleZoneClick = (offset: number) => {
    setSelectedOffset(offset);
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "1.5rem" }}>
      <WorldMap
        selectedOffset={selectedOffset}
        onZoneClick={handleZoneClick}
      />
    </div>
  );
}