import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { useLanguage } from '../hooks/useLanguage'
import BlockingLoader from './BlockingLoader'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const { t, idioma } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [isDarkMode])

  useEffect(() => {
    document.documentElement.setAttribute('lang', idioma)
  }, [idioma])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="layout-container">
      <BlockingLoader />
      <div className="top-bar">
        <div className="barbershop-brand">
          <div className="logo-container">
            <img src="/src/assets/logo-barberia.jpeg" alt="Nuñez Barber Shop" className="barbershop-logo" />
          </div>
          <span className="brand-text">NUÑEZ BARBER SHOP</span>
        </div>
        <div className="menu-container" onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => setMenuOpen(false)}>
          <button className="menu-button">
            ☰ {t('dashboard')}
          </button>
          <div className={`dropdown-menu ${menuOpen ? 'show' : ''}`}>
            <a 
              href="#" 
              className={isActive('/dashboard') ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
            >
              📊 {t('dashboard')}
            </a>
            {user?.rol !== 'BARBERO' && (
              <>
                <a 
                  href="#" 
                  className={isActive('/clientes') ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); navigate('/clientes'); }}
                >
                  👥 {t('clientes')}
                </a>
                <a 
                  href="#" 
                  className={isActive('/servicios') ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); navigate('/servicios'); }}
                >
                  ✂️ {t('servicios')}
                </a>
                <a 
                  href="#" 
                  className={isActive('/empleados') ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); navigate('/empleados'); }}
                >
                  👨‍💼 {t('empleados')}
                </a>
              </>
            )}
            <a 
              href="#" 
              className={isActive('/citas') ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigate('/citas'); }}
            >
              📅 {t('citas')}
            </a>
            {user?.rol === 'ADMIN' && (
              <a 
                href="#" 
                className={isActive('/configuracion') ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); navigate('/configuracion'); }}
              >
                ⚙️ {t('configuracion')}
              </a>
            )}
            <a 
              href="#" 
              className="menu-logout"
              onClick={(e) => { e.preventDefault(); handleLogout(); }}
            >
              🚪 {t('cerrarSesion')}
            </a>
          </div>
        </div>
        <button 
          className="theme-toggle"
          onClick={toggleDarkMode}
          title={isDarkMode ? t('modoClaro') : t('modoOscuro')}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <div className="user-info">
          <div className="avatar">{user?.nombre.substring(0, 2).toUpperCase() || 'AD'}</div>
          <span>{user?.nombre || 'Admin'}</span>
        </div>
      </div>
      <div className="layout-content">
        {children}
      </div>
    </div>
  )
}