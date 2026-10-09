// Space the touch targets evenly along the heart, including the two tips.
// Equal parameter angles bunch up at the tips and are harder to touch.
const samples = Array.from({ length: 721 }, (_, i) => {
  const t = i / 720 * Math.PI * 2;
  return { x: 50 + 40 * Math.sin(t) ** 3, y: 48 - 2.5 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) };
});
const lengths = [0];
for (let i = 1; i < samples.length; i++) lengths.push(lengths[i - 1] + Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y));
export const heartPoints = Array.from({ length: 18 }, (_, i) => {
  const distance = i / 18 * lengths[lengths.length - 1];
  const end = Math.max(1, lengths.findIndex(length => length >= distance));
  const mix = (distance - lengths[end - 1]) / (lengths[end] - lengths[end - 1]);
  return { x: samples[end - 1].x + (samples[end].x - samples[end - 1].x) * mix, y: samples[end - 1].y + (samples[end].y - samples[end - 1].y) * mix };
});
