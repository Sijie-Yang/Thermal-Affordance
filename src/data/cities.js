import manifest from "../../static/data/cities.json"

export const CITIES = manifest.cities.map(city => ({
  id: city.city,
  label: city.label,
  center: city.center,
  zoom: city.zoom,
  nPoints: city.n_points,
  nHex: city.n_hex,
  download: city.download,
}))
export const ALL_DOWNLOAD = manifest.download
export const formatCount = value => value.toLocaleString("en-US")
export const formatSize = bytes => `${(bytes / 1000000).toFixed(1)} MB`
