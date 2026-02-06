import * as React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"
import styled from "styled-components"
import Layout from "../components/layout"
import CitySelector from "../components/CitySelector"
import Map from "../components/Map"
import { StaticImage } from "gatsby-plugin-image"
import { researchPapers } from "../data/research-papers"

// Styled components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const Section = styled.section`
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  scroll-margin-top: 90px;
  
  @media (max-width: 768px) {
    height: auto;
    min-height: auto;
    padding: 1.5rem 0;
  }
`

const HomeSection = styled(Section)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: 2;
  }
  
  @media (max-width: 768px) {
    height: auto;
    min-height: 70vh;
    padding: 2rem 0;
  }
`

const MovingBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 200%; // 宽度设为两倍
  height: 100%;
  background-image: url(${props => props.$backgroundImage});
  background-size: 50% 100%; // 每个图片50%宽度
  background-position: 0 0, 100% 0;
  background-repeat: repeat-x;
  animation: slideBackground 60s linear infinite;

  @keyframes slideBackground {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%); // 只移动50%宽度
    }
  }
`

const ConceptSection = styled(Section)`
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  padding: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: auto;
    padding: 1rem;
    gap: 1.5rem;
  }
`

const MapSection = styled(Section)`
  position: relative;
  height: auto;
  min-height: 80vh;
  padding: 2rem 0;
  
  @media (max-width: 768px) {
    min-height: auto;
    padding: 1rem 0;
  }
`

const MapContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: 0 0.5rem;
    gap: 0.75rem;
  }
`

const MapWrapper = styled.div`
  width: 100%;
  height: 550px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    height: 400px;
  }
  
  @media (max-width: 480px) {
    height: 300px;
  }
`

const DownloadSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 300px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 1rem;
  }
`

const DownloadButton = styled.a`
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
  border-radius: 4px;
  border: none;
  background-color: ${props => props.$primary ? '#0066cc' : '#4d94ff'};
  color: white;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.3s ease;
  width: 100%;

  &:hover {
    background-color: ${props => props.$primary ? '#0052a3' : '#3385ff'};
  }

  &.disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.95rem;
  }
`

const ContentWrapper = styled.div`
  max-width: 1200px;
  width: 100%;
  padding: 1.5rem 2rem;
  text-align: left;
  position: relative;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.8); // 半透明白色背景
  border-radius: 10px;
  color: black; // 文字颜色改为黑色
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin: 0 0.5rem;
  }
`

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
  color: black; // 确保标题是黑色
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`

const Definition = styled.p`
  font-size: 1rem;
  font-style: italic;
  font-weight: bold;
  text-align: center;
  color: black;
  margin-bottom: 1rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`

const Subtitle = styled.h2`
  font-size: 1rem;
  margin-bottom: 0.4rem;
  color: black; // 确保副标题是黑色
  line-height: 1.5;
  font-weight: normal;
  text-align: justify;
  width: 100%;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`

const Authors = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: black;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`

const Affiliation = styled.p`
  font-size: 0.9rem;
  margin-bottom: 0.1rem;
  color: black;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`

const Email = styled.p`
  font-size: 0.9rem;
  margin-bottom: 2rem;
  color: black;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 1.5rem;
  }
`

const CorePaperContainer = styled.div`
  width: 100%;
  margin-top: 1rem;
`

const CorePaperList = styled.div`
  width: 100%;
`

const CorePaperItem = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const CorePaperLink = styled.a`
  color: #0066cc;
  text-decoration: none;
  margin: 0 0.3rem;
  
  &:hover {
    text-decoration: underline;
  }
  
  &:first-child {
    margin-left: 0.5rem;
  }
`

const CorePaperLabel = styled.strong`
  font-weight: bold;
`

const JournalName = styled.span`
  font-style: italic;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`

const Button = styled.a`
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  text-decoration: none;
  color: black;
  border-radius: 4px;
  display: inline-block;
  &:hover {
    background-color: #e0e0e0;
  }
