import React from "react"
import { Link } from "gatsby"
import styled from "styled-components"
import Layout from "../components/layout"
import DatasetExplorer from "../components/DatasetExplorer"

const Content = styled.section`
  max-width: 1280px; margin: 0 auto; padding: 48px 24px 64px; scroll-margin-top: 90px;
  h1 { font-size: clamp(28px, 4vw, 44px); margin: 12px 0; letter-spacing: -.035em; }
  > p { color: #586577; max-width: 70ch; margin-bottom: 28px; }
  @media (max-width: 600px) { padding: 28px 16px; }
`

export default function DatasetPage() {
  return <Layout><Content id="map">
    <Link to="/">← Thermal Affordance</Link>
    <h1>Explore the dataset</h1>
    <p>Eight cities. Street-view points and neighborhood-scale hexagons. Explore the patterns, inspect the scores and download the underlying geospatial data.</p>
    <DatasetExplorer />
  </Content></Layout>
}

export const Head = () => <>
  <title>Dataset & Mapping | Thermal Affordance</title>
  <meta name="description" content="Explore and download VATA street-view points and H3 hexagons across eight cities. Compare absolute scores or explore within-city patterns." />
</>
