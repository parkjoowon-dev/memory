import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import Navigation from './Navigation'

interface LayoutProps {
  children: ReactNode
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const Main = styled.main<{ $full: boolean }>`
  flex: 1;
  max-width: ${(p) => (p.$full ? '100%' : '100%')};
  margin: ${(p) => (p.$full ? '0' : '0 auto')};
  padding: ${(p) => (p.$full ? '0' : '1rem')};
  padding-bottom: ${(p) => (p.$full ? '0' : '80px')}; /* 네비게이션 공간 확보 */

  @media (min-width: 768px) {
    max-width: ${(p) => (p.$full ? '100%' : '768px')};
    padding: ${(p) => (p.$full ? '0' : '2rem')};
    padding-bottom: ${(p) => (p.$full ? '0' : '100px')};
  }
`

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const isFullWidthPage = location.pathname.startsWith('/study') || location.pathname.startsWith('/quiz')

  return (
    <Root>
      <Main $full={isFullWidthPage}>{children}</Main>
      <Navigation />
    </Root>
  )
}

export default Layout