`

const InternalButton = styled(Link)`
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  text-decoration: none;
  color: black;
  border-radius: 4px;
  display: inline-block;
  &:hover {
    background-color: #e0e0e0;
  }
`

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const LeftColumn = styled(Column)`
  padding-right: 4rem;
  padding-left: 4rem;
  text-align: justify;
  
  @media (max-width: 768px) {
    padding-right: 1rem;
    padding-left: 1rem;
    text-align: left;
  }
`

const RightColumn = styled(Column)`
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0 1rem;
  }
`

const ImageWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 1rem;
  }
`

const Description = styled.p`
  font-size: 0.8rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.6;
  }
`

const ConceptSubtitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  line-height: 1.3;
  text-align: left;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 0.6rem;
  }
`

const BoldText = styled.span`
  font-weight: bold;
`

const ResearchSection = styled(Section)`
  background-color: #ffffff;
  padding: 3rem 2rem;
  height: auto;
  min-height: auto;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`

const ResearchContainer = styled.div`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
`

const ResearchTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: black;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`

const ResearchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`

const ResearchItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: stretch;
  background-color: #f9f9f9;
  padding: 0;
  border-radius: 4px;
  border-left: 3px solid #0066cc;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`

const ResearchItemImageWrap = styled.a`
  flex-shrink: 0;
  width: 180px;
  min-height: 120px;
  display: block;
  background-color: #e8e8e8;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    min-height: 160px;
  }
`

const ResearchItemImage = styled.img`
  width: 100%;
  height: 100%;
  min-height: 120px;
  object-fit: cover;
  display: block;
  
  @media (max-width: 768px) {
    min-height: 160px;
  }
`

const ResearchItemContent = styled.div`
  padding: 0.7rem 0.9rem;
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
  }
`

const ResearchItemTitle = styled.h3`
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
  color: #0066cc;
  line-height: 1.3;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`


const ResearchItemLink = styled.a`
  color: #0066cc;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`

const ResearchItemAuthors = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.2rem;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`

const ResearchItemVenue = styled.span`
  font-size: 0.75rem;
  color: #888;
  font-style: italic;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`

const ResearchItemYear = styled.span`
  font-size: 0.75rem;
  color: #999;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`

const TeamSection = styled(Section)`
  background-color: #f5f5f5;
  padding: 2rem 0;
  height: auto;
  min-height: 60vh;
  
  @media (max-width: 768px) {
    padding: 1.5rem 0;
    min-height: auto;
  }
`

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 900px;
  width: 100%;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`

const TeamMember = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transform: scale(0.9);
  width: 100%;
  height: 100%;
`


const MemberName = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.4rem;
`

const MemberContact = styled.div`
  font-size: 0.8rem;
  margin-bottom: 0.4rem;
  width: 100%;
  text-align: center;
`

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  width: 100%;
`

const SocialLink = styled.a`
  color: #333;
  &:hover {
    color: #0066cc;
  }
`

// 为每个团队成员创建单独的组件
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

// 首先,在文件顶部添加一个新的样式组件
const DataAvailabilityMessage = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
  font-style: italic;
  color: #666;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    text-align: center;
    padding: 0 1rem;
  }
`

// 在其他样式组件之后添加
const PropertySection = styled(ConceptSection)`
  // 这里不需要额外的样式,因为我们直接继承ConceptSection的样式
`

const MethodSection = styled(ConceptSection)`
  // No additional styles needed as we're inheriting from ConceptSection
`

const PlanningSection = styled(ConceptSection)`
  // No additional styles needed as we're inheriting from ConceptSection
`

// 添加一个新的样式组件专门用于Team部分的标题
const TeamTitle = styled.h1`
  font-size: 1.5rem; // 从2.5rem减小
  margin-bottom: 1.5rem;
  color: black;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
