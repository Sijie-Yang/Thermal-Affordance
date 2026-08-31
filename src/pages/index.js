import React, { useState } from "react"
import { Link, withPrefix } from "gatsby"
import styled from "styled-components"
import { StaticImage } from "gatsby-plugin-image"
import Layout from "../components/layout"
import DatasetExplorer from "../components/DatasetExplorer"
import { researchPapers } from "../data/research-papers"
import coverImage from "../images/cover.jpg"

const Section = styled.section`
  width: 100%; max-width: 1280px; margin: 0 auto; padding: 72px 24px;
  h2 { font-size: clamp(26px, 3vw, 36px); line-height: 1.2; letter-spacing: -.035em; margin: 0 0 16px; }
  h3 { line-height: 1.4; }
  @media (max-width: 760px) { padding: 44px 16px; }
`
const Hero = styled(Section)`
  position: relative; isolation: isolate; overflow: hidden; max-width: none;
  min-height: 80vh; display: flex; align-items: center; justify-content: center;
  padding: 64px 24px 80px; background: #d9e1e5;
  &::after { content: ''; position: absolute; inset: 0; background: #00000012; z-index: -1; }
  h1 { font-size: clamp(36px, 5vw, 62px); line-height: 1.08; letter-spacing: -.055em; margin: 12px 0 20px; font-weight: 650; text-align: center; }
  @media (max-width: 760px) { min-height: 70vh; padding: 32px 16px 76px; }
`
const MovingBackground = styled.div`
  position: absolute; inset: 0 auto 0 0; width: 200%; height: 100%; z-index: -2;
  background-image: url(${coverImage}); background-size: 50% 100%; background-repeat: repeat-x;
  /* This cover explicitly autoplays; the rest of the site still respects reduced motion. */
  animation: slideBackground 60s linear infinite !important;
  animation-play-state: ${p => p.$paused ? 'paused' : 'running'} !important;
  @keyframes slideBackground { from { transform: translateX(0); } to { transform: translateX(-50%); } }
`
const HeroContent = styled.div`
  width: 100%; max-width: 1100px; padding: 32px 40px;
  background: rgba(255, 255, 255, .87); border: 1px solid #ffffffb3; border-radius: 12px;
  box-shadow: 0 12px 48px #15263918;
  > p { color: #26384c; margin: 0; text-align: center; }
  @media (max-width: 760px) { padding: 24px 20px; }
`
const HeroDefinition = styled.p`
  white-space: nowrap;
  font-size: clamp(11px, 1.35vw, 16px);

  @media (max-width: 760px) {
    white-space: normal;
    font-size: 15px;
  }
`
const CorePaper = styled.article`
  margin-top: 24px;
  & + & { margin-top: 12px; }
  p { margin: 0; font-size: 16px; line-height: 1.6; color: #26384c; }
  strong, .paper-title { font-weight: 650; }
  a { color: #124d8c; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .paper-link { white-space: nowrap; }
`
const MotionButton = styled.button`
  position: absolute; right: 24px; bottom: 16px; min-height: 44px; padding: 8px 14px;
  background: #fffffff0; color: #26384c; border: 1px solid #dce2e9; border-radius: 6px;
  font-size: 13px; cursor: pointer;
`
const Eyebrow = styled.div`
  color: #155eae; font-size: 12px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; margin-bottom: 10px;
`
const MapSection = styled(Section)`
  padding-top: 40px; padding-bottom: 56px;
  > p { color: #586577; max-width: 70ch; margin: 0 0 24px; }
`
const Story = styled(Section)`
  display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; border-top: 1px solid #dce2e9;
  p { font-size: 16px; line-height: 1.8; text-align: left; color: #465567; max-width: 70ch; }
  figure { margin: 0; padding: 24px; background: #fff; border: 1px solid #e1e6ec; border-radius: 10px; }
  @media (max-width: 760px) { grid-template-columns: 1fr; gap: 28px; figure { padding: 16px; } }
`
const ResearchList = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 28px;
  article { display: flex; flex-direction: column; background: #fff; border: 1px solid #dce2e9; border-radius: 8px; overflow: hidden; }
  img { width: 100%; height: 180px; object-fit: cover; border-bottom: 1px solid #dce2e9; }
  .body { padding: 20px; }
  h3 { font-size: 17px; margin: 8px 0; }
  h3 a { color: #152639; text-decoration: none; }
  h3 a:hover { color: #155eae; text-decoration: underline; }
  p { color: #586577; font-size: 14px; margin: 8px 0 0; }
  .venue { font-size: 12px; color: #155eae; font-weight: 600; }
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`
const Team = styled(Section)`
  border-top: 1px solid #dce2e9;
  .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px; margin-top: 32px; }
  h3 { margin: 12px 0 6px; font-size: 17px; }
  .email { font-size: 14px; overflow-wrap: anywhere; }
  .social { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
  .social a { display: inline-flex; align-items: center; min-height: 44px; font-size: 13px; }
  @media (max-width: 900px) { .grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 480px) { .grid { grid-template-columns: 1fr; } }
`
const SijieYangImage = () => (
  <StaticImage
    src="../images/sijie_yang.jpg"
    alt="Sijie Yang"
    width={120}
    height={120}
    style={{ borderRadius: '50%' }}
  />
)

const AdrianChongImage = () => (
  <StaticImage
    src="../images/adrian_chong.jpeg"
    alt="Adrian Chong"
    width={120}
    height={120}
    style={{ borderRadius: '50%' }}
  />
)

const PengyuanLiuImage = () => (
  <StaticImage
    src="../images/pengyuan_liu.jpeg"
    alt="Pengyuan Liu"
    width={120}
    height={120}
    style={{ borderRadius: '50%' }}
  />
)

const FilipBiljeckiImage = () => (
  <StaticImage
    src="../images/filip_biljecki.jpg"
    alt="Filip Biljecki"
    width={120}
    height={120}
    style={{ borderRadius: '50%' }}
  />
)


  const teamMembers = [
    {
      name: "Sijie Yang",
      email: "sijiey@u.nus.edu",
      website: "https://sijie-yang.com",
      linkedin: "https://www.linkedin.com/in/sijie-yang-peter/",
      scholar: "https://scholar.google.com/citations?user=r_dDWXYAAAAJ&hl=zh-CN&oi=sra",
      ImageComponent: SijieYangImage
    },
    {
      name: "Adrian Chong",
      email: "adrian.chong@nus.edu.sg",
      website: "https://ideaslab.io",
      linkedin: "https://www.linkedin.com/in/adrianchong/?originalSubdomain=sg",
      scholar: "https://scholar.google.com/citations?user=Xm3qR2QAAAAJ&hl=zh-CN&oi=ao",
      ImageComponent: AdrianChongImage
    },
    {
      name: "Pengyuan Liu",
      email: "pengyuan.liu@sec.ethz.ch",
      website: "https://ual.sg/author/pengyuan-liu/",
      linkedin: "https://www.linkedin.com/in/pengyuanliuleicester/",
      scholar: "https://scholar.google.com/citations?user=XZXvFD0AAAAJ&hl=zh-CN&oi=ao",
      ImageComponent: PengyuanLiuImage
    },
    {
      name: "Filip Biljecki *",
      email: "filip@nus.edu.sg",
      website: "https://ual.sg/",
      linkedin: "https://www.linkedin.com/in/filipbiljecki/",
      scholar: "https://scholar.google.com/citations?user=jGqm4kEAAAAJ&hl=zh-CN&oi=ao",
      ImageComponent: FilipBiljeckiImage
    }
  ];

export default function IndexPage() {
  const [backgroundPaused, setBackgroundPaused] = useState(false)
  const corePapers = researchPapers.filter(paper => paper.core)
  return <Layout>
    <Hero id="home">
      <MovingBackground aria-hidden="true" $paused={backgroundPaused} />
      <HeroContent>
        <Eyebrow style={{ textAlign: 'center' }}>Urban Analytics Lab · Research & data</Eyebrow>
        <h1>Thermal Affordance</h1>
        <HeroDefinition><strong><em>The inherent capacity of built environment to influence human thermal comfort based on its morphological and physical features.</em></strong></HeroDefinition>
        {corePapers.map(paper => <CorePaper key={paper.id} aria-labelledby={`core-paper-${paper.id}`}>
          <p>
            <strong>Core Paper — </strong>{paper.authors} ({paper.year}).{' '}
            <a className="paper-title" id={`core-paper-${paper.id}`} href={paper.link} target="_blank" rel="noopener noreferrer">{paper.fullTitle || paper.title}</a>.{' '}
            <em>{paper.venue}</em>{paper.volume && `, ${paper.volume}`}{paper.articleNumber && `, ${paper.articleNumber}`}.{' '}
            {paper.code && <><span className="paper-link">[<a href={paper.code} target="_blank" rel="noopener noreferrer">Code</a>]</span>{' '}</>}
            {paper.dataset && <><span className="paper-link">[<Link to={paper.dataset}>Dataset</Link>]</span>{' '}</>}
            <span className="paper-link">[<a href="#map">Explore map</a>]</span>
          </p>
        </CorePaper>)}
      </HeroContent>
      <MotionButton type="button" aria-pressed={!backgroundPaused} onClick={() => setBackgroundPaused(paused => !paused)}>{backgroundPaused ? 'Play background' : 'Pause background'}</MotionButton>
    </Hero>
    <MapSection id="map">
      <Eyebrow>01 / Explore</Eyebrow>
      <h2>A closer look at every city.</h2>
      <p>Select a city to explore VATA points or hexagons and download the dataset.</p>
      <DatasetExplorer />
    </MapSection>
    <Story id="concept">
      <div>
        <Eyebrow>02 / The concept</Eyebrow>
        <h2>What can a streetscape tell us about thermal comfort?</h2>
        <p>
          In response to climate change and urban heat island effects, enhancing human thermal comfort in cities is crucial for sustainable urban development.
          Traditional methods for investigating the urban thermal environment and corresponding human thermal comfort level are often resource intensive, inefficient, and limited in scope.
          To address these challenges, we (1) introduce the concept of <strong style={{ color: '#FF7873' }}><i><u>Thermal Affordance</u></i></strong>,
            <strong> which represents the inherent capacity of a streetscape to influence human thermal comfort based on its visual and physical features </strong>;
            and (2) <strong> a method to evaluate it </strong> (<strong style={{ color: '#0571B0' }}><i><u>Visual Assessment of Thermal Affordance -- VATA</u></i></strong>).
        </p>
        <h3>What's Visual Assessment of Thermal Affordance (VATA)?</h3>
        <p>
          VATA combines street view imagery (SVI), online and in-filed surveys, and statistical learning algorithms.
          VATA extracts five categories of image features from SVI data and establishes 19 visual-perceptual indicators for streetscape visual assessment.
          Using multi-task neural network and elastic net regression, we model their chained relationship to predict and comprehend thermal affordance for Singapore.
          <strong style={{ color: '#AD7D7C' }}> <u>VATA predictions are validated with field-investigated OTC data</u></strong>, providing a cost-effective and scalable method to assess the thermal comfort potential of urban streetscape.
          This framework can inform streetscape design to support sustainable, livable, and resilient urban environments.
        </p>
      </div>
      <figure><StaticImage src="../images/VATA_framework.png" alt="VATA framework linking street-view imagery, visual perception and thermal affordance" width={500} layout="constrained" placeholder="blurred" /></figure>
    </Story>
    <Story id="property">
      <div>
        <Eyebrow>Concept / Interpretation</Eyebrow>
        <h2>A property of the environment, experienced by people.</h2>
        <p>
          As Gibson's theory of affordance suggest (Gibson, 1977), environments contain inherent values and information that shape human perceptions and behaviours.
          Thermal comfort, as part of human perceptions, reflects both subjective satisfaction and objective factors such as air temperature, air humidity,
          and wind speed.
          We introduce the concept of <strong>'thermal affordance'</strong> to describe the inherent capability of an environment to impact thermal comfort.
          This concept integrates various environmental factors, indicating the possible thermal comfort experienced.
          Studies have shown the connection between thermal comfort and integrated environmental factors such as walkability and streetscape design, supporting the validity of thermal affordance.
        </p>
        <p>
          We summarise several key characteristics of thermal affordance: unity, objectivity, heuristic value, spatial dependency, interpretability, and expandability, as illustrated in the figure.
        </p>
        <h3>Methodology Base of VATA</h3>
        <p>
          This research continues to explore the intrinsic connection between OTC in urban environments and visual data from SVI, shaped by affordance information and personal experiences.
          First, SVI visual data reflect objective characteristics of streetscapes, indicating streetscapes' potential capability to promote thermal comfort and microclimate conditions,
          which forms thermal affordance. Second, this visual information is linked to individuals’ thermal perception, influenced by memory and sensory experiences,
          which affects their thermal affordance assessment. These insights form the foundation of our VATA analysis, highlighting the role of visual characteristics and perceptual experiences in OTC assessment.
          <u>Using machine learning, we combine <strong style={{ color: '#0571B0' }}>SVI image features (IF)</strong> and <strong style={{ color: '#0571B0' }}>visual-perceptual indicator (VPI)</strong> survey data to predict the VATA metric</u>, allowing us to visually assess the urban environments' capability to promote thermal comfort.
          Our model shows promise for streetscape assessment and VATA prediction, as illustrated in the figure.
        </p>
      </div>
      <figure><StaticImage src="../images/VATA_concept.png" alt="Conceptual properties of thermal affordance" width={500} layout="constrained" placeholder="blurred" /></figure>
    </Story>
    <Story id="method">
      <div>
        <Eyebrow>03 / Method & paper</Eyebrow>
        <h2>From imagery to interpretable scores.</h2>
        <p>
          Figure presents the research framework for this study, built on the VATA framework.
          We conducted an online SVI visual assessment survey, evaluating VATA and 19 other VPIs based on 500 SVIs.
          Five classes of IFs from SVI data, along with survey-based VATA and VPI data, were used to develop datasets for statistical VATA prediction and inference models.
          A multi-task neural network learning model (MTNNL) was constructed with two stages: predicting VPIs from IFs, and then predicting VATA from VPIs, using weighted loss values for iterative training.
          This model was applied to predict VATA for 92,233 SVIs in Singapore, and validated against real-world OTC data.
          A two-stage elastic net regression model (ENRM) was also used to interpret IF-VPI-VATA relationships, offering insights for streetscape design.
          All SVIs used in this study are sourced from Google Street View.
        </p>
      </div>
      <figure><StaticImage src="../images/method_framework.png" alt="Computational framework for the multi-task neural network and elastic net regression" width={550} layout="constrained" placeholder="blurred" /></figure>
    </Story>
    <Story id="planning">
      <div>
        <Eyebrow>Method / Application</Eyebrow>
        <h2>Read patterns at neighborhood scale.</h2>
        {/* Original wording retained. Its red/high and blue/low description conflicts with the supplied figure legend; flag for the author rather than silently rewriting. */}
        <p>
          The trained VATA prediction model assigns VATA values to 92,233 SVIs and aggregates them as average scores within hexagonal spatial units.
          Using the H3 geospatial indexing system at resolution level 9, each hexagonal unit covers approximately 0.1 square kilometres, balancing precision and scalability for urban planning-orientated geospatial analytics.
          The VATA framework offers a valuable tool for enhancing urban quality of life by informing sustainable streetscape planning and design.
          It provides a comprehensive analysis of thermal affordance at the urban scale.
          By calculating and visually representing the average VATA values for each hexagonal spatial cell, the model effectively communicates the visual evaluation of thermal affordance across urban streetscapes in Singapore.
          Hexagonal spatial cells are colour coded to reflect varying levels of thermal affordance: red indicates high VATA values (3.24 ≤ VATA ≤ 5), suggesting superior thermal conditions due to shading and vegetation;
          blue represents low values (0 ≤ VATA &lt; 1.76), indicating poor conditions from sun exposure and limited greenery; grey signifies moderate thermal affordance (1.76 ≤ VATA &lt; 3.24).
        </p>
      </div>
      <figure><StaticImage src="../images/result_VATA_mapping.png" alt="Singapore VATA results mapped at urban scale" width={550} layout="constrained" placeholder="blurred" /></figure>
    </Story>
    <Section id="research">
      <Eyebrow>04 / Research collection</Eyebrow>
      <h2>Explore the wider research.</h2>
      <ResearchList>{researchPapers.map(paper => <article key={paper.id}>
        {paper.image && <img src={withPrefix(paper.image)} alt="" loading="lazy" />}
        <div className="body"><div className="venue">{paper.venue} · {paper.year}</div><h3><a href={paper.link} target="_blank" rel="noopener noreferrer">{paper.title} ↗</a></h3><p>{paper.authors}</p></div>
      </article>)}</ResearchList>
    </Section>
    <Team id="team">
      <Eyebrow>05 / People</Eyebrow><h2>Team & contact</h2>
      <div className="grid">{teamMembers.map(member => <div key={member.email}>
        <member.ImageComponent /><h3>{member.name}</h3><a className="email" href={`mailto:${member.email}`}>{member.email}</a>
        <div className="social"><a href={member.website} target="_blank" rel="noopener noreferrer">Website</a><a href={member.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a><a href={member.scholar} target="_blank" rel="noopener noreferrer">Scholar</a></div>
      </div>)}</div>
    </Team>
  </Layout>
}

export const Head = () => <>
  <title>Thermal Affordance | Explore VATA across eight cities</title>
  <meta name="description" content="Explore visual thermal affordance across eight cities. Inspect street-view points and hexagons, compare scores and download research datasets." />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</>
