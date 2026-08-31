import React, { useEffect, useState } from "react"
import { withPrefix } from "gatsby"
import styled, { createGlobalStyle } from "styled-components"
import { StaticImage } from "gatsby-plugin-image"

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.65; color: #152639; background: #f6f8fa; margin: 0; }
  img { max-width: 100%; height: auto; }
  a { color: #155eae; text-underline-offset: 3px; }
  button, select, input { font: inherit; }
  button, a, select, summary { -webkit-tap-highlight-color: transparent; }
  :focus-visible { outline: 3px solid #2975c4; outline-offset: 4px; }
  section[id] { scroll-margin-top: 88px; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  }
`
const Header = styled.header`
  height: 76px; position: sticky; top: 0; z-index: 1000; background: #fffffff5;
  border-bottom: 1px solid #dce2e9; backdrop-filter: blur(10px);
  > div { max-width: 1280px; height: 100%; margin: auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  @media (max-width: 760px) { height: 68px; > div { padding: 0 16px; } }
  @media (max-width: 400px) { > div { gap: 8px; } }
`
const Logos = styled.div`
  display: flex; align-items: center; gap: 18px; flex-shrink: 0;
  a { display: flex; align-items: center; min-height: 44px; }
  @media (max-width: 400px) { gap: 10px; }
`
const Nav = styled.nav`
  display: flex; align-items: center; gap: 22px;
  a { display: flex; align-items: center; min-height: 44px; color: #586577; text-decoration: none; font-size: 14px; font-weight: 600; border-bottom: 2px solid transparent; }
  a:hover, a[aria-current] { color: #155eae; border-color: #155eae; }
  @media (max-width: 1000px) { gap: 14px; }
  @media (max-width: 760px) {
    display: ${p => p.$open ? 'flex' : 'none'}; position: absolute; top: 68px; left: 0; right: 0;
    padding: 16px 24px; background: #fff; border-bottom: 1px solid #dce2e9; box-shadow: 0 12px 24px #14263a12;
    align-items: stretch; flex-direction: column; gap: 4px;
  }
`
const MenuButton = styled.button`
  display: none; min-height: 44px; padding: 8px 12px; border: 1px solid #dce2e9; border-radius: 6px; background: white; color: #152639;
  @media (max-width: 760px) { display: block; }
  @media (max-width: 400px) { padding: 8px; }
`
const Skip = styled.a`
  position: fixed; top: -100px; left: 12px; z-index: 1002; padding: 10px 16px; background: #fff;
  &:focus { top: 10px; }
`
const links = [['home', 'Overview'], ['map', 'Explore data'], ['concept', 'About VATA'], ['method', 'Method'], ['research', 'Research'], ['team', 'Team']]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('main section[id]'))
    const update = () => {
      let current = sections[0]?.id || ''
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= 150) current = section.id
      }
      if (current === 'property') current = 'concept'
      if (current === 'planning') current = 'method'
      setActive(current)
    }
    update(); window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  useEffect(() => {
    const close = event => {
      if (event.key === 'Escape') {
        setOpen(false)
        document.getElementById('menu-toggle')?.focus()
      } else if (event.type === 'click' && !event.target.closest('header')) setOpen(false)
    }
    if (open) { document.addEventListener('keydown', close); document.addEventListener('click', close) }
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('click', close) }
  }, [open])
  const navigate = (event, id) => {
    setOpen(false)
    const target = document.getElementById(id)
    if (!target) return // Preserve navigation to the homepage when used from /dataset.
    event.preventDefault()
    const url = new URL(window.location.href); url.hash = id
    window.history.pushState(window.history.state, '', url)
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    setActive(id)
  }
  return <>
    <GlobalStyle />
    <Skip href="#main-content">Skip to content</Skip>
    <Header><div>
      <Logos>
        <a href={withPrefix('/')} aria-label="Thermal Affordance home"><StaticImage src="../images/DoA_Logo_white.jpg" alt="NUS Department of Architecture" width={105} height={48} layout="fixed" imgStyle={{ objectFit: 'contain' }} /></a>
        <a href="https://ual.sg" target="_blank" rel="noopener noreferrer" aria-label="Urban Analytics Lab"><StaticImage src="../images/UAL_Logo_white.jpg" alt="Urban Analytics Lab" width={103} height={48} layout="fixed" imgStyle={{ objectFit: 'contain' }} /></a>
      </Logos>
      <MenuButton id="menu-toggle" type="button" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(value => !value)}>{open ? 'Close' : 'Menu'}</MenuButton>
      <Nav id="primary-nav" aria-label="Primary navigation" $open={open}>
        {links.map(([id, label]) => <a key={id} href={withPrefix(`/#${id}`)} aria-current={active === id ? 'location' : undefined} onClick={event => navigate(event, id)}>{label}</a>)}
      </Nav>
    </div></Header>
    <main id="main-content" tabIndex={-1}>{children}</main>
  </>
}
