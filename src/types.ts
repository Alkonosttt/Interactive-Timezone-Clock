export interface TimezoneZone {
    // "UTC+3"
    id: string;
    // [-12; +14] 
    offsetHours: number;
    // display name
    label: string;
    // fill color for the map segment
    color: string;
}

export interface AppState {
    // currently selected UTC offset
    selectedOffset: number;
    // 0-23, chosen by clock or clicking the corresponding map segment
    currentHour: number;
}