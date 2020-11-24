export const lerp = (a, b, n) => (1 - n) * a + n * b;
export const clamp = (val, min, max) => Math.max(Math.min(val, min), max);