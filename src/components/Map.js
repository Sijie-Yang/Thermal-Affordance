import React, { useEffect, useRef, useState } from "react"
import { withPrefix } from "gatsby"
import styled from "styled-components"
import { CITIES, formatCount } from "../data/cities"
import { colorScale, percentileRank } from "../data/map-utils.mjs"

const MapContainer = styled.div`
  width: 100%; height: 100%; position: relative; background: #edf1f4;
  .maplibregl-ctrl-group button { width: 44px; height: 44px; }
  .maplibregl-ctrl-attrib { font-size: 10px; }
`
const Status = styled.div`
  position: absolute; inset: 0; z-index: 4; display: grid; place-content: center;
  text-align: center; padding: 24px; background: #edf1f4ee; color: #34465a;
  button { margin: 12px auto 0; }
`
const SmallButton = styled.button`
  min-height: 44px; padding: 8px 12px; background: #fff; border: 1px solid #cfd7e0;
  border-radius: 5px; cursor: pointer; color: #155eae; font-size: 13px;
  &:hover { background: #edf3fa; }
`
const Legend = styled.div`
  position: absolute; left: 12px; bottom: 32px; z-index: 2; width: 290px;
  max-width: calc(100% - 24px); padding: 12px 14px; background: #fffffff5;
  border: 1px solid #dde3e9; border-radius: 8px; font-size: 12px; color: #465567;
  strong { color: #152639; font-size: 13px; }
  .bar { height: 10px; border-radius: 3px; margin: 8px 0 4px; border: 1px solid #0000000a; }
  .ticks { display: flex; justify-content: space-between; }
  p { margin: 6px 0 0; line-height: 1.4; }
`
const Info = styled.aside`
  position: absolute; top: 12px; left: 12px; z-index: 3; width: 280px;
  max-width: calc(100% - 80px); background: #fff; border: 1px solid #dce2e9;
  border-radius: 8px; padding: 12px 16px; box-shadow: 0 4px 20px #12243715;
  font-size: 13px; line-height: 1.5;
  header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  h3 { font-size: 14px; margin: 0; }
  dl { margin: 8px 0 0; }
  dl > div { display: flex; justify-content: space-between; gap: 12px; }
  dt { color: #586577; }
  dd { font-weight: 600; margin: 0; }
  p { margin: 6px 0 0; color: #586577; font-size: 12px; }
`
const Notice = styled.div`
  position: absolute; bottom: 6px; left: 12px; right: 12px; z-index: 3;
  padding: 8px 12px; font-size: 12px; color: #663d0b; background: #fff4dc;
`
const Inspect = styled(SmallButton)`
  position: absolute; right: 12px; bottom: 34px; z-index: 2;
  @media (max-width: 600px) { top: 160px; bottom: auto; width: 44px; padding: 0; font-size: 0;
    &::after { content: '⌖'; font-size: 22px; }
  }
`

const SOURCE = 'vata-data'
const DATA_LAYER = 'vata-layer'
const OUTLINE = 'vata-outline'
const BASEMAP = 'https://tiles.openfreemap.org/styles/positron'
const FALLBACK_STYLE = { version: 8, sources: {}, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#e8edf1' } }] }
const cache = new Map()
let scriptPromise

async function fetchJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`Data request failed (${response.status})`)
    return await response.json()
  } finally { clearTimeout(timer) }
}

function loadLibrary() {
  if (window.maplibregl) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  const href = withPrefix('/maplibre/maplibre-gl.css')
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'; link.href = href; document.head.appendChild(link)
  }
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const fail = () => {
      clearTimeout(timer)
      try { script.remove() } catch { /* already detached */ }
      scriptPromise = null
      reject(new Error('Map library could not load.'))
    }
    const timer = setTimeout(fail, 20000)
    script.src = withPrefix('/maplibre/maplibre-gl.js')
    script.async = true
    script.onload = () => { clearTimeout(timer); resolve() }
    script.onerror = fail
    document.body.appendChild(script)
  })
  return scriptPromise
}

