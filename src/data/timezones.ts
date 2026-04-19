const ZONE_COLOR_INDEX: Record<number, number> = {
    [-12]: 0, [-11]: 1, [-10]: 0, [-9.5]: 1, [-9]: 2,
    [-8]: 0,  [-7]: 1,  [-6]: 0,  [-5]: 1,  [-4.5]: 0,
    [-4]: 2,  [-3.5]: 1,[-3]: 0,  [-2]: 1,  [-1]: 0,
    [0]: 1,   [1]: 0,   [2]: 1,   [3]: 0,   [3.5]: 1,
    [4]: 2,   [4.5]: 0, [5]: 1,   [5.5]: 2, [5.75]: 0,
    [6]: 3,   [6.5]: 1, [7]: 0,   [8]: 1,   [8.75]: 0,
    [9]: 2,   [9.5]: 1, [10]: 0,  [10.5]: 2,[11]: 1,
    [11.5]: 0,[12]: 2,  [12.75]: 0,[13]: 1, [14]: 0,
};

export const ZONE_COLORS = ["#FFA02E", "#FFEF91", "#9AD872", "#468432"];

export function getZoneColor(zone: number): string {
    const index = ZONE_COLOR_INDEX[zone] ?? 0;
    return ZONE_COLORS[index];
}

export function offsetToHour(offset: number): number {
    const utcHour = new Date().getUTCHours();
    return ((utcHour + Math.round(offset)) % 24 + 24) % 24;
}

export function hourToOffset(displayedHour: number): number {
    const utcHour = new Date().getUTCHours();
    const difference = displayedHour - utcHour;
    return ((difference + 24) % 24 <= 12) ? difference : difference - 24;
}