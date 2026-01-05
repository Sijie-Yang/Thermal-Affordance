import * as React from "react"
import { createGlobalStyle } from "styled-components"
import styled from "styled-components"
import { StaticImage } from "gatsby-plugin-image"

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
`

// Styled components
const Header = styled.header`
  background-color: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`

const HeaderLogo = styled.a`
  width: 150px;
  height: 70px;
  overflow: hidden;
  margin-left: 20px;
  display: block;
  text-decoration: none;
  
  @media (max-width: 768px) {
    width: 120px;
    height: 60px;
    margin-left: 10px;
  }
  
  @media (max-width: 480px) {
    width: 100px;
    height: 50px;
    margin-left: 5px;
  }
`

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 70px;
    left: ${props => props.$isOpen ? '0' : '-100%'};
    width: 100%;
    height: calc(100vh - 70px);
    background-color: rgba(255, 255, 255, 0.98);
    flex-direction: column;
    padding: 2rem 1rem;
    gap: 1rem;
    transition: left 0.3s ease;
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    overflow-y: auto;
  }
`

const NavLink = styled.a`
  text-decoration: none;
  color: black;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.9rem;
  
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -5px;
    left: 0;
    background-color: black;
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
    
    &::after {
      display: none;
    }
    
    &:hover {
      color: #0066cc;
    }
  }
`

const MainContent = styled.main`
  padding-top: 90px;
  
  @media (max-width: 768px) {
    padding-top: 70px;
  }
`

// 新增的 Styled components
const Sidebar = styled.div`
  position: fixed;
  right: -200px;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  transition: right 0.3s ease;
  z-index: 999;
  border-radius: 10px 0 0 10px;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);

  &:hover {
    right: 0;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`

const SidebarLink = styled.a`
  display: block;
  padding: 0.7rem 0;
  color: black;
  text-decoration: none;
  transition: color 0.3s ease;
  line-height: 1.4;

  &:hover {
    color: #0066cc;
  }
`

const SidebarNumber = styled.span`
  margin-right: 0.5rem;
  font-weight: bold;
`

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1001;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-right: 10px;
  }
  
  span {
    width: 25px;
    height: 3px;
    background-color: black;
    transition: all 0.3s ease;
    border-radius: 2px;
    
    &:nth-child(1) {
      transform: ${props => props.$isOpen ? 'rotate(45deg) translate(8px, 8px)' : 'none'};
    }
    
    &:nth-child(2) {
      opacity: ${props => props.$isOpen ? '0' : '1'};
    }
    
    &:nth-child(3) {
      transform: ${props => props.$isOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none'};
    }
  }
`

// Layout component
const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  // Smooth scroll function
  const scrollToSection = (sectionId) => (e) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = document.querySelector('header').offsetHeight;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      // Close menu on mobile after clicking
      setIsMenuOpen(false);
    }
  };

  // Header opacity change on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (header) {
        header.style.backgroundColor = window.scrollY > 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 1)';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('nav') && !e.target.closest('button')) {
        setIsMenuOpen(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <GlobalStyle />
      <Header>
        <HeaderLogo href="https://ual.sg" target="_blank" rel="noopener noreferrer">
          <StaticImage
            src="../images/icon_ual.webp"
            alt="Thermal Affordance Logo"
            placeholder="blurred"
            layout="fixed"
            width={150}
            height={80}
            objectFit="cover"
            objectPosition="center 25%"
          />
        </HeaderLogo>
        <HamburgerButton 
          $isOpen={isMenuOpen} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </HamburgerButton>
        <Nav $isOpen={isMenuOpen}>
          <NavLink href="#home" onClick={scrollToSection('home')}>Home</NavLink>
          <NavLink href="#concept" onClick={scrollToSection('concept')}>Concept Description</NavLink>
          <NavLink href="#method" onClick={scrollToSection('method')}>Paper Introduction</NavLink>
          <NavLink href="#map" onClick={scrollToSection('map')}>Dataset & Mapping</NavLink>
          <NavLink href="#research" onClick={scrollToSection('research')}>In Research</NavLink>
          <NavLink href="#team" onClick={scrollToSection('team')}>Team & Contact</NavLink>
        </Nav>
      </Header>
      <Sidebar>
        <SidebarLink href="#home" onClick={scrollToSection('home')}><SidebarNumber>1.</SidebarNumber>Cover</SidebarLink>
        <SidebarLink href="#concept" onClick={scrollToSection('concept')}><SidebarNumber>2.</SidebarNumber>Thermal Affordance</SidebarLink>
        <SidebarLink href="#property" onClick={scrollToSection('property')}><SidebarNumber>3.</SidebarNumber>Property of Thermal Affordance</SidebarLink>
        <SidebarLink href="#method" onClick={scrollToSection('method')}><SidebarNumber>4.</SidebarNumber>Computational Framework of VATA</SidebarLink>
        <SidebarLink href="#planning" onClick={scrollToSection('planning')}><SidebarNumber>5.</SidebarNumber>Planning Application of VATA</SidebarLink>
        <SidebarLink href="#map" onClick={scrollToSection('map')}><SidebarNumber>6.</SidebarNumber>Dataset & Mapping</SidebarLink>
        <SidebarLink href="#research" onClick={scrollToSection('research')}><SidebarNumber>7.</SidebarNumber>Thermal Affordance in Research</SidebarLink>
        <SidebarLink href="#team" onClick={scrollToSection('team')}><SidebarNumber>8.</SidebarNumber>Team & Contact</SidebarLink>
      </Sidebar>
      <MainContent>{children}</MainContent>
    </>
  )
}

export default Layout