`

// Main component
const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "cover.jpg" }) {
        publicURL
      }
    }
  `)

  const [selectedCity, setSelectedCity] = React.useState("singapore")

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

  return (
    <Layout>
      <PageContainer>
        <HomeSection id="home">
          <MovingBackground $backgroundImage={data.file.publicURL} />
          <ContentWrapper>
            <Title>Thermal Affordance</Title>
            <Definition>
              The inherent capacity of built environment to influence human thermal comfort based on its morphological and physical features.
            </Definition>
            <CorePaperContainer>
              <CorePaperList>
                <CorePaperItem>
                  <Subtitle>
                    <CorePaperLabel>Core Paper - Thermal Comfort in Sight</CorePaperLabel> - 
                    [<CorePaperLink href="https://github.com/Sijie-Yang/VATA" target="_blank" rel="noopener noreferrer">Github</CorePaperLink>] 
                    [<CorePaperLink href={researchPapers.find(p => p.id === 1).link} target="_blank" rel="noopener noreferrer">Paper</CorePaperLink>] 
                    [<CorePaperLink as={Link} to="/dataset">Dataset</CorePaperLink>]
                    - Yang, S., Chong, A., Liu, P., & Biljecki, F. (2025). Thermal comfort in sight: Thermal affordance and its visual assessment for sustainable streetscape design. <JournalName>Building and Environment</JournalName>, 271, 112569.
                  </Subtitle>
                </CorePaperItem>
                {/* Add more Core Papers here:
                <CorePaperItem>
                  <Subtitle>
                    Core Paper - Author, A., Author, B. (Year). Paper title. Journal, Volume, Pages.
                  </Subtitle>
                  <CorePaperButtons>
                    <Button href="link1" target="_blank" rel="noopener noreferrer">Button 1</Button>
                    <Button href="link2" target="_blank" rel="noopener noreferrer">Button 2</Button>
                  </CorePaperButtons>
                </CorePaperItem>
                */}
              </CorePaperList>
            </CorePaperContainer>
          </ContentWrapper>
        </HomeSection>
        
        <ConceptSection id="concept">
          <LeftColumn>
            <ConceptSubtitle>What's Thermal Affordance?</ConceptSubtitle>
            <Description>
              In response to climate change and urban heat island effects, enhancing human thermal comfort in cities is crucial for sustainable urban development. 
              Traditional methods for investigating the urban thermal environment and corresponding human thermal comfort level are often resource intensive, inefficient, and limited in scope. 
              To address these challenges, we (1) introduce the concept of <BoldText style={{ color: '#FF7873' }}><i><u>Thermal Affordance</u></i></BoldText>, 
                <BoldText> which represents the inherent capacity of a streetscape to influence human thermal comfort based on its visual and physical features </BoldText>; 
                and (2) <BoldText> a method to evaluate it </BoldText> (<BoldText style={{ color: '#0571B0' }}><i><u>Visual Assessment of Thermal Affordance -- VATA</u></i></BoldText>).
            </Description>
            <ConceptSubtitle>What's Visual Assessment of Thermal Affordance (VATA)?</ConceptSubtitle>
            <Description>
              VATA combines street view imagery (SVI), online and in-filed surveys, and statistical learning algorithms. 
              VATA extracts five categories of image features from SVI data and establishes 19 visual-perceptual indicators for streetscape visual assessment. 
              Using multi-task neural network and elastic net regression, we model their chained relationship to predict and comprehend thermal affordance for Singapore. 
              <BoldText style={{ color: '#AD7D7C' }}> <u>VATA predictions are validated with field-investigated OTC data</u></BoldText>, providing a cost-effective and scalable method to assess the thermal comfort potential of urban streetscape. 
              This framework can inform streetscape design to support sustainable, livable, and resilient urban environments.
            </Description>
          </LeftColumn>
          <RightColumn>
            <ImageWrapper>
              <StaticImage
                src="../images/VATA_framework.png"
                alt="Research framework of thermal affordance"
                placeholder="blurred"
                layout="constrained"
                width={400}
              />
            </ImageWrapper>
          </RightColumn>
        </ConceptSection>
        
        <PropertySection id="property">
          <RightColumn> 
            <ImageWrapper>
              <StaticImage
                src="../images/VATA_concept.png"
                alt="Property of thermal affordance"
                placeholder="blurred"
                layout="constrained"
                width={400}
              />
            </ImageWrapper>
          </RightColumn>
          <LeftColumn>  
            <ConceptSubtitle>Properties of Thermal Affordance</ConceptSubtitle>
            <Description>
              As Gibson's theory of affordance suggest (Gibson, 1977), environments contain inherent values and information that shape human perceptions and behaviours. 
              Thermal comfort, as part of human perceptions, reflects both subjective satisfaction and objective factors such as air temperature, air humidity, 
              and wind speed. 
              We introduce the concept of <BoldText>'thermal affordance'</BoldText> to describe the inherent capability of an environment to impact thermal comfort. 
              This concept integrates various environmental factors, indicating the possible thermal comfort experienced. 
              Studies have shown the connection between thermal comfort and integrated environmental factors such as walkability and streetscape design, supporting the validity of thermal affordance.
            </Description>
            <Description>
              We summarise several key characteristics of thermal affordance: unity, objectivity, heuristic value, spatial dependency, interpretability, and expandability, as illustrated in the figure.
            </Description>
            <ConceptSubtitle>Methodology Base of VATA</ConceptSubtitle>
            <Description>
              This research continues to explore the intrinsic connection between OTC in urban environments and visual data from SVI, shaped by affordance information and personal experiences. 
              First, SVI visual data reflect objective characteristics of streetscapes, indicating streetscapes' potential capability to promote thermal comfort and microclimate conditions, 
              which forms thermal affordance. Second, this visual information is linked to individuals’ thermal perception, influenced by memory and sensory experiences, 
              which affects their thermal affordance assessment. These insights form the foundation of our VATA analysis, highlighting the role of visual characteristics and perceptual experiences in OTC assessment.
              <u>Using machine learning, we combine <BoldText style={{ color: '#0571B0' }}>SVI image features (IF)</BoldText> and <BoldText style={{ color: '#0571B0' }}>visual-perceptual indicator (VPI)</BoldText> survey data to predict the VATA metric</u>, allowing us to visually assess the urban environments' capability to promote thermal comfort. 
              Our model shows promise for streetscape assessment and VATA prediction, as illustrated in the figure.
            </Description>
          </LeftColumn>
        </PropertySection>
        
        <MethodSection id="method">
          <LeftColumn>
            <ConceptSubtitle>Computational Framework of VATA</ConceptSubtitle>
            <Description>
              Figure presents the research framework for this study, built on the VATA framework. 
              We conducted an online SVI visual assessment survey, evaluating VATA and 19 other VPIs based on 500 SVIs. 
              Five classes of IFs from SVI data, along with survey-based VATA and VPI data, were used to develop datasets for statistical VATA prediction and inference models. 
              A multi-task neural network learning model (MTNNL) was constructed with two stages: predicting VPIs from IFs, and then predicting VATA from VPIs, using weighted loss values for iterative training. 
              This model was applied to predict VATA for 92,233 SVIs in Singapore, and validated against real-world OTC data. 
              A two-stage elastic net regression model (ENRM) was also used to interpret IF-VPI-VATA relationships, offering insights for streetscape design. 
              All SVIs used in this study are sourced from Google Street View.
            </Description>
          </LeftColumn>
          <RightColumn>
            <ImageWrapper>
              <StaticImage
                src="../images/method_framework.png"
                alt="Computational framework of VATA"
                placeholder="blurred"
                layout="constrained"
                width={500}
              />
            </ImageWrapper>
          </RightColumn>
        </MethodSection>
        
        <PlanningSection id="planning">
          <LeftColumn>
            <ConceptSubtitle>Planning Application of VATA</ConceptSubtitle>
            <Description>
              The trained VATA prediction model assigns VATA values to 92,233 SVIs and aggregates them as average scores within hexagonal spatial units. 
              Using the H3 geospatial indexing system at resolution level 9, each hexagonal unit covers approximately 0.1 square kilometres, balancing precision and scalability for urban planning-orientated geospatial analytics. 
              The VATA framework offers a valuable tool for enhancing urban quality of life by informing sustainable streetscape planning and design. 
              It provides a comprehensive analysis of thermal affordance at the urban scale. 
              By calculating and visually representing the average VATA values for each hexagonal spatial cell, the model effectively communicates the visual evaluation of thermal affordance across urban streetscapes in Singapore. 
              Hexagonal spatial cells are colour coded to reflect varying levels of thermal affordance: red indicates high VATA values (3.24 ≤ VATA ≤ 5), suggesting superior thermal conditions due to shading and vegetation; 
              blue represents low values (0 ≤ VATA &lt; 1.76), indicating poor conditions from sun exposure and limited greenery; grey signifies moderate thermal affordance (1.76 ≤ VATA &lt; 3.24).
            </Description>
          </LeftColumn>
          <RightColumn>
            <ImageWrapper>
              <StaticImage
                  src="../images/result_VATA_mapping.png"
                  alt="VATA mapping for urban planning"
                  placeholder="blurred"
                  layout="constrained"
                  width={500}
              />
            </ImageWrapper>
          </RightColumn>
        </PlanningSection>
        
        <MapSection id="map">
          <MapContainer>
            <DataAvailabilityMessage>Dataset download will be available soon</DataAvailabilityMessage>
            <DownloadSection>
              <CitySelector onSelectCity={setSelectedCity} />
              <DownloadButton 
                href={`/data/${selectedCity}_VATA_perception_points.gpkg`}
                className={selectedCity !== 'singapore' ? 'disabled' : ''}
                download
              >
                Download {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)} Dataset
              </DownloadButton>
              <DownloadButton 
                href="/data/all_cities_thermal_affordance.zip"
                className="disabled"
                $primary
                download
              >
                Download All Cities Dataset
              </DownloadButton>
            </DownloadSection>
            <MapWrapper>
              <Map city={selectedCity} />
            </MapWrapper>
          </MapContainer>
        </MapSection>
        
        <ResearchSection id="research">
          <ResearchContainer>
            <ResearchTitle>Thermal Affordance in Research</ResearchTitle>
            <ResearchList>
              {researchPapers.map((paper) => (
                <ResearchItem key={paper.id}>
                  {paper.image && (
                    <ResearchItemImageWrap href={paper.link} target="_blank" rel="noopener noreferrer" aria-hidden>
                      <ResearchItemImage
                        src={paper.image}
                        alt=""
                        loading="lazy"
                      />
                    </ResearchItemImageWrap>
                  )}
                  <ResearchItemContent>
                    <ResearchItemTitle>
                      <ResearchItemLink 
                        href={paper.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {paper.title}
                      </ResearchItemLink>
                      <ResearchItemVenue>{paper.venue}</ResearchItemVenue>
                      <ResearchItemYear>{paper.year}</ResearchItemYear>
                    </ResearchItemTitle>
                    <ResearchItemAuthors>
                      {paper.authors}
                    </ResearchItemAuthors>
                  </ResearchItemContent>
                </ResearchItem>
              ))}
            </ResearchList>
          </ResearchContainer>
        </ResearchSection>
        
        <TeamSection id="team">
          <ContentWrapper>
            <TeamTitle>Team & Contact</TeamTitle>
            <TeamGrid>
              {teamMembers.map((member, index) => (
                <TeamMember key={index}>
                  <member.ImageComponent />
                  <MemberName>{member.name}</MemberName>
                  <MemberContact>{member.email}</MemberContact>
                  <SocialLinks>
                    <SocialLink href={member.website} target="_blank" rel="noopener noreferrer">Website</SocialLink>
                    <SocialLink href={member.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</SocialLink>
                    <SocialLink href={member.scholar} target="_blank" rel="noopener noreferrer">Scholar</SocialLink>
                  </SocialLinks>
                </TeamMember>
              ))}
            </TeamGrid>
          </ContentWrapper>
        </TeamSection>
      </PageContainer>
    </Layout>
  )
}

export default IndexPage

export const Head = () => (
  <>
    <title>Thermal Affordance</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </>
)