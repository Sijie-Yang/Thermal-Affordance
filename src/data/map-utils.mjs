export const ABSOLUTE_STOPS = [[0, '#b2182b'], [1.76, '#e4c4ca'], [2.5, '#f0f0f0'], [3.24, '#679bc1'], [5, '#053061']]
const QUANTILES = [0.05, 0.15, 0.5, 0.85, 0.95]
const COLORS = ['#67001f', '#b2182b', '#f0f0f0', '#2166ac', '#053061']

export function percentile(sorted, fraction) {
  if (!sorted.length) return 0
  const index = (sorted.length - 1) * fraction
  const lo = Math.floor(index)
  return sorted[lo] + (sorted[Math.ceil(index)] - sorted[lo]) * (index - lo)
}

export function percentileRank(sorted, value) {
  if (!sorted.length) return 0
  let lo = 0
  let hi = sorted.length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (sorted[mid] <= value) lo = mid + 1
    else hi = mid
  }
  return 100 * lo / sorted.length
}

export function colorScale(sorted, mode) {
  const raw = mode === 'within-city'
    ? QUANTILES.map((p, i) => [percentile(sorted, p), COLORS[i]])
    : ABSOLUTE_STOPS
  // MapLibre requires strictly increasing interpolation stops, even with ties.
  const stops = raw.filter((stop, i) => i === 0 || stop[0] > raw[i - 1][0])
  if (stops.length === 1) stops[0] = [stops[0][0], '#f0f0f0']
  const min = stops[0][0]
  const max = stops[stops.length - 1][0]
  return {
    stops,
    min,
    max,
    paint: stops.length === 1 ? stops[0][1] : ['interpolate', ['linear'], ['get', 'VATA'], ...stops.flat()],
    gradient: stops.length === 1 ? stops[0][1] : `linear-gradient(to right, ${stops.map(([value, color]) => `${color} ${(value - min) / (max - min) * 100}%`).join(', ')})`,
  }
}

export function readExplorerState(search, cities) {
  const params = new URLSearchParams(search)
  return {
    city: cities.some(city => city.id === params.get('city')) ? params.get('city') : cities[0].id,
    layer: params.get('layer') === 'hex' ? 'hex' : 'points',
    scale: params.get('scale') === 'within-city' ? 'within-city' : 'absolute',
  }
}
