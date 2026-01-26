import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  padding: 0.5rem 0;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    padding: 0.75rem 0;
  }
`

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: ${(p) => (p.$active ? '#2563eb' : '#666')};
  padding: 0.5rem 1rem;
  min-width: 60px;
  transition: color 0.2s;

  @media (min-width: 768px) {
    min-width: 80px;
  }
`

const NavIcon = styled.span`
  font-size: 1.5rem;
  margin-bottom: 0.25rem;

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`

const NavLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;

  @media (min-width: 768px) {
    font-size: 0.875rem;
  }
`

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '홈', icon: '🏠' },
    { path: '/chapters', label: '학습', icon: '📚' },
    { path: '/quiz', label: '연습', icon: '✏️' },
    { path: '/exam', label: '시험', icon: '📝' },
    { path: '/statistics', label: '통계', icon: '📊' },
    { path: '/admin', label: '관리', icon: '⚙️' },
  ]

  return (
    <Nav>
      {navItems.map((item) => (
        <NavItem
          key={item.path}
          to={item.path}
          $active={location.pathname === item.path}
        >
          <NavIcon>{item.icon}</NavIcon>
          <NavLabel>{item.label}</NavLabel>
        </NavItem>
      ))}
    </Nav>
  )
}

export default Navigation

