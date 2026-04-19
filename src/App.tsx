import { useState } from "react";
import WorldMap from "./components/worldmap";
import AnalogClock from "./components/analogclock";
import { hourToOffset, offsetToHour } from "./data/timezones";

export default function App() {
  // main clock = user's device time and time zone
  const getDeviceStandardOffset = () => {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
    const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
    const standardOffsetMinutes = Math.max(jan, jul);
    return -standardOffsetMinutes / 60;
  };

  const [selectedOffset, setSelectedOffset] = useState(() => getDeviceStandardOffset());
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [currentMinute] = useState(() => new Date().getMinutes());


  // clicking a zone on the map
  const handleZoneClick = (offset: number) => {
    setSelectedOffset(offset);
  };

  // dragging the clock hand
  const handleHourChange = (hour: number) => {
    setCurrentHour(hour);
    setSelectedOffset(hourToOffset(hour));
  }
  
  // AM-PM toggle button
  const toggleAmPm = () => {
  const newHour = currentHour >= 12
    ? currentHour - 12
    : currentHour + 12;
  handleHourChange(newHour);
  };

  return (
    <div style={{ display: "flex", flexDirection:"column", gap: "2rem", padding: "1.5rem" }}>
      <WorldMap
        selectedOffset={selectedOffset}
        onZoneClick={handleZoneClick}
      />
      <AnalogClock
      hour={currentHour}
      minute={currentMinute}
      onHourChange={handleHourChange}
      />
      <button onClick={toggleAmPm}>
        {currentHour >= 12 ? "PM" : "AM"}
      </button>
    </div>
    
  );
}