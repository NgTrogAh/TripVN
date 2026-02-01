export function parseDurationToMs(input?: string): number {
    if (!input) return 0;
    const s = input.trim();
    if (/^\d+$/.test(s)) {
        return Number(s) * 1000;
    }
    const match = /^(\d+)\s*([smhd])$/i.exec(s);
    if (!match) return 0;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    switch (unit) {
        case 's':
            return value * 1000;
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        case 'd':
            return value * 24 * 60 * 60 * 1000;
        default:
            return 0;
    }
}