function getData(city, layer) {
  const key = `${city}/${layer}`
  if (cache.has(key)) {
    const entry = cache.get(key)
    cache.delete(key); cache.set(key, entry)
    return entry
  }
  const suffix = layer === 'points' ? 'points.json' : 'hex.geojson'
  const promise = fetchJson(withPrefix(`/data/${city}_VATA_${suffix}`)).then(raw => {
    const values = layer === 'points' ? raw.map(row => row[2]) : raw.features.map(feature => feature.properties.VATA)
    const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
    if (!sorted.length) throw new Error('No valid scores are available for this layer.')
    return { raw, sorted }
  }).catch(error => { if (cache.get(key) === promise) cache.delete(key); throw error })
  cache.set(key, promise)
  // Bound memory on mobile; retain the eight most recently used city/layer files.
  if (cache.size > 8) cache.delete(cache.keys().next().value)
  return promise
}

function toGeoJSON(raw, layer) {
  return layer === 'hex' ? raw : {
    type: 'FeatureCollection',
    features: raw.map(([longitude, latitude, VATA]) => ({
      type: 'Feature', properties: { VATA }, geometry: { type: 'Point', coordinates: [longitude, latitude] },
    })),
  }
}

function safeRemoveMap(instance) {
  if (!instance) return
  try {
    const host = instance.getContainer?.()
    if (host?.isConnected) instance.remove()
  } catch { /* React already detached the container (Fast Refresh / unmount). */ }
}

