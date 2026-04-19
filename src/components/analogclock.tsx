import { useCallback, useEffect, useState } from "react";
import { useClockDrag } from "../hooks/useDrag";

interface Props {
  // 0–23
  hour: number;
  // 0–59
  minute: number;
  onHourChange: (hour: number) => void;
}

const CX = 150, CY = 150, R = 120;

function hourHandEndpoint(hour: number, minute: number, second: number) {
  // 30 deg/hour, 0.5 deg/min, 0.008 deg/sec
  const totalDeg = ((hour % 12) / 12) * 360 + (minute / 60) * 30 + (second / 3600) * 30;
  const rad = (totalDeg - 90) * (Math.PI / 180);
  return {
    x: CX + Math.cos(rad) * R * 0.55,
    y: CY + Math.sin(rad) * R * 0.55,
  };
}

function minuteHandEndpoint(minute: number, second: number) {
  // minute hand moves 6 deg/min, 0.1°/sec
  const totalDeg = (minute / 60) * 360 + (second / 60) * 6;
  const rad = (totalDeg - 90) * (Math.PI / 180);
  return {
    x: CX + Math.cos(rad) * R * 0.8,
    y: CY + Math.sin(rad) * R * 0.8,
  };
}

function formatTime(hour: number, minute: number) {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

// auxillary clocks

function StaticClock({
  hour,
  minute,
  second,
  label,
  small = false,
}: {
  hour: number;
  minute: number;
  second: number;
  label: string;
  small?: boolean;
}) {
  const scale = small ? 0.7 : 1;
  const hp = hourHandEndpoint(hour, minute, second);
  const mp = minuteHandEndpoint(minute, second);

  return (
    <div style={{ textAlign: "center", opacity: 0.85 }}>
      <div style={{ fontSize: 12, marginBottom: 4, color: "#666" }}>{label}</div>
      <svg
        viewBox={`0 0 ${CX * 2} ${CY * 2 + 24}`}
        style={{ width: CX * 2 * scale, height: CY * 2 * scale + 24, userSelect: "none" }}
      >
        <circle cx={CX} cy={CY} r={R} fill="white" stroke="#ddd" strokeWidth={1.5} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
          return (
            <line key={i}
              x1={CX + Math.cos(a) * (R - 8)} y1={CY + Math.sin(a) * (R - 8)}
              x2={CX + Math.cos(a) * R}        y2={CY + Math.sin(a) * R}
              stroke="#ccc" strokeWidth={1.5}
            />
          );
        })}
        <line x1={CX} y1={CY} x2={mp.x} y2={mp.y} stroke="#888" strokeWidth={2} strokeLinecap="round" />
        <line x1={CX} y1={CY} x2={hp.x} y2={hp.y} stroke="#bbb" strokeWidth={3} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={4} fill="#999" />
        <text x={CX} y={CY + R + 18} textAnchor="middle" fontSize={13} fill="#666">
          {formatTime(hour, minute)}
        </text>
      </svg>
    </div>
  );
}

// main clock

function MainClock({
  hour,
  minute,
  second,
  onHourChange,
}: {
  hour: number;
  minute: number;
  second: number;
  onHourChange: (hour: number) => void;
}) {
  const handleAngle = useCallback((deg: number) => {
    const rawHour = Math.round((deg / 360) * 12) % 12;
    const isAfternoon = hour >= 12;
    onHourChange(isAfternoon ? rawHour + 12 : rawHour);
  }, [hour, onHourChange]);

  const drag = useClockDrag({ x: CX, y: CY }, handleAngle);
  const hp = hourHandEndpoint(hour, minute, second);
  const mp = minuteHandEndpoint(minute, second);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 12, marginBottom: 4, color: "#666" }}>local time</div>
      <svg
        viewBox={`0 0 ${CX * 2} ${CY * 2 + 24}`}
        style={{ width: 300, userSelect: "none" }}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
      >
        <circle cx={CX} cy={CY} r={R} fill="white" stroke="#ddd" strokeWidth={2} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
          return (
            <line key={i}
              x1={CX + Math.cos(a) * (R - 8)} y1={CY + Math.sin(a) * (R - 8)}
              x2={CX + Math.cos(a) * R}        y2={CY + Math.sin(a) * R}
              stroke="#333" strokeWidth={2}
            />
          );
        })}
        <line x1={CX} y1={CY} x2={mp.x} y2={mp.y} stroke="#888" strokeWidth={2} strokeLinecap="round" />
        <line
          x1={CX} y1={CY} x2={hp.x} y2={hp.y}
          stroke="#e15759" strokeWidth={4} strokeLinecap="round"
          style={{ cursor: "grab" }}
          onPointerDown={drag.onPointerDown}
        />
        <circle cx={CX} cy={CY} r={5} fill="#333" />
        <text x={CX} y={CY + R + 18} textAnchor="middle" fontSize={13}>
          {formatTime(hour, minute)}
        </text>
      </svg>
    </div>
  );
}

// final exported component

export default function AnalogClock({ hour, minute, onHourChange }: Props) {
  const [seconds, setSeconds] = useState(new Date().getSeconds());

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(new Date().getSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const prevHour = (hour - 1 + 24) % 24;
  const nextHour = (hour + 1) % 24;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
      <StaticClock
        hour={prevHour}
        minute={minute}
        second={seconds}
        label="Previous Zone"
        small
      />
      <MainClock
        hour={hour}
        minute={minute}
        second={seconds}
        onHourChange={onHourChange}
      />
      <StaticClock
        hour={nextHour}
        minute={minute}
        second={seconds}
        label="Next Zone"
        small
      />
    </div>
  );
}