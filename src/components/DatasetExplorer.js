import React, { useEffect, useRef, useState } from "react"
import { withPrefix } from "gatsby"
import styled from "styled-components"
import CitySelector from "./CitySelector"
import { ALL_DOWNLOAD, CITIES, formatCount, formatSize } from "../data/cities"
import { readExplorerState } from "../data/map-utils.mjs"

const Surface = styled.div`
  width: 100%;
  border: 1px solid #dce2e9;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 10px 32px #233a5010;
`
const Toolbar = styled.div`
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid #dce2e9;
  label, .control-label { display: block; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #586577; margin-bottom: 6px; }
  .city { flex: 1; min-width: 150px; }
  @media (max-width: 600px) { padding: 16px; gap: 12px 8px; .city { flex-basis: 100%; } }
`
const Group = styled.div`
  display: flex;
  padding: 3px;
  background: #edf1f5;
  border-radius: 6px;
  gap: 2px;
`
const Choice = styled.button`
  min-height: 44px;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  background: ${p => p.$active ? '#fff' : 'transparent'};
  color: ${p => p.$active ? '#155eae' : '#465567'};
  box-shadow: ${p => p.$active ? '0 1px 4px #142a4015' : 'none'};
  cursor: pointer;
  &:hover { background: #fff; }
`
const Action = styled.button`
  min-height: 44px;
  border: 1px solid #cfd7e0;
  border-radius: 6px;
  padding: 10px 14px;
  background: white;
  color: #26384c;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  &:hover { background: #edf3fa; }
`
const Download = styled(Action)`
  background: #155eae;
  border-color: #155eae;
  color: white;
  &:hover { background: #104d90; }
  @media (max-width: 600px) { width: 100%; text-align: center; }
`
const DownloadActions = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px; margin-left: auto;
  a { display: inline-flex; align-items: center; justify-content: center; }
  .all-cities { border-color: #155eae; color: #155eae; background: #edf3fa; }
  .all-cities:hover { background: #dceafa; }
  @media (max-width: 600px) { width: 100%; a { width: 100%; } }
`
const Summary = styled.div`
  padding: 14px 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 6px 20px;
  font-size: 14px;
  color: #465567;
  background: #f8fafc;
  p { margin: 0; }
  strong { color: #152639; }
`
const MapFrame = styled.div`
  height: clamp(460px, 65vh, 640px);
  position: relative;
  @media (max-width: 600px) { height: 460px; }
`
const Placeholder = styled.div`
  height: 100%; display: grid; place-content: center; text-align: center; padding: 24px; background: #edf1f4;
`
const Footer = styled.div`
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #586577;
  border-top: 1px solid #dce2e9;
  p { margin: 8px 0 0; max-width: 90ch; }
  .links { display: flex; flex-wrap: wrap; gap: 4px 20px; align-items: center; }
  a { min-height: 44px; display: inline-flex; align-items: center; }
`

export default function DatasetExplorer() {
  const [selection, setSelection] = useState({ city: CITIES[0].id, layer: 'points', scale: 'absolute' })
  const [urlReady, setUrlReady] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [MapView, setMapView] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [shareStatus, setShareStatus] = useState('')
  const frame = useRef(null)
  const city = CITIES.find(item => item.id === selection.city) || CITIES[0]

  useEffect(() => {
    const read = () => setSelection(readExplorerState(window.location.search, CITIES))
    read()
    setUrlReady(true)
    window.addEventListener('popstate', read)
    return () => window.removeEventListener('popstate', read)
  }, [])

  useEffect(() => {
    if (!urlReady) return
    const url = new URL(window.location.href)
    Object.entries(selection).forEach(([key, value]) => url.searchParams.set(key, value))
    window.history.replaceState(window.history.state, '', url)
    setShareStatus('')
  }, [selection, urlReady])

  useEffect(() => {
    let cancelled = false
    setLoadError(false)
    const load = () => import('./Map').then(module => {
      if (!cancelled) setMapView(() => module.default)
    }).catch(() => { if (!cancelled) setLoadError(true) })
    if (!('IntersectionObserver' in window)) load()
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect()
        load()
      }
    }, { rootMargin: '120px' }) : null
    if (observer && frame.current) observer.observe(frame.current)
    return () => { cancelled = true; observer?.disconnect() }
  }, [retry])

  const choose = (key, value) => setSelection(previous => ({ ...previous, [key]: value }))
  const share = async () => {
    try {
      const url = new URL(window.location.href)
      url.hash = 'map'
      await navigator.clipboard.writeText(url.href)
      setShareStatus('Link copied')
    } catch {
      setShareStatus('Copy the URL from your address bar to share this view.')
    }
  }

  return <Surface>
    <Toolbar aria-label="Map controls">
      <div className="city">
        <label htmlFor="explorer-city">City</label>
        <CitySelector value={selection.city} onSelectCity={value => choose('city', value)} />
      </div>
      <div>
        <span className="control-label" id="layer-label">Layer</span>
        <Group role="group" aria-labelledby="layer-label">
          {['points', 'hex'].map(value => <Choice key={value} type="button" $active={selection.layer === value} aria-pressed={selection.layer === value} onClick={() => choose('layer', value)}>{value === 'points' ? 'Points' : 'Hex'}</Choice>)}
        </Group>
      </div>
      <div>
        <span className="control-label" id="scale-label">Color scale</span>
        <Group role="group" aria-labelledby="scale-label">
          {['absolute', 'within-city'].map(value => <Choice key={value} type="button" $active={selection.scale === value} aria-pressed={selection.scale === value} onClick={() => choose('scale', value)}>{value === 'absolute' ? 'Absolute' : 'Within city'}</Choice>)}
        </Group>
      </div>
      <Action type="button" onClick={() => setResetKey(key => key + 1)}>Reset view</Action>
      <DownloadActions aria-label="Dataset downloads">
        <Download as="a" href={withPrefix(`/data/${city.download.file}`)} download>Download {city.label} · {formatSize(city.download.bytes)}</Download>
        <Action as="a" className="all-cities" href={withPrefix(`/data/${ALL_DOWNLOAD.file}`)} download>Download all cities · {formatSize(ALL_DOWNLOAD.bytes)}</Action>
      </DownloadActions>
    </Toolbar>
    <Summary>
      <p><strong>{city.label}</strong> · {formatCount(city.nPoints)} points · {formatCount(city.nHex)} hexes</p>
      <p>{selection.layer === 'hex' ? 'H3 resolution 9 · mean VATA' : 'Street-view image locations'}</p>
      <p style={{ flexBasis: '100%' }}><strong>{selection.scale === 'absolute' ? 'Absolute — comparable across cities.' : 'Within city — relative to this city and layer only.'}</strong> {selection.scale === 'absolute' ? 'Reference thresholds: 1.76 / 3.24.' : 'Colors use local percentiles; the same color can represent different scores.'}</p>
    </Summary>
    <MapFrame ref={frame}>
      {MapView ? <MapView {...selection} resetKey={resetKey} /> : <Placeholder>
        <p>{loadError ? 'The map could not load. Downloads are still available.' : 'The interactive map loads when you reach it.'}</p>
        {loadError && <Action onClick={() => setRetry(value => value + 1)}>Retry map</Action>}
        <noscript>Enable JavaScript to explore the map. All download links work without it.</noscript>
      </Placeholder>}
    </MapFrame>
    <Footer>
      <div className="links">
        <a href={withPrefix('/data/README.md')}>README</a>
        <a href={withPrefix('/data/schema.json')}>Schema</a>
        <a href={withPrefix('/data/LICENSE.txt')}>Usage & license notes</a>
        <Action type="button" onClick={share}>Share view</Action>
        <span role="status">{shareStatus}</span>
      </div>
      <p>Each ZIP includes point and hex GeoPackages, a README, schema and usage notes. Data reuse permission is not yet confirmed; contact the research team before reuse.</p>
      <p>Hover to inspect; click or tap to pin a card.</p>
    </Footer>
  </Surface>
}
