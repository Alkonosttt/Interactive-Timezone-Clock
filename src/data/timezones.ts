// colors for time zones, repeating
export const ZONE_COLORS = ["#FFA02E", "#FFEF91", "#9AD872", "#468432"];

export function getZoneColor(offsetHours: number): string {
    // offset is always positive for coloring
    const index = ((offsetHours % 4) + 4) % 4;
    return ZONE_COLORS[index];
}

// determines the time based on the UTC offset
export function offsetToHour(offset: number): number {
    const utcHour = new Date().getUTCHours();
    return((utcHour + offset) % 24 + 24) % 24;
}

// finds the matching UTC offset based on the local hour on the clock
export function hourToOffset(displayedHour: number): number {
    const utcHour = new Date().getUTCHours();
    const difference = displayedHour - utcHour;
    return ((difference + 24) % 24 <= 12) ? difference : difference - 24;
}