function applyLayer(instance, geojson, layer, paint, sameLayer) {
  if (!sameLayer) {
    if (instance.getLayer(OUTLINE)) instance.removeLayer(OUTLINE)
    if (instance.getLayer(DATA_LAYER)) instance.removeLayer(DATA_LAYER)
    if (instance.getSource(SOURCE)) instance.removeSource(SOURCE)
    instance.addSource(SOURCE, { type: 'geojson', data: geojson })
    instance.addLayer({ id: DATA_LAYER, source: SOURCE, type: layer === 'hex' ? 'fill' : 'circle', paint: layer === 'hex'
      ? { 'fill-color': paint, 'fill-opacity': 0.8 }
      : { 'circle-color': paint, 'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 1.5, 12, 2.8, 15, 4.5], 'circle-opacity': 0.85 },
    })
    if (layer === 'hex') instance.addLayer({ id: OUTLINE, source: SOURCE, type: 'line', paint: { 'line-color': '#fff', 'line-width': 0.4, 'line-opacity': 0.5 } })
  } else {
    if (geojson) instance.getSource(SOURCE).setData(geojson)
    instance.setPaintProperty(DATA_LAYER, layer === 'hex' ? 'fill-color' : 'circle-color', paint)
  }
}

export default function MapComponent({ city = 'singapore', layer = 'points', scale = 'absolute', resetKey = 0 }) {
  const container = useRef(null)
  const map = useRef(null)
  const active = useRef(null)
  const pinned = useRef(false)
  const currentCity = useRef(city)
  const inspectAt = useRef(null)
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState('Loading map…')
  const [error, setError] = useState(false)
  const [notice, setNotice] = useState('')
  const [info, setInfo] = useState(null)
  const [ramp, setRamp] = useState(colorScale([], 'absolute'))
  const [retry, setRetry] = useState(0)
  currentCity.current = city

  useEffect(() => {
    let cancelled = false
    let instance
    let observer
    let startupTimer
    setReady(false); setError(false); setStatus('Loading map…'); setNotice('')
    const start = async () => {
      try {
        await loadLibrary()
        if (cancelled) return
        const meta = CITIES.find(item => item.id === currentCity.current) || CITIES[0]
        // Start with a local background, so unavailable basemap services cannot hide the data.
        instance = new window.maplibregl.Map({ container: container.current, style: FALLBACK_STYLE, center: meta.center, zoom: meta.zoom, minZoom: 2, maxZoom: 19, attributionControl: true })
        map.current = instance
        instance.addControl(new window.maplibregl.NavigationControl(), 'top-right')
        instance.getCanvas().setAttribute('aria-label', 'Thermal affordance map. Use arrow keys to pan and plus or minus to zoom.')
        startupTimer = setTimeout(() => {
          if (!cancelled) { setError(true); setStatus('The map is taking too long to start. You can retry or download the data below.') }
        }, 25000)
        instance.once('load', async () => {
          try {
            const style = await fetchJson(BASEMAP)
            if (cancelled) return
            instance.once('style.load', () => { if (!cancelled) { clearTimeout(startupTimer); setReady(true) } })
            instance.setStyle(style, { diff: false })
          } catch {
            if (!cancelled) {
              clearTimeout(startupTimer)
              setNotice('Basemap unavailable. VATA data is shown on a plain background.')
              setReady(true)
            }
          }
        })
        instance.on('error', () => { if (!cancelled) setNotice('Some map resources could not load. Retry the map if the background or data is incomplete.') })
        const inspect = (point, pin = false) => {
          if (!active.current || !instance.getLayer(DATA_LAYER)) return
          if (!pin && pinned.current) return
          const features = instance.queryRenderedFeatures([[point.x - 5, point.y - 5], [point.x + 5, point.y + 5]], { layers: [DATA_LAYER] })
          const feature = features[0]
          instance.getCanvas().style.cursor = feature ? 'pointer' : ''
          if (!feature) {
            if (pin) pinned.current = false
            if (!pinned.current) setInfo(null)
            return
          }
          const data = active.current
          const value = Number(feature.properties.VATA)
          const coords = feature.geometry.type === 'Point' ? feature.geometry.coordinates : null
          if (pin) pinned.current = true
          setInfo({ value, coords, n: Number(feature.properties.n), percentile: percentileRank(data.sorted, value), city: data.city, layer: data.layer, pinned: pinned.current })
        }
        inspectAt.current = () => {
          const canvas = instance.getCanvas()
          inspect({ x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 }, true)
        }
        instance.on('mousemove', event => inspect(event.point))
        instance.on('click', event => inspect(event.point, true))
        const leave = () => { if (!pinned.current) setInfo(null) }
        instance.getCanvas().addEventListener('mouseleave', leave)
        observer = new ResizeObserver(() => instance.resize())
        observer.observe(container.current)
      } catch {
        if (!cancelled) { setError(true); setStatus('The map could not start. Downloads remain available below.') }
      }
    }
    start()
    return () => {
      cancelled = true
      clearTimeout(startupTimer)
      observer?.disconnect()
      safeRemoveMap(instance)
      map.current = null
      active.current = null
      inspectAt.current = null
    }
  }, [retry])

  useEffect(() => {
    if (!ready || !map.current) return
    let cancelled = false
    let stopWaiting = () => {}
    const instance = map.current
    pinned.current = false; setInfo(null); setError(false)
    setStatus(`Loading ${layer === 'hex' ? 'hexagons' : 'points'}…`)
    const previous = active.current
    // Hide the previous city while the next request is pending; never show mislabeled data.
    if (previous?.city !== city || previous?.layer !== layer) {
      active.current = null
      if (instance.getLayer(DATA_LAYER)) instance.setLayoutProperty(DATA_LAYER, 'visibility', 'none')
      if (instance.getLayer(OUTLINE)) instance.setLayoutProperty(OUTLINE, 'visibility', 'none')
    }
    getData(city, layer).then(async ({ raw, sorted }) => {
      if (cancelled) return
      const nextRamp = colorScale(sorted, scale)
      const sameLayer = previous?.layer === layer && !!instance.getSource(SOURCE)
      const sameData = sameLayer && previous?.city === city
      // setData is asynchronous in the bundled MapLibre version. Keep the loading
      // cover until its worker has indexed the new data, not just until fetch ends.
      const sourceReady = sameData ? Promise.resolve() : new Promise((resolve, reject) => {
        const cleanup = () => { clearTimeout(timer); instance.off('sourcedata', loaded) }
        const loaded = event => {
          if (event.sourceId === SOURCE && instance.getSource(SOURCE) && instance.isSourceLoaded(SOURCE)) {
            cleanup(); resolve()
          }
        }
        const timer = setTimeout(() => { cleanup(); reject(new Error('Map data processing timed out')) }, 20000)
        stopWaiting = () => { cleanup(); resolve() }
        instance.on('sourcedata', loaded)
      })
      applyLayer(instance, sameData ? null : toGeoJSON(raw, layer), layer, nextRamp.paint, sameLayer)
      await sourceReady
      if (cancelled) return
      instance.setLayoutProperty(DATA_LAYER, 'visibility', 'visible')
      if (instance.getLayer(OUTLINE)) instance.setLayoutProperty(OUTLINE, 'visibility', 'visible')
      active.current = { city, layer, sorted }
      setRamp(nextRamp); setStatus('')
    }).catch(() => {
      stopWaiting()
      if (!cancelled) { setError(true); setStatus('This dataset could not load. Retry or use the download links below.') }
    })
    return () => { cancelled = true; stopWaiting() }
  }, [ready, city, layer, scale])

  useEffect(() => {
    if (!ready || !map.current) return
    const meta = CITIES.find(item => item.id === city) || CITIES[0]
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    map.current.easeTo({ center: meta.center, zoom: meta.zoom, bearing: 0, pitch: 0, duration: reduced ? 0 : 700 })
  }, [ready, city, resetKey])

  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') { pinned.current = false; setInfo(null) } }
    container.current?.addEventListener('keydown', escape)
    const element = container.current
    return () => element?.removeEventListener('keydown', escape)
  }, [])

  const cityLabel = CITIES.find(item => item.id === city)?.label
  return <MapContainer>
    <div ref={container} style={{ width: '100%', height: '100%' }} />
    {status && <Status role={error ? 'alert' : 'status'}>
      <span>{status}</span>
      {error && <SmallButton type="button" onClick={() => setRetry(value => value + 1)}>Retry map</SmallButton>}
    </Status>}
    {!status && <>
      <Legend aria-label={`${scale === 'absolute' ? 'Absolute' : 'Within city'} color legend`}>
        <strong>{scale === 'absolute' ? 'Absolute VATA' : `Within ${cityLabel}`}</strong>
        <div className="bar" style={{ background: ramp.gradient }} />
        <div className="ticks"><span>{ramp.min.toFixed(2)}{scale === 'within-city' ? ' · P5' : ''}</span><span>{ramp.max.toFixed(2)}{scale === 'within-city' ? ' · P95' : ''}</span></div>
        <p>{scale === 'absolute' ? 'Low < 1.76 · Moderate 1.76–3.24 · High ≥ 3.24' : 'Local percentiles · not a cross-city color scale'}</p>
        <p>{layer === 'hex' ? 'Mean per hexagon' : 'Score per image'} · higher = greater affordance</p>
      </Legend>
      <Inspect type="button" onClick={() => inspectAt.current?.()} aria-label="Inspect map center" title="Inspect map center">Inspect center</Inspect>
    </>}
    {info && !status && <Info aria-label="Feature information" aria-live={info.pinned ? 'polite' : 'off'}>
      <header><h3>{cityLabel} · {info.layer === 'hex' ? 'Hexagon' : 'Point'}</h3>{info.pinned && <SmallButton type="button" aria-label="Close pinned information" onClick={() => { pinned.current = false; setInfo(null) }}>×</SmallButton>}</header>
      <dl>
        <div><dt>{info.layer === 'hex' ? 'Mean VATA' : 'VATA'}</dt><dd>{info.value.toFixed(3)}</dd></div>
        {info.coords ? <><div><dt>Longitude</dt><dd>{info.coords[0].toFixed(6)}</dd></div><div><dt>Latitude</dt><dd>{info.coords[1].toFixed(6)}</dd></div></> : <><div><dt>Points in cell</dt><dd>{formatCount(info.n)}</dd></div><div><dt>City percentile</dt><dd>{info.percentile.toFixed(1)}%</dd></div></>}
      </dl>
      {info.layer === 'hex' && <p>Percentile among this city's hex means.</p>}
      <p>{scale === 'absolute' ? 'Absolute color scale' : 'Within-city color scale'} · {info.pinned ? 'Pinned · close to inspect another' : 'Click or tap to pin'}</p>
    </Info>}
    {notice && !status && <Notice>{notice} <button type="button" onClick={() => setRetry(value => value + 1)}>Retry</button></Notice>}
  </MapContainer>
}
